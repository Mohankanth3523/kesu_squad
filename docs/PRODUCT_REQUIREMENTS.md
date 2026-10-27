# Kesh Squad — Product Requirements

> **KESH SQUAD — Welcome, Amigos! — WATCH. TALK. CONNECT.**
> *A community, not just a website.*

| Field | Value |
|---|---|
| Status | Draft v0.1 — awaiting owner approval |
| Date | 27 Oct 2026 |
| Sources | **[C1]** `Kesh_Squad_Complete_Website_Concept.docx` · **[C2]** `Kesh_Squad_Website_Concept.docx` |
| Related | `TECHNICAL_ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `SECURITY_AND_PERMISSIONS.md`, `IMPLEMENTATION_ROADMAP.md`, `OPEN_QUESTIONS.md` |

**Conventions.** Every requirement has an ID (e.g. `MKT-04`) and a source tag. Items tagged **[C1]** / **[C2]** come straight from the concept documents. Items tagged **[ENG]** are engineering requirements needed to build the stated feature safely (validation, error states, accessibility, etc.); they do not add business rules. Anything that would need a business decision is **not** decided here. It is listed as `OQ-xx` in `OPEN_QUESTIONS.md` and referenced inline as ⚠️ `OQ-xx`.

Priority: **P0** = required for initial launch · **P1** = should ship at launch if feasible · **P2** = after launch.

---

## 1. Product overview

### 1.1 Vision
Kesh Squad is a community-driven platform, primarily for MBBS and BDS students, that brings social media content, community discussions, second-hand textbook trading and book donations together in one place. It is intentionally **not** a formal educational platform or a conventional bookstore. People should "return for the content, stay for the conversations, and use the marketplace when they need it." [C1 §8, C2 §1, §3]

### 1.2 Four pillars
| Pillar | Scope | Source |
|---|---|---|
| Content | YouTube videos, YouTube Shorts, Instagram Reels | C1 §8, C2 §2 |
| Community | Reddit-style posts, comments, replies, upvotes; Ask Me Anything | C1 §8, C2 §2 |
| Marketplace | Second-hand MBBS/BDS textbooks, private buyer–seller messaging, seller dashboard | C1 §3, C2 §2 |
| Social impact | Free book donations, donation requests, donor rankings, Honour Board | C1 §4–5 |

### 1.3 Explicit non-goals for initial launch
- **No integrated payment gateway** (no Razorpay or equivalent). Kesh Squad does not collect purchase money or courier charges. [C1 §7]
- No in-platform delivery/logistics booking. Buyers/sellers and donors/recipients arrange delivery themselves. [C1 §4, §7]
- No formal course content, tests or academic grading. [C2 §1]

### 1.4 Success indicators (proposed, for owner confirmation — ⚠️ `OQ-40`)
Return visits, community posts/comments per week, listings created, conversations started, donations completed. No targets are set here.

---

## 2. Users, roles and access

| Role | Who | How they are identified | Source |
|---|---|---|---|
| **Visitor** | Anyone, not signed in | No session | C1 §6 |
| **Guest buyer / requester** | Visitor who wants to express interest or message without a "traditional account" | A guest identity or secure access mechanism that lets them return to their conversations — mechanism ⚠️ `OQ-01` | C1 §6 |
| **Member** | Registered, logged-in user. Can act as seller, donor, community member | Authenticated account with a public display name | C1 §6, C2 §2 |
| **Creator / Admin** | The creator behind Kesh Squad and anyone they appoint | Member with admin role | C2 §2 (AMA), C1 §6 (reporting) |
| **Moderator** | Optional trusted members who handle reports | Member with moderator role — whether needed ⚠️ `OQ-31` | [ENG] from C1 §6 "reporting features" |

### 2.1 Access matrix (summary — full detail in `SECURITY_AND_PERMISSIONS.md`)
| Capability | Visitor | Guest | Member | Admin |
|---|---|---|---|---|
| Intro, Home, Videos, Honour Board | ✅ | ✅ | ✅ | ✅ |
| Browse/search book & donation listings | ✅ | ✅ | ✅ | ✅ |
| Read public community discussions | ✅ | ✅ | ✅ | ✅ |
| Express interest in a book / message a seller | ❌ (prompted to continue as guest or log in) | ✅ | ✅ | ✅ |
| Request a donated book | ⚠️ `OQ-02` | ⚠️ `OQ-02` | ✅ | ✅ |
| Create/manage sale listings | ❌ | ❌ | ✅ | ✅ |
| Create/manage donation listings | ❌ | ❌ | ✅ | ✅ |
| Seller/donor dashboard | ❌ | ❌ | ✅ | ✅ |
| Post, comment, reply, upvote | ❌ | ⚠️ `OQ-03` | ✅ | ✅ |
| Submit AMA question | ⚠️ `OQ-04` | ⚠️ `OQ-04` | ✅ | ✅ |
| Report content or users | ⚠️ `OQ-05` | ✅ | ✅ | ✅ |
| Moderation, video management, AMA answers | ❌ | ❌ | ❌ | ✅ |

Rules stated by the concepts:
- `AUTH-01` [C1 §6] **P0** Visitors must never be forced to register just to browse.
- `AUTH-02` [C1 §6] **P0** Buyers must not need a traditional account to browse or express interest; a guest identity / secure access mechanism must let them message and later return to their conversations.
- `AUTH-03` [C1 §6] **P0** Sellers and donors must log in to upload books, create donation listings, manage listings, view their dashboard, manage conversations and update availability.
- `AUTH-04` [C1 §6, C2 §2] **P0** Users choose a display name for public interactions; personal details are not publicly revealed.

---

## 3. Information architecture

### 3.1 Main navigation [C1 §8]
`Home | Videos | Community | Books | Donate | Honour Board`

Utility navigation [C1 §8]: **Search**, **Inbox**, **Seller Login** (labelled login entry point — ⚠️ `OQ-06` on whether it's a separate seller login or the single login), **User Dashboard**.

Ask Me Anything is reachable from Home ("Quick link to Ask Me Anything" [C1 §8]) and, proposed, from Community. Placement in the main nav ⚠️ `OQ-07`.

### 3.2 Page inventory and routes

| # | Page | Proposed route | Access | Priority | Source |
|---|---|---|---|---|---|
| P1 | Intro / landing ("Enter the Squad") | `/` (first visit) | Public | P0 | C1 §2 |
| P2 | Home | `/home` | Public | P0 | C1 §8, C2 §2 |
| P3 | Videos & Shorts (tabs: Videos, Shorts, Reels) | `/videos` | Public | P0 | C1 §8, C2 §2 |
| P4 | Video detail + discussion | `/videos/:id` | Public | P1 ⚠️ `OQ-12` | C2 §2 "interact with the community around it" |
| P5 | Community feed (Popular / Recent / Trending) | `/community` | Public read | P0 | C2 §2 |
| P6 | Post detail with threaded comments | `/community/posts/:id` | Public read | P0 | C2 §2 |
| P7 | Create / edit post | `/community/new`, `/community/posts/:id/edit` | Member | P0 | C2 §2 |
| P8 | Ask Me Anything | `/ama` | Public read | P0 | C2 §2, C1 §8 |
| P9 | Books marketplace (browse, search, filter) | `/books` | Public | P0 | C1 §3, C2 §2 |
| P10 | Book listing detail | `/books/:id` | Public | P0 | C1 §3 |
| P11 | Sell a book (create / edit listing) | `/sell`, `/dashboard/listings/:id/edit` | Member | P0 | C1 §3 |
| P12 | Donations (browse, search) | `/donate` | Public | P0 | C1 §4, C2 §2 |
| P13 | Donation listing detail | `/donate/:id` | Public | P0 | C1 §4 |
| P14 | Donate a book (create / edit) | `/donate/new`, `/dashboard/donations/:id/edit` | Member | P0 | C1 §4 |
| P15 | Honour Board | `/honour-board` | Public | P0 | C1 §5 |
| P16 | Inbox (conversation list) | `/inbox` | Guest / Member | P0 | C1 §3, §6, C2 §2 |
| P17 | Conversation thread | `/inbox/:conversationId` | Participants only | P0 | C1 §6, C2 §2 |
| P18 | Login / Sign up / Forgot password / Auth callback | `/login`, `/signup`, `/forgot-password`, `/auth/callback` | Public | P0 | C1 §6, §8 |
| P19 | Guest access (start / resume guest session) | Inline modal + `/guest/resume` | Public | P0 | C1 §6 ⚠️ `OQ-01` |
| P20 | User dashboard — overview | `/dashboard` | Member | P0 | C1 §6, §8 |
| P21 | Dashboard — My sale listings | `/dashboard/listings` | Member | P0 | C1 §6 |
| P22 | Dashboard — My donation listings & requests | `/dashboard/donations` | Member | P0 | C1 §4, §6 |
| P23 | Dashboard — My requests/interests (as buyer/recipient) | `/dashboard/activity` | Guest/Member | P1 | [ENG] from C1 §6 "return to their conversations" |
| P24 | Dashboard — Profile & settings (display name, privacy) | `/dashboard/settings` | Member | P0 | C1 §6 |
| P25 | Global search results | `/search?q=` | Public | P0 | C1 §8 |
| P26 | Public member profile (display name, donation stats, badges) | `/u/:displayName` | Public | P1 ⚠️ `OQ-26` | C1 §5 "display name and donation statistics" |
| P27 | Marketplace & donation rules / safety (delivery, payment disputes, refunds, fraud) | `/rules` | Public | P0 (pre-launch) | C1 §7 |
| P28 | Community guidelines | `/guidelines` | Public | P0 | [ENG] from C1 §6 spam/reporting |
| P29 | Terms of use, Privacy policy | `/terms`, `/privacy` | Public | P0 (pre-launch) | [ENG] — content needs owner/legal ⚠️ `OQ-35` |
| P30 | About Kesh Squad | `/about` | Public | P2 | C2 §1 |
| P31 | Admin — Moderation queue (reports) | `/admin/reports` | Admin/Mod | P0 | C1 §6 |
| P32 | Admin — Videos management | `/admin/videos` | Admin | P0 ⚠️ `OQ-11` | C2 §2 |
| P33 | Admin — AMA management | `/admin/ama` | Admin | P0 | C2 §2 |
| P34 | Admin — Users (suspend, roles) | `/admin/users` | Admin | P1 | [ENG] |
| P35 | Admin — Pricing rules | `/admin/pricing` | Admin | P1 | C1 §3 (percentages "can be finalised") |
| P36 | 404 Not found, generic error, offline | `*` | Public | P0 | [ENG] |

---

## 4. Global design requirements

### 4.1 Visual identity [C1 §1]
| Token | Value | Usage |
|---|---|---|
| Matte Black | `#0B0B0B` | Primary background |
| Charcoal | `#171717` | Secondary background, cards, surfaces |
| Gold | `#D4AF37` | Headings, borders, icons, buttons, rankings, key highlights |
| Champagne Gold | `#F5D76E` | Highlights, hover/active, top-3 emphasis |
| White | `#FFFFFF` | Main text |
| Grey | `#B3B3B3` | Secondary text |

