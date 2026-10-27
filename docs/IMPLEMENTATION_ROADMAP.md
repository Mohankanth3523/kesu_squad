# Kesh Squad — Implementation Roadmap

| Field | Value |
|---|---|
| Status | Draft v0.1 — awaiting owner approval |
| Date | 27 Oct 2026 |
| Rule | Each phase ends with checks run and results reported honestly. No phase starts until the previous one's acceptance criteria pass (or exceptions are approved). |

```
Stage 0  Planning docs (this set) ──► owner approval + answers to blocking OQs
Milestone A  Frontend with realistic mock data      (A0 → A6)
Milestone B  Real backend: Supabase                 (B0 → B6)
Milestone C  Integration, testing, security, launch (C0 → C5)
```

Blocking questions per milestone are listed in `OPEN_QUESTIONS.md` §"Blocking by milestone".

---

## Milestone A — Complete frontend with realistic mock data

**Goal:** every page and user journey in the PRD is clickable on mobile and desktop, powered by mock services behind the same contracts the real backend will implement. Nothing is presented as production-ready.

| Phase | Scope | Deliverables |
|---|---|---|
| **A0 Foundation** | Vite + React + TS strict, Tailwind tokens, Framer Motion, Lucide, router, React Query, ESLint/Prettier, Vitest, Playwright, `.env.example`, Cloudflare `_redirects`/`_headers` | Running skeleton; CI-ready scripts `dev`, `build`, `lint`, `typecheck`, `test`, `e2e` |
| **A1 Design system** | UI primitives, layout (header, mobile nav, footer), universal states (skeleton, empty, error, toast, prototype banner), typography, motion tokens | `/dev/ui` style-guide route (dev only) |
| **A2 Service layer & fixtures** | All service contracts; mock implementations with latency/error injection and localStorage persistence; domain logic (`pricing.ts`, donation transitions, ranking) with unit tests | Contracts + fixtures + ≥ 90% coverage on `domain/` |
| **A3 Public experience** | Intro, Home, Videos, Community (feed, post detail, threads), AMA, Honour Board, Search, rules/guidelines/legal placeholders, 404 | Pages P1–P10 (read), P12–P13, P15, P25, P27–P30, P36 |
| **A4 Marketplace & donations** | Book browse/filter/detail, sell form with live price cap, donation browse/detail/create, request flow | P9–P14 with forms & validation |
| **A5 Identity, inbox, dashboard** | Mock login/signup/guest flow, inbox with simulated realtime, conversation view, dashboards (listings, donations, requests, settings) | P16–P24, P26 |
| **A6 Admin & polish** | Admin reports, videos, AMA, users, pricing; accessibility pass; responsive pass; performance pass; e2e journeys | P31–P35; Playwright J1–J7 green |

### Milestone A acceptance criteria
1. **Coverage:** every route in PRD §3.2 renders with realistic mock data; no dead links in navigation.
2. **Journeys:** Playwright e2e passes for J1 Intro→Home, J2 Post & discuss, J3 AMA, J4 Sell (incl. price cap rejection), J5 Guest interest → chat → return, J6 Seller marks sold → other buyer sees unavailable, J7 Donation request → accept → complete → Honour Board increments — on **mobile (390×844) and desktop (1440×900)**.
3. **Business rules in UI:** price cap computed from `pricing_rules` fixture for all five age bands incl. the ₹1,000 worked example (750/500/400/250/6+ per OQ-41 answer); donation forms have no price input; "free book, recipient pays agreed courier" copy visible on donation pages; no payment UI anywhere.
4. **Privacy in mock:** a mock user cannot open another user's conversation by URL (shows not-found); phone numbers never shown on public pages.
5. **States:** every data view demonstrates loading, empty and error states (verified via `?mockError=` and empty fixtures); every mutation shows success/failure feedback.
6. **Prototype honesty:** persistent "Prototype — data is not saved" indicator; no copy claims real accounts, delivery, or security.
7. **Quality gates:** `typecheck`, `lint`, unit tests and e2e all pass; zero console errors on main journeys.
8. **Accessibility:** axe — no serious/critical violations on Home, Books, Listing, Sell, Inbox, Community, Honour Board; full keyboard path through J4 and J5; reduced-motion respected.
9. **Performance (mock, production build):** Lighthouse mobile Performance ≥ 85, Accessibility ≥ 95 on Home and Books; intro skippable instantly; initial JS ≤ ~200 KB gzip (route-split).
10. **Design:** palette and typography match the design system; owner design sign-off on Intro, Home, Books, Listing, Community, Inbox, Honour Board.
11. **Architecture:** no component imports from `services/mock` directly — only via `services/index.ts`; switching `VITE_DATA_SOURCE` compiles.

---

## Milestone B — Real backend (Supabase)

**Goal:** replace mock services with Supabase implementations, with authorization enforced in the database.

