# PREMILY — Login & Signup Experience and Architecture Blueprint

Build a fully-functional, responsive Login & Sign Up page (`/login`) following the prototype in `Frontend-design-demo/login-page.html`, wire all header navigation points, and prepare the relational database persistence strategy.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been synthesized from your answers:
> 
> - **Confirmed Flow**: We are building a dedicated Next.js route at `apps/web/app/login/page.tsx` with smooth tab toggling between **Login** and **Create Account**, matching `Frontend-design-demo/login-page.html`.
> - **Confirmed Navigation**: Updating `SiteHeader.tsx` so "Login / Sign up" is visible and accessible on mobile, tablet, and desktop (currently hidden on smaller screens).
> - **Confirmed Design Standards**: Strictly adhering to `apps/web/app/globals.css` luxury palette (`Cinzel` serif, `Plus Jakarta Sans`, Cream `#FAF3E8`, Gold gradient `.gbtn`, Subtle Gold Card borders `#EADFCD`).
> - **Data Persistence Strategy**: You confirmed a full-stack relational database with PostgreSQL / Cloud SQL. In Phase 3, we will trigger the Cloud SQL provisioning gate and connect user records to PostgreSQL via Drizzle ORM.

---

### 1. Overview & Core Concept

- **What It Delivers**: A unified, luxury authentication portal (`/login`) where Bangladeshi buyers and sellers can sign in or create an account using phone numbers (`01[3-9]...`) or email addresses, toggle password visibility, view live validation feedback, and securely authenticate.
- **Target Audience**: Bangladeshi shoppers and independent boutique sellers who expect a frictionless, phone-first login experience with high-end luxury aesthetics.
- **Key Value**: Replaces broken 404 links from the homepage with a responsive, polished portal that seamlessly integrates with the rest of the PREMILY marketplace.

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **Homepage Navigation**: Clicking "Login / Sign up" in the top header (desktop or mobile) navigates directly to `/login`.
2. **Interactive Tab Switching**: 
   - Tab 1: **Login** — Phone/Email input, password input with show/hide toggle, "Forgot password?" modal trigger, and "Sign In" button.
   - Tab 2: **Create Account** — Full Name, Bangladeshi mobile number / email, password creation, role badge selection (Buyer / Store Seller), and "Create Account" button.
3. **Form Validation & Feedback**:
   - Phone format detection for Bangladesh carriers (`013` to `019`).
   - Clear inline error messages and toast feedback instead of harsh page reloads.
4. **Post-Auth Redirection**: On successful authentication, automatically redirects to the previous page or dashboard (`/seller` for vendors, `/` for shoppers).

#### B. Visual Identity & Styling
- **Canvas & Surfaces**:
  - Background: Cream (`#FAF3E8` / `var(--color-cream)`)
  - Auth Box: Centered luxury card (`.premily-card` / `#FFFFFF` with `1px solid #EADFCD`, rounded-2xl, soft gold elevation shadow)
- **Typography**:
  - Headings & Logo: `Cinzel` serif (`font-serif font-bold tracking-widest text-dark`)
  - Inputs & Copy: `Plus Jakarta Sans` (`font-sans text-dark`)
- **Interactive Accents**:
  - Primary Action Button: `.gbtn` gold gradient with smooth hover brightness and micro-lift
  - Active Tab Underline: Deep Gold (`#B8924B`)
  - Input Focus Rings: `focus:border-deep outline-none`
- **Social Connect**: Clean Google & Facebook authentication buttons matching the demo prototype.

---

### 3. Key Product Decisions & Trade-Offs

- **Dedicated Route (`/login`) vs. Modal Overlay**:
  - *Chosen Approach*: Dedicated `/login` page with URL query support (`/login?tab=signup&redirect=/checkout`).
  - *Why*: Allows direct linking from checkout, seller onboarding, marketing emails, and mobile browsers without modal clipping or URL loss.
- **Phone-First Bangladeshi Auth**:
  - *Chosen Approach*: Supports both 11-digit Bangladeshi mobile numbers (`017XXXXXXXX`) and standard email addresses in the same field.
  - *Why*: Aligns with Bangladesh market reality where over 85% of shoppers authenticate via mobile.
- **Client State with Resilient Backend Hookup**:
  - *Chosen Approach*: Client-side interactive authentication state with session persistence and cookies, wired to verify against the API when available and fall back gracefully in offline/standalone preview.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       apps/web                              │
│                                                             │
│   ┌─────────────────────┐       ┌───────────────────────┐   │
│   │   SiteHeader.tsx    │──────>│   /login/page.tsx     │   │
│   │ (Desktop & Mobile)  │       │ (Login & Signup Tabs) │   │
│   └─────────────────────┘       └───────────┬───────────┘   │
│                                             │               │
│                                   ┌─────────▼───────────┐   │
│                                   │ Form State & Auth   │   │
│                                   │ Hook (Phone / Pass) │   │
│                                   └─────────┬───────────┘   │
└─────────────────────────────────────────────┼───────────────┘
                                              │ (API Proxy / Auth)
                                    ┌─────────▼───────────┐
                                    │      Database       │
                                    │ Cloud SQL (Postgres)│
                                    │   via Drizzle ORM   │
                                    └─────────────────────┘
```

#### Step-by-Step Execution Plan:
1. **Create `apps/web/app/login/page.tsx`**:
   - Implement the complete interactive Login and Create Account view based on `Frontend-design-demo/login-page.html`.
   - Add stateful tab switching, password visibility toggle, Bangladeshi phone validation, and responsive layout.
2. **Update `apps/web/components/SiteHeader.tsx`**:
   - Ensure the "Login / Sign up" link is properly accessible across all breakpoints (mobile drawer/bar + desktop header).
   - Display active user badge or initials when logged in.
3. **Database & Persistence Integration**:
   - Initiate the Cloud SQL setup flow via AI Studio tools as requested by the user, provisioning PostgreSQL and configuring Drizzle ORM schemas.
4. **Verification & Cross-Browser Audit**:
   - Verify layout responsiveness, run `lint_applet` and `compile_applet` to confirm clean compilation.