- `DS-01` [C1 §1] **P0** Premium, cinematic, modern look; a distinctive online community rather than a conventional educational site.
- `DS-02` [C1 §1] **P0** Consistent design across marketplace, community, inbox and donation leaderboard.
- `DS-03` [Project brief] **P0** Restrained, elegant animation (Framer Motion); minimalist; readable typography; strong hierarchy; no generic templates or excessive effects.
- `DS-04` [ENG] **P0** Responsive from 360 px phones to wide desktops; mobile layouts are first-class (bottom navigation or compact menu on mobile).
- `DS-05` [ENG] **P0** Accessibility: WCAG 2.1 AA contrast (gold-on-black for small text must be checked; grey `#B3B3B3` on `#0B0B0B` passes for body text), visible focus states, keyboard navigation, alt text on images, `prefers-reduced-motion` respected (all particles/transitions disabled or reduced).
- `DS-06` [ENG] **P0** Performance budget: intro and home usable on mid-range Android over 4G; Largest Contentful Paint target ≤ 2.5 s; images lazy-loaded and served in compressed formats.
- `DS-07` [Project brief] **P0** No React Three Fiber, Three.js or GSAP. Particle/light effects use CSS or a lightweight 2D canvas.
- `DS-08` [ENG] **P0** Currency displayed in Indian Rupees (`₹1,000` format, `en-IN` grouping).

