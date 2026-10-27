# Kesh Squad — Technical Architecture

| Field | Value |
|---|---|
| Status | Draft v0.1 — awaiting owner approval |
| Date | 27 Oct 2026 |
| Depends on | `PRODUCT_REQUIREMENTS.md` |

---

## 1. Architecture at a glance

```
                ┌───────────────────────────────────────────────┐
  Browser       │  React 18/19 + TypeScript SPA (Vite build)     │
  (phone/       │  Tailwind · Framer Motion · Lucide React       │
   desktop)     │                                               │
                │  UI (features/*)                               │
                │     │  hooks (TanStack Query*)                 │
                │     ▼                                          │
                │  Service contracts  (services/contracts)       │
                │     │                       │                  │
                │  Mock services          Supabase services      │
                │  (Milestone A)          (Milestone B+)         │
                └─────┼───────────────────────┼─────────────────┘
                      │ in-memory +            │ HTTPS / WebSocket
                      │ localStorage           │ (publishable key + user JWT)
                      ▼                        ▼
                 fixtures/*.ts      ┌──────────────────────────────┐
                                    │ Supabase (Free tier)          │
                                    │  • Auth (email, guest*, OAuth*)│
                                    │  • Postgres + RLS + RPCs       │
                                    │  • Storage (listing images)    │
                                    │  • Realtime (messages)         │
                                    └──────────────────────────────┘
  Static hosting: Cloudflare Pages (free) — serves the built SPA.
  Cloudflare Workers: none planned; only if a server-side secret is
  genuinely required (e.g. YouTube API key — see OQ-11).
  (* = pending decision, see OPEN_QUESTIONS.md)
```

**Key principle:** the UI never talks to Supabase directly. It calls typed **service contracts**. Milestone A ships mock implementations; Milestone B adds Supabase implementations of the same contracts. Switching is one environment variable, so the frontend is not rewritten when the backend arrives.

---

## 2. Technology stack

### 2.1 Mandated (from project brief)
| Layer | Choice | Notes |
|---|---|---|
| Framework | React + TypeScript (strict) | Function components, hooks |
| Build | Vite | Fast dev server, static output for Pages |
| Styling | Tailwind CSS | Design tokens from §5 mapped into Tailwind theme |
| Motion | Framer Motion | Restrained; honours `prefers-reduced-motion` |
| Icons | Lucide React | Tree-shaken imports only |
| Backend | Supabase: Postgres, Auth, Storage, Realtime | Free tier |
| Hosting | Cloudflare Pages | Free tier, Git-connected or direct upload |
| Server functions | Cloudflare Workers — only when genuinely required | None in baseline |
| **Forbidden** | React Three Fiber, Three.js, GSAP | Particles via CSS/canvas |

### 2.2 Proposed supporting libraries (need approval — ⚠️ `OQ-45`)
All are free, MIT-licensed, widely used, and avoid hand-rolling well-solved problems.

| Library | Purpose | Why |
|---|---|---|
| `react-router` (v7, library/SPA mode) | Routing | Nested layouts, protected routes, URL-driven filters |
| `@tanstack/react-query` | Server-state caching, loading/error states, optimistic updates | Gives uniform loading/empty/error states and cache invalidation for both mock and real services |
| `zod` | Schema validation | One schema shared by forms, mock services and Supabase service input checks |
| `react-hook-form` + `@hookform/resolvers` | Forms | Performant forms with Zod validation |
| `@supabase/supabase-js` (Milestone B) | Supabase client | Official SDK |
| `browser-image-compression` (Milestone B) | Client-side image resizing before upload | Keeps within Supabase Free 1 GB storage |
| `clsx` + `tailwind-merge` | Class composition | Clean variant styles |
| `date-fns` | Relative times ("3 h ago") | Small, tree-shakeable |
| Dev: `vitest`, `@testing-library/react`, `@playwright/test`, `eslint`, `prettier`, `supabase` CLI | Testing & tooling | See §10 |

No global state library is proposed: server state lives in React Query; small UI state (auth session, intro seen, theme of toasts) lives in React context.

---

## 3. Folder structure

