# AllstoreZA – DynamoDB Table Schemas

All tables use **on-demand billing** (PAY_PER_REQUEST) — zero cost when idle,
scales automatically. No provisioned capacity to manage.

---

## Table: `allstoreza-users`
| Attribute        | Type   | Key        | Notes                          |
|-----------------|--------|------------|--------------------------------|
| userId          | String | PK (Hash)  | e.g. `user_987654321`          |
| createdAt       | String |            | ISO timestamp                  |
| onboardingType  | String |            | `personal` / `guest`           |
| avatarCanvasUrl | String |            | S3 presigned or Unsplash URL   |
| profile         | Map    |            | `{heightCm, weightKg, ...}`    |

**GSI:** none needed for MVP

---

## Table: `allstoreza-wardrobe`
| Attribute         | Type   | Key        | Notes                        |
|------------------|--------|------------|------------------------------|
| itemId           | String | PK (Hash)  | e.g. `closet_01`             |
| userId           | String | SK (Sort)  | links to users table         |
| title            | String |            |                              |
| layerType        | String |            | `outer_body / inner_body / lower_body` |
| processedImageUrl| String |            | S3 URL (bg-removed PNG)      |
| uploadedAt       | String |            | ISO timestamp                |

**GSI:** `userId-index` on `userId` → fetch all wardrobe items for a user

---

## Table: `allstoreza-catalog`
| Attribute           | Type   | Key        | Notes                     |
|--------------------|--------|------------|---------------------------|
| itemId             | String | PK (Hash)  | e.g. `zara_blazer_01`     |
| storeSlug          | String | SK (Sort)  | e.g. `zara`               |
| storeName          | String |            |                           |
| title              | String |            |                           |
| priceZAR           | Number |            |                           |
| layerType          | String |            |                           |
| productImageUrl    | String |            |                           |
| affiliateCheckoutUrl| String |           |                           |
| isHotDeal          | Bool   |            |                           |
| isNew              | Bool   |            |                           |
| isTrending         | Bool   |            |                           |

**GSI:** `storeSlug-index` on `storeSlug` → fetch all items per store

---

## Table: `allstoreza-stores`
| Attribute  | Type   | Key       | Notes                         |
|-----------|--------|-----------|-------------------------------|
| storeId   | String | PK (Hash) | e.g. `zara`                   |
| name      | String |           |                               |
| storeUrl  | String |           |                               |
| active    | Bool   |           | user-toggled per session (or persist here later) |

---

## Free Tier limits (on-demand)
- **25 GB** storage total across all tables
- **200 million** read/write request units per month (first 12 months)
- After 12 months: ~$1.25 per million writes, $0.25 per million reads
- For MVP traffic this stays effectively **R0.00**