### 4.2 Universal UI states [ENG] — required on every data-driven view
| State | Requirement |
|---|---|
| Loading | Skeletons shaped like the final content (no full-page spinners after first load) |
| Empty | Friendly message + the next useful action (e.g. "No books match — clear filters / list a book") |
| Error | Plain-language message, retry action, no raw error codes or stack traces shown |
| Success | Toast or inline confirmation for every create/update/delete |
| Offline | Banner when network is lost; queued actions are not silently dropped |
| Unauthorised | Prompt to log in or continue as guest, returning the user to where they were |
| Forbidden / not found | 404-style page for listings/conversations the user may not see (never reveal that a private conversation exists) |
| Prototype mode | During Milestone A, a persistent, visible "Prototype — data is not saved" indicator so mock behaviour is never mistaken for production (Project rule) |

---

## 5. Feature requirements

### 5.1 Intro / landing page [C1 §2]
| ID | Requirement | Pri |
|---|---|---|
| INT-01 | Show brand: **KESH SQUAD**, "Welcome, Amigos!", "A place to connect, explore, share, and belong." and an **[ENTER THE SQUAD]** button | P0 |
| INT-02 | Cinematic black background, large gold typography, subtle gold particles or lighting, smooth transition into Home | P0 |
| INT-03 | Memorable but lightweight; an option to enter immediately (button available from first paint; Skip/Esc works) | P0 |
| INT-04 | Whether the intro shows on every visit or only first visit ⚠️ `OQ-08` (default proposal: first visit per browser, with direct links bypassing it) | P0 |
| INT-05 [ENG] | Deep links (e.g. a shared listing URL) never get blocked by the intro | P0 |

