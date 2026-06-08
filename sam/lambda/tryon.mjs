/**
 * AllstoreZA – AI Try-On Lambda Handler
 * Runtime:  Node.js 20.x
 * Trigger:  API Gateway HTTP API (payload format 2.0) or Function URL
 * IAM:      No extra policies needed (HF is public, no AWS service calls)
 *
 * ENV VARS (set in Lambda console or via SAM/CDK):
 *   HF_TRYON_URL  – Hugging Face Space endpoint (can be swapped without redeploy)
 *                   Default: https://yisol-idm-vton.hf.space/--replicas/0/api/predict
 */

const HF_URL =
  process.env.HF_TRYON_URL ||
  'https://yisol-idm-vton.hf.space/--replicas/0/api/predict';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  // Only accept POST
  if (event.requestContext?.http?.method !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: 'Invalid JSON body' }),
    };
  }

  const { userImageUrl, garmentImageUrl } = body;

  if (!userImageUrl || !garmentImageUrl) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: 'Missing userImageUrl or garmentImageUrl' }),
    };
  }

  // Call Hugging Face IDM-VTON
  try {
    const hfRes = await fetch(HF_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          { background: userImageUrl, layers: [], composite: null },
          garmentImageUrl,
          'Try-on overlay asset',
          true,
          true,
          'Unisex',
          4,
          2.5,
        ],
      }),
      signal: AbortSignal.timeout(28_000), // Lambda default timeout buffer
    });

    const contentType = hfRes.headers.get('content-type') || '';
    const text = await hfRes.text();

    let parsed;
    if (
      contentType.includes('application/json') ||
      text.trim().startsWith('{') ||
      text.trim().startsWith('[')
    ) {
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.warn('HF response parse failed:', e.message);
      }
    }

    const outputUrl = parsed?.data?.[0]?.url;

    if (outputUrl) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, outputUrl, overlayUrl: garmentImageUrl }),
      };
    }
  } catch (err) {
    console.error('HF call failed:', err?.message || err);
  }

  // Graceful fallback — return user image unchanged so UI doesn't break
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: true,
      outputUrl: userImageUrl,
      overlayUrl: garmentImageUrl,
      fallback: true,
    }),
  };
};
