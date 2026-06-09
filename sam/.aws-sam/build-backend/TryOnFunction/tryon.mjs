/**
 * AllstoreZA – AI Try-On Lambda Handler (v2)
 * Runtime:  Node.js 20.x
 * Trigger:  Function URL (no auth)
 *
 * FIXES from v1:
 *   1. Removed /--replicas/0/ from endpoint (targets base space URL)
 *   2. Downloads images and converts to base64 (HF needs data, not URLs)
 *   3. Handles blob: URLs by rejecting them early with clear error
 *   4. Retries with backoff (2 attempts)
 *   5. Uses Gradio queue API for long-running inference
 *   6. Returns honest errors — no fake success:true on failure
 *   7. 55s timeout to survive HF cold starts (set Lambda timeout to 60s)
 *
 * ENV VARS:
 *   HF_TRYON_URL  – Gradio space base URL (no /api/predict suffix)
 *                   Default: https://yisol-idm-vton.hf.space
 */

const HF_BASE =
  (process.env.HF_TRYON_URL || 'https://yisol-idm-vton.hf.space')
    .replace(/\/+$/, '');

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function reply(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

/**
 * Download an image URL and return a base64 data URI.
 * Rejects blob: URLs (browser-only) with a clear message.
 */
async function imageToBase64(url, label = 'image') {
  if (!url || typeof url !== 'string') {
    throw new Error(`${label}: empty or invalid URL`);
  }

  if (url.startsWith('blob:')) {
    throw new Error(
      `${label}: received a blob: URL which only exists in the browser. ` +
      `Upload the actual image file or use a hosted URL (S3, Unsplash, etc).`
    );
  }

  // Already a data URI — pass through
  if (url.startsWith('data:image/')) {
    return url;
  }

  const res = await fetch(url, {
    signal: AbortSignal.timeout(12_000),
    headers: { 'User-Agent': 'AllstoreZA-TryOn/2.0' },
  });

  if (!res.ok) {
    throw new Error(`${label}: failed to download (${res.status} ${res.statusText})`);
  }

  const contentType = res.headers.get('content-type') || 'image/png';
  const mime = contentType.split(';')[0].trim();
  const buffer = await res.arrayBuffer();
  const b64 = Buffer.from(buffer).toString('base64');
  return `data:${mime};base64,${b64}`;
}

/**
 * Sleep utility for retry backoff
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Try the synchronous /api/predict endpoint first.
 * Falls back to queue-based approach if it fails.
 */
async function callGradioPredict(userB64, garmentB64) {
  const payload = {
    data: [
      { background: userB64, layers: [], composite: null }, // ImageEditor format
      garmentB64,                                            // garment image
      'High quality virtual try-on',                         // description
      true,                                                  // use auto-crop
      true,                                                  // use auto-mask
      30,                                                    // denoising steps
      42,                                                    // seed
    ],
  };

  // Attempt 1: Direct /api/predict (works if space is warm)
  try {
    const res = await fetch(`${HF_BASE}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(50_000),
    });

    if (res.ok) {
      const data = await res.json();
      const outputUrl = extractOutputUrl(data);
      if (outputUrl) return outputUrl;
    }

    // If 503/Queue-full, fall through to queue approach
    if (res.status !== 503) {
      const text = await res.text().catch(() => '');
      console.warn(`/api/predict returned ${res.status}: ${text.slice(0, 200)}`);
    }
  } catch (err) {
    console.warn('/api/predict failed:', err.message);
  }

  // Attempt 2: Queue-based approach (handles cold starts)
  return callGradioQueue(payload);
}

/**
 * Queue-based Gradio API: POST /queue/join → poll /queue/data
 * Better for cold-start scenarios where inference takes >30s
 */
async function callGradioQueue(payload) {
  // Join queue
  const joinRes = await fetch(`${HF_BASE}/queue/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      fn_index: 0,
      session_hash: `allstoreza_${Date.now()}`,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!joinRes.ok) {
    const err = await joinRes.text().catch(() => '');
    throw new Error(`Queue join failed (${joinRes.status}): ${err.slice(0, 200)}`);
  }

  const joinData = await joinRes.json();
  const eventId = joinData.event_id || joinData.hash;

  if (!eventId) {
    throw new Error('Queue join returned no event_id');
  }

  // Poll for result (up to 45 seconds)
  const pollStart = Date.now();
  const maxPollMs = 45_000;

  while (Date.now() - pollStart < maxPollMs) {
    await sleep(2000);

    try {
      const statusRes = await fetch(
        `${HF_BASE}/queue/status/${eventId}`,
        { signal: AbortSignal.timeout(8_000) }
      );

      if (!statusRes.ok) continue;
      const statusData = await statusRes.json();

      if (statusData.status === 'COMPLETE' || statusData.status === 'complete') {
        const outputUrl = extractOutputUrl(statusData.output || statusData);
        if (outputUrl) return outputUrl;
        throw new Error('Queue completed but output missing');
      }

      if (statusData.status === 'FAILED' || statusData.status === 'failed') {
        throw new Error(`Queue processing failed: ${statusData.error || 'unknown'}`);
      }

      // Still processing — continue polling
    } catch (err) {
      if (err.message.includes('Queue')) throw err;
      // Network glitch — retry poll
    }
  }

  throw new Error('Queue timed out after 45 seconds');
}

/**
 * Extract the output image URL from various Gradio response formats.
 * Handles both data[0].url and data[0] as direct URL string.
 */
function extractOutputUrl(data) {
  if (!data) return null;

  // Standard format: { data: [{ url: "..." }] }
  const d = data.data || data;
  if (Array.isArray(d) && d.length > 0) {
    if (typeof d[0] === 'string' && d[0].startsWith('http')) return d[0];
    if (d[0]?.url) return d[0].url;
    if (d[0]?.path) return `${HF_BASE}/file=${d[0].path}`;
  }

  return null;
}


// ── Handler ─────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  // CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  // Only POST
  if (event.requestContext?.http?.method !== 'POST') {
    return reply(405, { success: false, error: 'Method not allowed' });
  }

  // Parse body
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return reply(400, { success: false, error: 'Invalid JSON body' });
  }

  const { userImageUrl, garmentImageUrl, category } = body;

  if (!userImageUrl || !garmentImageUrl) {
    return reply(400, {
      success: false,
      error: 'Missing userImageUrl or garmentImageUrl',
    });
  }

  // ── Step 1: Convert images to base64 ────────────────────────────────────
  let userB64, garmentB64;
  try {
    console.log('Downloading images...');
    [userB64, garmentB64] = await Promise.all([
      imageToBase64(userImageUrl, 'userImage'),
      imageToBase64(garmentImageUrl, 'garmentImage'),
    ]);
    console.log('Images converted to base64');
  } catch (err) {
    console.error('Image download failed:', err.message);
    return reply(400, {
      success: false,
      error: `Image processing failed: ${err.message}`,
      errorType: 'IMAGE_DOWNLOAD',
    });
  }

  // ── Step 2: Call Gradio with retry ──────────────────────────────────────
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`VTO attempt ${attempt}/${maxRetries}...`);
      const outputUrl = await callGradioPredict(userB64, garmentB64);

      console.log('VTO success:', outputUrl?.slice(0, 80));
      return reply(200, {
        success: true,
        outputUrl,
        overlayUrl: garmentImageUrl,
        category: category || 'unknown',
      });
    } catch (err) {
      console.warn(`Attempt ${attempt} failed:`, err.message);

      if (attempt < maxRetries) {
        const backoff = attempt * 3000;
        console.log(`Retrying in ${backoff}ms...`);
        await sleep(backoff);
      }
    }
  }

  // ── All attempts failed — return honest error ───────────────────────────
  console.error('All VTO attempts failed');

  return reply(503, {
    success: false,
    error: 'Try-on service is temporarily unavailable. Please try again in a moment.',
    errorType: 'VTO_UNAVAILABLE',
    // Include garment URL so frontend can use CSS overlay fallback
    garmentImageUrl,
    category: category || 'unknown',
  });
};