**Journey J1 — First visit:** Visitor opens site → intro animates (≤ ~3 s, skippable) → clicks *Enter the Squad* → Home.
**Acceptance:** Intro renders without layout shift; button is focusable and works by keyboard; reduced-motion users get a static version; a shared `/books/:id` link opens the listing directly.

### 5.2 Home [C1 §8, C2 §2]
| ID | Section (in order proposed by C1 §8) | Pri |
|---|---|---|
| HOME-01 | Kesh Squad welcome banner | P0 |
| HOME-02 | Latest YouTube videos and Instagram Reels | P0 |
| HOME-03 | Trending community discussions | P0 |
| HOME-04 | Recently listed second-hand books | P0 |
| HOME-05 | Available donated books | P0 |
| HOME-06 | Quick link to Ask Me Anything | P0 |
| HOME-07 | Top three donors from the Honour Board (gold highlight) | P0 |
| HOME-08 | Button to explore the full community | P0 |
| HOME-09 [C2] | "Community updates" area — content undefined ⚠️ `OQ-09` | P2 |

Each section loads independently: one failing section shows its own error state without breaking the page.

### 5.3 Videos & Shorts [C2 §2, C1 §8]
| ID | Requirement | Pri |
|---|---|---|
| VID-01 | Dedicated section for latest YouTube videos, YouTube Shorts and Instagram Reels, separated by tabs/filters | P0 |
| VID-02 | Video cards: thumbnail, title, platform badge, publish date | P0 |
| VID-03 | Play YouTube content via embedded player (privacy-enhanced `youtube-nocookie.com` proposed) and Reels via Instagram embed or outbound link — feasibility ⚠️ `OQ-10` | P0 |
| VID-04 | How content gets onto the site (manual admin entry vs. automatic YouTube feed/API) ⚠️ `OQ-11` | P0 |
| VID-05 | "Interact with the community around it": discussion per video (e.g. linked community post) ⚠️ `OQ-12` | P1 |
| VID-06 [ENG] | Embeds load lazily (click-to-load facade) so the page stays fast | P0 |

Errors: embed blocked/unavailable → show thumbnail with "Watch on YouTube/Instagram" link. Empty: "New videos coming soon."

### 5.4 Community discussions [C2 §2]
| ID | Requirement | Pri |
|---|---|---|
| COM-01 | Create text posts and discussion threads | P0 |
| COM-02 | Comment on posts and reply to comments (threaded) | P0 |
| COM-03 | Upvote or like posts and comments (downvotes not specified ⚠️ `OQ-13`) | P0 |
| COM-04 | Browse Popular, Recent and Trending discussions (definitions ⚠️ `OQ-14`) | P0 |
| COM-05 | Topics include videos, college life, experiences, everyday topics — not restricted to academics; categories/flairs list ⚠️ `OQ-15` | P0 |
| COM-06 | Display names instead of personal details | P0 |
| COM-07 [C1 §6] | Report a post/comment; spam prevention | P0 |
| COM-08 [ENG] | Author can edit and delete own post/comment; deleted comments with replies show "[deleted]" placeholder to keep threads intact | P0 |
| COM-09 [ENG] | Images/links in posts — not specified ⚠️ `OQ-16` (default: text + links only) | P1 |
| COM-10 [ENG] | Max reply nesting depth for readability on mobile (proposed 5, deeper replies continue in "continue thread") | P0 |
| COM-11 [ENG] | Pagination / infinite scroll; sort persisted in URL | P0 |

**Journey J2 — Post and discuss:** Member opens Community → *New post* → title + body (+ category) → submit → post appears in Recent → others comment/reply/upvote → author sees counts update.
**Validation:** title 5–150 chars, body 1–10,000 chars, comment 1–5,000 chars (proposed limits ⚠️ `OQ-17`). Rate limit posting (see SEC doc).
**Errors:** submit fails → draft preserved, retry offered; post removed by moderator → "This post was removed" page.