| Phase | Scope | Deliverables |
|---|---|---|
| **B0 Setup** | Supabase dev project; CLI; local stack; migration workflow; generated types | `supabase/` folder, `database.types.ts`, documented setup steps (owner creates accounts — not claimed done until verified) |
| **B1 Schema & RLS** | Enums, tables, indexes, triggers (price cap, counters, status transitions), helper functions, RLS policies, seed data | Migrations + pgTAP tests S1–S18 |
| **B2 Auth** | Email/password (+ method per OQ-06), guest mechanism (OQ-01), profile auto-creation, display-name onboarding, password reset, Turnstile | `auth.supabase.ts`, `profiles.supabase.ts` |
| **B3 Listings & storage** | Listings CRUD, image upload with compression, search (FTS + trigram), filters, status transitions | `listings.supabase.ts`, `storage.supabase.ts` |
| **B4 Messaging** | `start_conversation`, inbox, realtime subscription, unread counts, blocks | `messaging.supabase.ts` |
| **B5 Donations & Honour Board** | Request/accept/confirm/cancel RPCs, completions ledger, honour_board view, badges | `donations.supabase.ts`, `honour.supabase.ts` |
| **B6 Community, AMA, videos, moderation** | Posts/comments/votes, AMA workflow, video management (per OQ-11), reports, admin RPCs, audit log | Remaining services |

### Milestone B acceptance criteria
1. All migrations apply cleanly to an empty project (`supabase db reset`) and are idempotent in order.
2. RLS enabled on 100% of `public` tables; pgTAP S1–S18 pass.
3. With `VITE_DATA_SOURCE=supabase`, journeys J1–J7 pass against the dev project using real accounts in two separate browsers.
4. Price cap enforced server-side: direct REST call with over-cap price is rejected; the ₹1,000 example yields the documented caps.
5. Donation listing cannot store a price; cancelled/uncompleted donations do not reach the Honour Board; completed ones appear within one refresh (or realtime).
6. Messages deliver in real time (< 2 s typical) between two participants; a third account receives nothing via REST or realtime.
7. Guest can message a seller and return to the conversation per the approved OQ-01 mechanism; guest cannot list books.
8. Images upload compressed (< 500 KB typical), EXIF stripped, wrong types/oversize rejected by bucket policy.
9. No secret appears in the built bundle; `.env.example` documents every variable.
10. Supabase Security Advisor: no errors.

---

## Milestone C — Integration, testing, security review, production deployment

| Phase | Scope |
|---|---|
| **C0 Hardening** | Remove/disable mock data source in production build; error boundaries; client error logging; empty-state copy final |
| **C1 Full test pass** | Unit, e2e (real backend, staging), cross-browser (Chrome, Safari iOS, Firefox, Edge, Android Chrome), accessibility, Lighthouse |
| **C2 Security review** | Checklist in SECURITY doc §8; independent review of RLS by a fresh reviewer/agent; abuse testing (rate limits, spam) |
| **C3 Content & legal** | Marketplace/donation rules, payment-dispute/refund/fraud guidance (C1 §7), community guidelines, privacy policy, terms — owner-approved text (⚠️ OQ-35) |
| **C4 Production setup** | Supabase prod project, migrations, custom SMTP, Turnstile, Auth URLs, admin account + MFA, backups; Cloudflare Pages project, env vars, custom domain (⚠️ OQ-50), headers |
| **C5 Launch** | Smoke test on production, seed real videos & pricing rules, monitoring, rollback plan, post-launch review |

### Milestone C acceptance criteria
1. Production URL serves over HTTPS with security headers (CSP, HSTS, frame-ancestors) verified via response inspection.
2. All e2e journeys pass against **staging**; smoke subset (J1, J4, J5, J7) passes against **production** with test accounts that are then cleaned up.
3. Security checklist §8 fully ticked with evidence; no open high/critical findings.
4. Lighthouse mobile on production: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90 for Home and Books.
5. Rules for delivery, payment disputes, refunds and suspected fraud are published and acknowledged before first contact / first listing (C1 §7).
6. No payment gateway code or UI present (C1 §7).
7. Backup taken and restore verified; rollback procedure (redeploy previous Pages build, migration down-plan) documented and rehearsed.
8. Owner has admin access with MFA; at least one moderator path tested end to end (report → action → audit log).
9. Every claim in the launch report is verified (deployment, DB setup, auth emails, domain) — nothing reported as done that wasn't observed.

---

## Risk register
| Risk | Impact | Mitigation |
|---|---|---|
| Guest identity decision (OQ-01) delays inbox | Blocks B2/B4 | Decide before A5; mock supports both designs |
| Instagram embedding limits (OQ-10) | Reels may not embed | Fallback: thumbnail + outbound link |
| Supabase Free limits (pausing, email limits, 1 GB storage) | Outages, failed signups | Custom SMTP, compression, monitor; budget review before launch (OQ-49) |
| Fraud/scams without payment gateway | Trust damage | Rules, warnings, reports, blocks, moderation |
| Honour Board gaming | Unfair rankings | Two-party confirmation (OQ-29), admin revoke |
| Scope creep | Delays | PRD IDs + milestone gates |