```
kesh-squad/
├─ docs/                          # these planning docs + ADRs later
├─ public/
│  ├─ _redirects                  # SPA fallback for Cloudflare Pages: /*  /index.html  200
│  ├─ _headers                    # security headers (CSP, HSTS, etc.)
│  ├─ favicon.svg, og-image.jpg, robots.txt
├─ src/
│  ├─ main.tsx                    # entry
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ router.tsx               # route table (lazy-loaded feature routes)
│  │  ├─ providers.tsx            # QueryClient, AuthProvider, ToastProvider, ServicesProvider
│  │  ├─ layouts/
│  │  │  ├─ RootLayout.tsx        # header, footer, mobile nav, prototype banner
│  │  │  ├─ DashboardLayout.tsx
│  │  │  └─ AdminLayout.tsx
│  │  └─ guards/
│  │     ├─ RequireAuth.tsx       # member only
│  │     ├─ RequireIdentity.tsx   # guest or member
│  │     └─ RequireRole.tsx       # admin / moderator
│  ├─ components/
│  │  ├─ ui/                      # design-system primitives
│  │  │  Button, IconButton, Card, Badge, Input, Textarea, Select, Checkbox,
│  │  │  Modal, Drawer, Tabs, Tooltip, Toast, Skeleton, Avatar, Pagination,
│  │  │  EmptyState, ErrorState, Spinner, PriceTag, GoldDivider
│  │  ├─ layout/                  # Navbar, MobileNav, Footer, SearchBar, UserMenu
│  │  └─ shared/                  # ImageGallery, ImageUploader, ReportDialog,
│  │                              # ConfirmDialog, ProtoBanner, SEO (head tags)
│  ├─ features/                   # one folder per product area
│  │  ├─ intro/                   # IntroPage, GoldParticles (canvas/CSS)
│  │  ├─ home/
│  │  ├─ videos/
│  │  ├─ community/
│  │  ├─ ama/
│  │  ├─ marketplace/
│  │  ├─ donations/
│  │  ├─ honour-board/
│  │  ├─ inbox/
│  │  ├─ search/
│  │  ├─ auth/
│  │  ├─ dashboard/
│  │  ├─ admin/
│  │  └─ legal/                   # rules, guidelines, terms, privacy, about
│  │     each feature: pages/ components/ hooks/ (useXxx wrapping React Query)
│  ├─ services/
│  │  ├─ contracts/               # TypeScript interfaces — the only API the UI sees
│  │  │  auth.ts, profiles.ts, videos.ts, community.ts, ama.ts, listings.ts,
│  │  │  donations.ts, messaging.ts, honour.ts, search.ts, reports.ts,
│  │  │  admin.ts, storage.ts, pricing.ts
│  │  ├─ mock/                    # Milestone A implementations
│  │  │  ├─ fixtures/             # realistic Indian MBBS/BDS data (books, colleges-agnostic names)
│  │  │  ├─ mockDb.ts             # in-memory store persisted to localStorage, latency + error injection
│  │  │  └─ *.mock.ts
│  │  ├─ supabase/                # Milestone B implementations
│  │  │  ├─ client.ts             # createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
│  │  │  ├─ mappers.ts            # DB rows ⇄ domain types
│  │  │  └─ *.supabase.ts
│  │  └─ index.ts                 # picks implementation from VITE_DATA_SOURCE = mock | supabase
│  ├─ domain/                     # framework-free business logic (unit-tested)
│  │  ├─ types.ts                 # Listing, Donation, Post, Conversation, ... domain types
│  │  ├─ pricing.ts               # maxPrice(originalPrice, ageBucket, rules)
│  │  ├─ donations.ts             # lifecycle transitions
│  │  ├─ ranking.ts               # rank + badge computation for mock mode
│  │  ├─ schemas/                 # zod schemas (listing, donation, post, comment, message, ama)
│  │  └─ constants.ts             # courses, conditions, limits (from approved OQ answers)
│  ├─ lib/                        # formatINR, relativeTime, cn(), env.ts (validated env)
│  ├─ hooks/                      # useMediaQuery, useReducedMotion, useDebounce
│  ├─ styles/index.css            # Tailwind layers, fonts, base styles
│  └─ types/database.types.ts     # generated by `supabase gen types` (Milestone B)
├─ supabase/
│  ├─ config.toml
│  ├─ migrations/                 # timestamped SQL migrations (schema, RLS, functions, triggers)
│  ├─ seed.sql                    # dev seed (never run on production)
│  └─ tests/                      # pgTAP tests for RLS and RPCs
├─ tests/
│  ├─ unit/                       # vitest (domain, services, components)
│  └─ e2e/                        # Playwright user journeys J1–J7
├─ .env.example                   # documented env vars (no secrets)
├─ index.html, vite.config.ts, tailwind.config.ts, tsconfig.json, eslint.config.js
└─ package.json
```

---

## 4. Service contract pattern