### 5.5 Ask Me Anything [C2 §2, C1 §8]
| ID | Requirement | Pri |
|---|---|---|
| AMA-01 | Visitors can ask questions directly to the creator behind Kesh Squad (whether guests/visitors can submit without login ⚠️ `OQ-04`) | P0 |
| AMA-02 | Creator selects questions; selected questions are answered through future videos, Shorts or posts | P0 |
| AMA-03 | Answered questions show the answer link (video/Short/post) and/or text | P0 |
| AMA-04 | Whether submitted questions are public before answering, and whether others can upvote them ⚠️ `OQ-18` | P1 |
| AMA-05 [ENG] | Submitter sees status of their own questions: Submitted → Selected → Answered (or Not selected) | P1 |
| AMA-06 [ENG] | Question length 10–500 chars (proposed); rate-limited | P0 |

**Journey J3:** User opens AMA → writes question → submits → sees "Submitted" → admin marks Selected → later Answered with link to Short → user sees answer on AMA page.

### 5.6 Second-hand book marketplace [C1 §3, C2 §2]

#### 5.6.1 Selling
| ID | Requirement | Pri |
|---|---|---|
| MKT-01 | Seller must be logged in to upload a book | P0 |
| MKT-02 | Required fields: book name, author, edition, subject, course; original printed retail price; publication year; condition; photographs; expected selling price. Optional: description | P0 |
| MKT-03 | System calculates the **maximum permitted selling price** from edition and age (see §6.1); seller's price must be **≤ maximum** ("any price below the applicable maximum" — whether *equal to* max is allowed ⚠️ `OQ-21`) | P0 |
| MKT-04 | Listing clearly shows whether the book is the **current edition** or an older edition, and shows the publication year | P0 |
| MKT-05 | Condition scale — values not specified ⚠️ `OQ-19` (proposed: Like new / Good / Fair / Heavily used, with annotations/highlighting noted) | P0 |
| MKT-06 | Photo requirements — count/size not specified ⚠️ `OQ-20` (proposed 1–6 images, JPEG/PNG/WebP, ≤ 5 MB each before client-side compression) | P0 |
| MKT-07 | Seller manages listings: edit, mark reserved, mark sold, withdraw ("update availability" [C1 §6]) | P0 |
| MKT-08 | Courses: MBBS and BDS (whether other courses are allowed ⚠️ `OQ-22`); subject list per course ⚠️ `OQ-23` | P0 |
| MKT-09 [ENG] | Price-cap explanation shown live while typing ("Max for a 2–3-year-old edition: ₹400") | P0 |
| MKT-10 [ENG] | Server re-validates the price cap (client calculation is never trusted) | P0 |
| MKT-11 | Seller location / city for delivery planning — not specified ⚠️ `OQ-24` | P1 |
| MKT-12 | Verification of the original printed price (e.g. photo of the price) — not specified ⚠️ `OQ-25` | P1 |

#### 5.6.2 Buying
| ID | Requirement | Pri |
|---|---|---|
| MKT-20 | Browse available books without logging in | P0 |
| MKT-21 | Search by book name, author, subject, edition or course | P0 |
| MKT-22 | Filters: course, subject, condition, price range, edition (current/older), publication year (proposed set) | P0 |
| MKT-23 | View price, photographs, condition, edition status, publication year, original price, max permitted price | P0 |
| MKT-24 | Express interest in a book | P0 |
| MKT-25 | Communicate with the seller through private website messaging (no phone numbers shared publicly) | P0 |
| MKT-26 | Multiple buyers can express interest in the same book; each has a **separate private conversation** with the seller | P0 |
| MKT-27 [ENG] | Sold/withdrawn listings disappear from browse; existing conversations remain readable | P0 |
| MKT-28 [ENG] | A seller cannot express interest in their own listing | P0 |
| MKT-29 [C1 §7] | Buyer and seller arrange payment and delivery directly; site shows marketplace rules (delivery, disputes, refunds, fraud) before first contact | P0 |
| MKT-30 | Whether "express interest" is a one-click request vs. opening a chat immediately ("instant chats or send interest requests, depending on the feature" [C2]) ⚠️ `OQ-27` | P0 |

