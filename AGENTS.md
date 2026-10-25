# PREMILY — AI Agent Guide & Architecture Blueprint

PREMILY is a seller-focused e-commerce SaaS platform for Bangladesh. Sellers create their own branded online stores, manage products and inventory, and handle their own customer fulfillment. PREMILY provides the underlying technology.

**Business Model:** ৳150 per month per seller (first month free trial). No commissions or platform-held payment escrow in the initial product. Prioritize seller retention, store launches, and frictionless customer checkout.

---

## 1. Non-Negotiable Product Rules

1. **Dual Homepage Paradigm**:
   - **Marketplace Home (`/`)**: Central multi-store discovery, flash sales, categories, and curated rails.
   - **Dedicated Storefront (`/[storeSlug]`)**: Branded with the seller's custom logo, hero banner, brand accent color, bio, and catalog. Shoppers should feel like the seller owns the website.
2. **Mart Badge Strictness**:
   - `isPremilyMart` is strictly controlled by PREMILY Admins for official brand partners (e.g. RFL, CLICK, PREMILY Mart).
   - Ordinary sellers never get the Mart badge. Never infer or toggle it from store names.
3. **Seller Verification**:
   - Independent from Mart status (`UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`). Requires trade license or NID review.
4. **Phone-First Authentication**:
   - In Bangladesh, mobile numbers (`01[3-9]\d{8}`) are mandatory.
   - `email` is optional (`String? @unique`). Login accepts either phone number or email.
5. **District-Based Shipping & Per-Store Delivery**:
   - Bangladesh 64-district delivery. Default platform rates: ৳70 Inside Dhaka (1–2 days), ৳150 Outside Dhaka (3–5 days).
   - Sellers can customize their home district and delivery fees (`insideDistrictCost`, `outsideDistrictCost`, and district overrides).
   - Checkouts with items from multiple stores charge shipping per-store (sellers fulfill independently).

---

## 2. Design System & Theming

- **Luxury Palette**:
  - Headings: `Cinzel` serif font (`font-serif`)
  - Body & UI: `Plus Jakarta Sans` sans-serif (`font-sans`)
  - Background: Cream (`#FAF3E8` / `var(--background)`)
  - Accent / Primary: Gold & Deep Gold (`#B8924B`, `#D4B375`, `.gbtn` gradient)
  - Dark Elements: Espresso Dark (`#1E1916`)
  - Card Borders: Subtle Gold Border (`#EADFCD`)
- **Theme Scalability**:
  - Always use semantic CSS variables and Tailwind tokens defined in [`apps/web/app/globals.css`](file:///r:/ALL%20PROJECTS/Premily%20-%20main/Premily/apps/web/app/globals.css).
  - Avoid hardcoding static hex colors in components so future themes (Dark, Noir) work automatically.

---

## 3. Project Structure & Key Routes

```text
Premily/
├── apps/
│   ├── api/ (Express 5 + TypeScript + Prisma 7 + PostgreSQL 17)
│   │   ├── prisma/schema.prisma     # Master relational schema
│   │   └── src/modules/
│   │       ├── auth/                # Phone-first registration & JWT cookies
│   │       ├── products/            # Public discovery, search, filter, sort
│   │       ├── orders/              # Multi-store checkout & stock decrement
│   │       ├── shipping/            # 64-district rates & store overrides
│   │       ├── reviews/             # Verified buyer reviews & rating stats
│   │       ├── stores/              # Storefront profile & branding settings
│   │       ├── campaigns/           # Flash sales & seasonal promotions
│   │       └── admin/               # Mart badge & verification governance
│   └── web/ (Next.js 16 + React 19 + Tailwind v4)
│       ├── app/
│       │   ├── page.tsx             # Main Marketplace Homepage
│       │   ├── [storeSlug]/page.tsx # Dedicated Branded Seller Homepage
│       │   ├── products/page.tsx    # Catalog & Filter Sidebar
│       │   ├── products/[slug]/     # Luxury Single Product View
│       │   ├── checkout/page.tsx    # 64-District Checkout (COD/bKash/Nagad)
│       │   ├── seller/page.tsx      # Seller Operations Panel
│       │   └── admin/page.tsx       # PREMILY Superadmin Panel
│       └── components/
│           ├── badges/              # MartBadge, VerifiedBadge, DiscountBadge
│           ├── product/             # ImageGallery, DeliveryEstimator, ReviewsSection
│           └── ui/                  # RatingStars, reusable inputs, buttons
```

---

## 4. Current State (~80% Production Ready)

- Core backend routes, schemas, database models, and baseline migrations are compiled and verified.
- Master frontend routes are built with realistic fallbacks and luxury styling.
- Both `api` and `web` pass TypeScript checks (`tsc --noEmit`) with 0 errors.

---

## 5. Immediate Future Roadmap for Next AI / Developers

1. **Seed Database with Realistic Data**:
   - Run `pnpm --filter api exec tsx prisma/seed.ts` with stores, products, reviews, and district rates so API returns live data instead of UI fallbacks.
2. **Automated MFS Payment Gateways**:
   - Integrate bKash / Nagad merchant checkout APIs (currently supports manual MFS transaction ID submission + seller/admin verification).
3. **Cloud Storage for Product Images**:
   - Add Cloudflare R2 or AWS S3 presigned URL upload for seller product photos and banners.
4. **Seller Subscription Expiration Logic**:
   - Background worker or cron job to check `SellerSubscription.trialEndsAt` and handle renewal billing (৳150/mo).
5. **Customer Dashboard**:
   - `/account/orders` page to view order statuses (`PENDING` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`).

---

## 6. How to Run

```bash
# Terminal 1 - API Server
pnpm --filter api dev

# Terminal 2 - Frontend Web
pnpm --filter web dev
```
