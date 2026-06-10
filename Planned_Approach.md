## Planned Approach of AllstoreZA Product Review, Strategy & Roadmap

treat it like a proper code review sprint rather than just a product review.

My plan:

Pass 1 — Architecture Audit

- Frontend structure
- State management
- Store/product data flow
- VTO pipeline tracing
- AWS readiness
- Dead code & duplicate components

Pass 2 — Phase 1 Implementation

- Remove duplicate Manage Stores
- Cart
- Wishlist
- Search
- Filters
- Product card redesign
- One item per thumbnail
- Non-wrapping action buttons
- Guest-mode persistence

Pass 3 — VTO Deep Dive

We'll figure out whether:

- the model endpoint is failing
- the payload is malformed
- image preprocessing is broken
- the avatar format is incompatible
- the VTO model itself is the wrong fit

If the VTO route is a dead end, I'll help design an image-generation fallback architecture that still preserves the core user experience.

Pass 4 — Production Roadmap

I'll separate recommendations into:

- Do Now
- Before Beta
- Before Launch
- Nice-to-Have

That prevents the roadmap from turning into a giant feature graveyard.

One thing to think about:

The traditional fabric idea is stronger than it first appears. It doesn't belong in Phase 1, but it could eventually become an entire category:

- Retail Fashion
- Traditional Wear
- Wedding Wear
- Custom Tailoring
- Fabric Discovery

Very few international competitors would have that local angle.