**Journey J4 — Sell a book:** Member → *Sell* → fills form → selects edition status + publication year → enters original price → sees max price → enters asking price (blocked above max) → uploads photos → preview → publish → listing visible in Books and Home "Recently listed".
**Journey J5 — Buy a book (guest):** Visitor searches "Gray's Anatomy" → opens listing → *I'm interested* → prompted: Log in or Continue as guest → guest identity created → conversation opens with seller → message sent → visitor later returns via recovery mechanism (⚠️ `OQ-01`) and finds conversation in Inbox.
**Journey J6 — Close a sale:** Seller chats with buyers A and B separately → agrees with A → marks listing *Reserved* then *Sold* → B's conversation shows "This book is no longer available".

**Errors:** price above max → inline error with the cap; upload too large/wrong type → per-file error; listing became unavailable while viewing → banner, interest button disabled; network failure on publish → draft kept locally.

### 5.7 Free book donations [C1 §4, C2 §2]
| ID | Requirement | Pri |
|---|---|---|
| DON-01 | Logged-in donor lists a book with details, photographs, edition, year and condition | P0 |
| DON-02 | Visitors browse available donations without logging in | P0 |
| DON-03 | Interested student requests the book through the website | P0 |
| DON-04 | Donor and recipient communicate through private messaging | P0 |
| DON-05 | They arrange delivery; recipient pays only the agreed courier charges | P0 |
| DON-06 | **Donors cannot charge for donated books** — donation listings have no price field; the UI and validation prevent adding one | P0 |
| DON-07 | Recipients pay the agreed delivery cost | P0 |
| DON-08 | Courier arrangements must be transparent — what is recorded/shown on the platform ⚠️ `OQ-28` | P0 |
| DON-09 | Donors may voluntarily cover shipping but are not required to (flag on the agreement, e.g. "Donor covers shipping") | P0 |
| DON-10 | Completed donations contribute to the donor's Honour Board ranking | P0 |
| DON-11 | Who confirms a donation as completed (donor, recipient, both, admin) ⚠️ `OQ-29` | P0 |
| DON-12 | Multi-book donations: "multiple books can be counted individually" — whether one listing can hold several books ⚠️ `OQ-30` | P0 |
| DON-13 [ENG] | Donor chooses which requester receives the book; other pending requests are notified that it is no longer available | P0 |
| DON-14 [ENG] | Donor can withdraw listing; a cancelled donation never counts toward ranking | P0 |
| DON-15 | Whether a requester must be logged in ⚠️ `OQ-02`; limit on concurrent requests per person ⚠️ `OQ-32` | P0 |
| DON-16 [C1 §4] | Recurring message: "The book is free. You pay only the agreed courier charge." shown on listing and request flow | P0 |

**Journey J7 — Donate:** Donor → *Donate a book* → details + photos (no price) → publish → Student requests with short message → private chat opens → they agree courier (e.g. ₹100, paid by recipient directly) → donor marks request *Accepted* → book shipped → completion confirmed (per `OQ-29`) → donor's count +1 → Honour Board updates.
**Example from source:** courier ₹100 → recipient pays ₹100, receives book free. [C1 §4]

**Errors:** donor tries to enter a price in description is not machine-detectable — handled by rules + reporting; request on already-accepted listing → "No longer available"; donation cancelled after acceptance → points not awarded.

### 5.8 Honour Board [C1 §5]
| ID | Requirement | Pri |
|---|---|---|
| HON-01 | Title "THE KESH SQUAD HONOUR BOARD", subtitle "Recognising those who give knowledge a second life." | P0 |
| HON-02 | Table: Rank · Donor (display name) · Books donated | P0 |
| HON-03 | Each completed book donation earns **one point**; ranking = total books donated | P0 |
| HON-04 | Multiple books are counted individually | P0 |
| HON-05 | Cancelled or uncompleted donations do not count | P0 |
| HON-06 | Rankings update when donations are confirmed | P0 |
| HON-07 | Badges: First Contribution (1), 5 Books Donated, 10 Books Donated, 25 Books Donated, Kesh Squad Legend (threshold ⚠️ `OQ-33`). Listed as "possible" — confirm adoption ⚠️ `OQ-33` | P1 |
| HON-08 | Only display name and donation statistics are public | P0 |
| HON-09 | Top three donors highlighted in gold | P0 |
| HON-10 | Tie-breaking rule ⚠️ `OQ-34`; time window (all-time vs. also monthly) ⚠️ `OQ-34`; opt-out of public listing ⚠️ `OQ-26` | P0 |
| HON-11 [ENG] | The illustrative "Donor A–E" names/figures in C1 are mock data only and must not ship to production | P0 |