```ts
// services/contracts/listings.ts (illustrative)
export interface ListingsService {
  search(q: ListingQuery): Promise<Page<ListingSummary>>;
  get(id: string): Promise<ListingDetail | null>;
  create(input: CreateListingInput): Promise<ListingDetail>;   // server re-checks price cap
  update(id: string, patch: UpdateListingInput): Promise<ListingDetail>;
  setStatus(id: string, status: SaleStatus): Promise<void>;
  listMine(): Promise<ListingSummary[]>;
}
```

- Every contract method returns domain types (never raw DB rows).
- Errors are normalised to a `ServiceError { code: 'unauthorized' | 'forbidden' | 'not_found' | 'validation' | 'rate_limited' | 'conflict' | 'network' | 'unknown'; message; fieldErrors? }` so UI error states are identical in mock and real mode.
- Mock services: simulate latency (150–600 ms), honour the same validation (Zod + `domain/pricing.ts`), enforce the same permission rules in-memory (e.g. you can't read others' conversations), and can inject errors via `?mockError=listings.create` for testing error states.
- `ServicesProvider` exposes the chosen implementation via React context, so tests can inject fakes.
- Realtime is abstracted as `messaging.subscribe(conversationId, onMessage): Unsubscribe` — mock uses an in-process event emitter (and `BroadcastChannel` across tabs) so the inbox UI is real-time-shaped from day one.

---

## 5. Design system implementation

- Tailwind theme tokens: `ink` `#0B0B0B`, `charcoal` `#171717`, `gold` `#D4AF37`, `champagne` `#F5D76E`, `white` `#FFFFFF`, `mist` `#B3B3B3`, plus derived surface/border shades (e.g. `charcoal-800`, `gold/20` borders) and semantic `success`/`warning`/`danger` tuned for dark backgrounds.
- Typography (proposed — ⚠️ `OQ-46` brand fonts): a display serif or high-contrast face for headings (e.g. *Cormorant Garamond* / *Playfair Display*) + a clean sans for UI (e.g. *Inter* / *Manrope*), self-hosted via `@fontsource` to avoid third-party requests.
- Motion tokens: durations 150/250/400 ms; easing `[0.22, 1, 0.36, 1]`; page transitions fade+8 px rise; hover lifts ≤ 2 px; no parallax-heavy scrolling. All wrapped in `useReducedMotion`.
- Intro particles: ≤ 60 particles on a 2D `<canvas>` (or pure CSS), paused when tab hidden, disabled on reduced-motion.
- Component states: every interactive primitive defines default / hover / focus-visible / active / disabled / loading.

---

## 6. Routing, auth and identity

- Client-side routing with lazy-loaded feature chunks; Cloudflare `_redirects` serves `index.html` for all paths.
- `AuthProvider` exposes `{ session, user, profile, isGuest, role }`.
- **Guest identity (pending ⚠️ `OQ-01`).** Recommended technical option to evaluate: **Supabase anonymous sign-in** — creates a real `auth.uid()` so RLS protects guest conversations exactly like member conversations; guest can later attach an email to keep the same identity across devices (`updateUser({ email })`). Limitation: if browser storage is cleared before an email is attached, the guest cannot recover conversations. Alternatives (email OTP "lightweight account", signed magic links per conversation) are compared in `OPEN_QUESTIONS.md`. Anonymous sign-ins must be paired with CAPTCHA (Cloudflare Turnstile, free) to prevent abuse.
- Route guards: `RequireIdentity` (guest or member) for inbox; `RequireAuth` (non-anonymous member) for selling/donating/dashboard; `RequireRole('admin')` for admin. Guards are UX only — **real enforcement is RLS**.

---

## 7. Data access & business-logic placement

| Concern | Client | Database (authoritative) |
|---|---|---|
| Price cap | `domain/pricing.ts` for live feedback | `pricing_rules` table + `BEFORE INSERT/UPDATE` trigger on `listings` rejecting price > cap |
| Donation has no price | Form has no price field | `CHECK (listing_type <> 'donation' OR asking_price IS NULL)` |
| Start conversation | Button | `start_conversation(listing_id)` RPC (SECURITY DEFINER, checks listing available, caller ≠ owner, idempotent) |
| Donation lifecycle | Buttons | RPCs `accept_donation_request`, `confirm_donation_completed`, `cancel_donation` validate transitions |
| Vote counts / comment counts | Optimistic UI | Triggers maintain counters; unique (user, target) vote constraint |
| Honour Board | Display | `honour_board` view (or materialized view refreshed by trigger) over completed donations |
| Rate limits | Disable buttons briefly | DB function checks recent counts per user inside RLS `WITH CHECK` / triggers |
| Search | Debounced input | Postgres full-text `tsvector` + `pg_trgm` for partial/misspelled matches |