### 5.9 Private inbox & messaging [C1 §3, §6, C2 §2]
| ID | Requirement | Pri |
|---|---|---|
| MSG-01 | Central inbox for marketplace and donation conversations "and other supported private interactions" (whether member-to-member DMs from community are in scope ⚠️ `OQ-36`) | P0 |
| MSG-02 | Conversations are private to participants; users can access only conversations they participate in | P0 |
| MSG-03 | One conversation per (listing, buyer/requester) pair — multiple buyers ⇒ separate conversations | P0 |
| MSG-04 | Phone numbers never displayed publicly; users may share contact details inside a private chat at their own discretion (⚠️ `OQ-37` whether to warn/mask) | P0 |
| MSG-05 | Guests can return to their conversations (mechanism ⚠️ `OQ-01`) | P0 |
| MSG-06 [ENG] | Real-time delivery when both parties are online; unread counts; last-message preview; timestamps | P0 |
| MSG-07 [ENG] | Listing context card at top of each conversation (title, price/free, status) | P0 |
| MSG-08 [C1 §6] | Report conversation/user; block user | P0 |
| MSG-09 [ENG] | Text only at launch (attachments ⚠️ `OQ-38`); message length ≤ 2,000 chars; rate-limited | P0 |
| MSG-10 | Notifications of new messages when offline (email/push) — not specified ⚠️ `OQ-39` | P1 |

**Errors:** send fails → message marked "Not sent — retry"; realtime disconnect → falls back to refresh and shows "Reconnecting…"; user blocked → composer disabled with explanation; listing removed → chat stays read-only.

### 5.10 Search [C1 §8]
| ID | Requirement | Pri |
|---|---|---|
| SRC-01 | Global search entry in header | P0 |
| SRC-02 | Results grouped: Books, Donations, Discussions, Videos | P0 |
| SRC-03 | Book search fields: name, author, subject, edition, course | P0 |
| SRC-04 [ENG] | Tolerant matching (case-insensitive, partial words); debounced input; empty and no-result states | P0 |

### 5.11 Accounts, profile and dashboard [C1 §6, §8]
| ID | Requirement | Pri |
|---|---|---|
| ACC-01 | Sign up / log in (method: email+password, email magic link, Google — ⚠️ `OQ-06`) | P0 |
| ACC-02 | Choose a unique public display name; change later (rate-limited) | P0 |
| ACC-03 | Phone number: if collected, private to owner only (whether to collect at all ⚠️ `OQ-37`) | P0 |
| ACC-04 | Dashboard: my sale listings, my donation listings, incoming interests/requests, conversations, availability updates | P0 |
| ACC-05 [ENG] | Account deletion / data export request path (DPDP Act 2023 compliance ⚠️ `OQ-35`) | P1 |
| ACC-06 [ENG] | Upgrade guest identity to full account without losing conversations | P1 ⚠️ `OQ-01` |

### 5.12 Trust, safety and moderation [C1 §6, §7]
| ID | Requirement | Pri |
|---|---|---|
| MOD-01 | Spam prevention (rate limits, bot protection on signup/guest/submissions) | P0 |
| MOD-02 | Reporting: posts, comments, listings, donation listings, users, conversations/messages | P0 |
| MOD-03 | Admin moderation queue: review, dismiss, remove content, warn/suspend user | P0 |
| MOD-04 | Before launch: published rules for delivery, payment disputes, refunds and suspected fraud | P0 |
| MOD-05 [ENG] | Moderators can view a reported conversation only through the report (scope ⚠️ `OQ-44` in OPEN_QUESTIONS) | P0 |
| MOD-06 [ENG] | Audit log of moderation actions | P1 |

### 5.13 Payments [C1 §7]
| ID | Requirement | Pri |
|---|---|---|
| PAY-01 | No integrated payment gateway in the initial version | P0 |
| PAY-02 | Sale: buyer and seller arrange payment and delivery directly; Kesh Squad does not collect the purchase amount | P0 |
| PAY-03 | Donation: book free; recipient pays only agreed courier charges; donor may cover shipping | P0 |
| PAY-04 | Clear, visible disclaimer that Kesh Squad facilitates discovery, communication and coordination, and does not process payments | P0 |

---

## 6. Business rules

### 6.1 Maximum selling price [C1 §3] — preserved exactly
| Book edition | Maximum price (% of original printed price) | Status in source |
|---|---|---|
| Current / newest edition | 75% | Stated |
| 1-year-old edition | 50% | **Proposed** — "can be finalised before development" |
| 2–3-year-old edition | 40% | **Proposed** |
| 4–5-year-old edition | 25% | **Proposed** |
| 6+ years old | **10–20%** | **Proposed — a range, not a single cap** ⚠️ `OQ-41` |

Worked example from source (original ₹1,000): current ₹750 · 1-year ₹500 · 2–3 years ₹400 · 4–5 years ₹250 · 6+ ≈ ₹100–₹200.

Implementation requirements:
- `PRC-01` **P0** Percentages are stored as configurable data (a pricing-rules table), not hard-coded, because the source marks them as proposed.
- `PRC-02` **P0** The same rule is evaluated in the UI (instant feedback) and enforced on the server (database constraint/trigger).
- `PRC-03` **P0** The applied rule and calculated cap are stored with the listing so later rule changes don't silently invalidate existing listings (behaviour of existing listings on rule change ⚠️ `OQ-43`).
- `PRC-04` **P0** Open definitions that block final implementation: how "age" is measured (years since publication year vs. editions behind the current one), who determines "current edition", rounding to the rupee, handling of age 0 non-current editions, and whether price = cap is allowed. ⚠️ `OQ-41`, `OQ-42`, `OQ-21`.

### 6.2 Donation rules [C1 §4] — preserved exactly
1. Donors cannot charge for donated books.
2. Recipients pay the agreed delivery cost.
3. Courier arrangements must be transparent.
4. Donors may voluntarily cover shipping, but are not required to.
5. Completed donations can contribute to the donor's Honour Board ranking.

### 6.3 Ranking rules [C1 §5] — preserved exactly
1 completed book = 1 point · ranking by total books donated · multiple books counted individually · cancelled/uncompleted don't count · update on confirmation.

### 6.4 Privacy rules [C1 §6, C2 §2] — preserved exactly
Phone numbers not public · buyer–seller conversations private · users access only their own conversations · display names for public interactions · spam prevention and reporting.

---

## 7. Listing & request lifecycles

**Sale listing:** `draft → available → reserved → sold` · `available/reserved → withdrawn` · any → `removed` (moderator).
**Donation listing:** `draft → available → reserved (request accepted) → donated (completed)` · `reserved → available` (donation fell through) · `available → withdrawn` · any → `removed`.
**Donation request:** `pending → accepted → completed` · `pending → declined | withdrawn | expired` · `accepted → cancelled`.
**AMA question:** `submitted → selected → answered` · `submitted → not_selected` · any → `removed`.
**Report:** `open → reviewing → actioned | dismissed`.

(Whether listings/requests auto-expire ⚠️ `OQ-32`.)

---

## 8. Non-functional requirements [ENG]
| Area | Requirement |
|---|---|
| Hosting cost | Free tiers during development and initial launch (Cloudflare Pages, Supabase Free) |
| Availability | Note: Supabase Free projects pause after ~7 days of inactivity — acceptable for dev; launch plan in roadmap |
| Security | No secrets in browser; RLS on every table; see SECURITY doc |
| Privacy | India DPDP Act 2023 awareness; minimal personal data; privacy policy before launch |
| SEO | Public pages have titles, descriptions, Open Graph tags (SPA limitations noted in architecture) |
| Browser support | Last 2 versions of Chrome, Edge, Safari (incl. iOS), Firefox; Android Chrome |
| Language | English UI; Indian locale formatting |
| Observability | Client error logging (free tier) and Supabase logs |

---

## 9. Milestone mapping (summary — detail in `IMPLEMENTATION_ROADMAP.md`)
- **Milestone A** — every page in §3.2 built with realistic mock data and prototype interactions, clearly marked as prototype.
- **Milestone B** — Supabase Auth, database, RLS, storage, realtime messaging, pricing/donation enforcement, moderation.
- **Milestone C** — integration, automated & manual testing, security review, legal/rules pages, production deployment on Cloudflare Pages.

## 10. Traceability — concept document coverage
| Concept section | Covered in |
|---|---|
| C1 §1 Theme & identity | §4.1 |
| C1 §2 Intro page | §5.1 |
| C1 §3 Marketplace & pricing | §5.6, §6.1 |
| C1 §4 Donations | §5.7, §6.2 |
| C1 §5 Honour Board | §5.8, §6.3 |
| C1 §6 Login & access, privacy | §2, §5.9, §5.11, §6.4 |
| C1 §7 Payments | §1.3, §5.13 |
| C1 §8 Navigation & homepage | §3, §5.2 |
| C2 §1 About | §1.1 |
| C2 §2 Sections (Home, Videos, AMA, Community, Marketplace, Donate, Inbox) | §5.2–5.9 |
| C2 §3 Vision | §1 |