All writes that change state across multiple rows go through Postgres functions so they are atomic and authorised server-side.

---

## 8. Media & storage

- Supabase Storage bucket `listing-images` (public read, owner-only write under `{user_id}/{listing_id}/…`), bucket `avatars` (public read, owner write) if avatars are approved.
- Client compresses to ≤ 1600 px longest edge, WebP/JPEG ~80% quality, target ≤ 400 KB per image, strips EXIF (removes GPS location — privacy).
- Storage policies restrict MIME type and size; DB keeps `listing_images` rows referencing paths.
- Free-tier capacity: 1 GB storage ≈ 2,500 images at 400 KB — monitor; see roadmap.
- Videos are **embedded**, not hosted.

---

## 9. Environments & configuration

| Variable | Where | Secret? | Purpose |
|---|---|---|---|
| `VITE_DATA_SOURCE` | Pages env / `.env.local` | No | `mock` or `supabase` |
| `VITE_SUPABASE_URL` | Pages env | No | Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Pages env | No (public by design, protected by RLS) | Client key (`sb_publishable_…`, or legacy `anon` key) |
| `VITE_TURNSTILE_SITE_KEY` | Pages env | No | CAPTCHA widget |
| `VITE_SITE_URL` | Pages env | No | Canonical URL for auth redirects/OG tags |
| Turnstile secret | Supabase Auth settings (dashboard) | **Yes** | Never in repo or browser |
| SMTP credentials | Supabase Auth settings | **Yes** | Production auth emails (⚠️ `OQ-47`) |
| Supabase service-role / secret key, DB password | Supabase CLI locally / CI secret only | **Yes** | Migrations; **never** in `VITE_*` vars |

Environments: **local** (Vite + mock, or Vite + local Supabase via Docker/CLI) → **preview** (Cloudflare Pages preview per branch, Supabase dev project) → **production** (Pages production branch, Supabase prod project). Two Supabase projects fit the free tier (2 active projects per org).

---

## 10. Quality & testing strategy
| Layer | Tool | Milestone |
|---|---|---|
| Type safety | `tsc --noEmit` strict | A+ |
| Lint/format | ESLint (typescript-eslint, react-hooks, jsx-a11y), Prettier | A+ |
| Domain unit tests | Vitest (pricing, donation transitions, ranking, schemas) | A |
| Component tests | Vitest + Testing Library (forms, states) | A |
| E2E journeys J1–J7 | Playwright (mobile + desktop viewports) | A (mock), C (real) |
| Accessibility | `@axe-core/playwright` on key pages | A, C |
| DB/RLS tests | pgTAP via `supabase test db` | B |
| Performance | Lighthouse CI / manual Lighthouse | C |
| Security review | Checklist in SECURITY doc + Supabase Security Advisor | C |

---

## 11. Deployment (Cloudflare Pages)
- Build command `npm run build`, output `dist/`, Node LTS.
- `_redirects`: `/*  /index.html  200`.
- `_headers`: CSP allowing self, Supabase URL (https + wss), YouTube/Instagram embed origins, Turnstile; `X-Frame-Options: DENY` / `frame-ancestors 'none'`; `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy` minimal; HSTS.
- Supabase Auth: Site URL and redirect allow-list set to production + preview domains.
- Migrations applied with `supabase db push` from a trusted machine/CI — never from the browser.

## 12. SEO note for an SPA
Cloudflare Pages serves a client-rendered SPA; social previews for individual listings won't have per-page OG tags without server rendering. Options (post-launch): prerender static public pages at build time, or a small Pages Function to inject OG tags for `/books/:id`. Logged as ⚠️ `OQ-48`.

## 13. Free-tier constraints to plan around
| Limit (Supabase Free, verify at setup) | Impact | Mitigation |
|---|---|---|
| Project pauses after ~1 week inactivity | Dev project may sleep | Fine for dev; production traffic keeps it awake; decide on Pro if needed (⚠️ `OQ-49`) |
| 500 MB database | Messages grow fastest | Text-only messages, pagination; monitor |
| 1 GB storage | Images | Client compression, image count cap |
| Built-in auth email is heavily rate-limited | Signups/password resets fail at volume | Custom SMTP before launch (free tier providers) ⚠️ `OQ-47` |
| Realtime concurrent connections limit | Inbox only | Subscribe only on open conversation + inbox list |
| No automated backups on Free | Data loss risk | Scheduled `pg_dump` via CLI/GitHub Action (⚠️ `OQ-49`) |
