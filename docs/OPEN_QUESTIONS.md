# Kesh Squad — Open Questions, Conflicts & Assumptions

| Field | Value |
|---|---|
| Status | Awaiting owner answers |
| Date | 27 Oct 2026 |
| How to answer | Reply with the ID and your choice (e.g. "OQ-01: B"). "Proposed default" means what I will build in the **mock** prototype if you don't answer — it is never shipped to production without your confirmation. |

Sources: **[C1]** Complete Website Concept · **[C2]** Website Concept.

---

## 1. Conflicts and inconsistencies between the concept documents

| # | Conflict | Where | Impact | Question |
|---|---|---|---|---|
| CF-1 | **Ask Me Anything** is a main section in C2 but not in C1's main navigation (`Home | Videos | Community | Books | Donate | Honour Board`); C1 only has a Home "quick link". | C1 §8 vs C2 §2 | Navigation | OQ-07 |
| CF-2 | C1 lists "**Seller Login**" as a separate nav item, but both docs describe one community with display names; C1 also says buyers needn't have a traditional account. Unclear whether sellers have a different login type. | C1 §6, §8 | Auth design | OQ-06 |
| CF-3 | **Guest buyers vs. "return to conversations".** C1 wants no traditional account for buyers, yet they must return to private conversations securely, and only participants may access conversations. A purely anonymous identity is lost if the browser is cleared. | C1 §6 | Messaging security | OQ-01 |
| CF-4 | **Donation requests:** C1 says "visitors browse donations without logging in" and "an interested student requests a book", but doesn't say whether the requester needs an account — while buyers explicitly don't. | C1 §4, §6 | Access rules | OQ-02 |
| CF-5 | **Price cap wording:** "Sellers can choose any price *below* the applicable maximum" vs. the table titled "Maximum price" (implies ≤). | C1 §3 | Validation | OQ-21 |
| CF-6 | **6+ years: "10–20%"** is a range, not a maximum; the example says "approximately ₹100–₹200". A cap must be a single number (or a rule for choosing within the range). | C1 §3 | Pricing engine | OQ-41 |
| CF-7 | **Pricing percentages beyond current edition are "proposed"** and "can be finalised before development". | C1 §3 | Pricing | OQ-41 |
| CF-8 | **"Upvote or like"** — two different interaction models named. | C2 §2 | Community | OQ-13 |
| CF-9 | **Inbox scope:** C2 says the inbox covers marketplace conversations "and other supported private interactions" and that users "start instant chats or send interest requests, depending on the feature" — neither the other interactions nor which feature uses which pattern is defined. | C2 §2 | Messaging | OQ-27, OQ-36 |
| CF-10 | **Home "community updates"** (C2) is not in C1's homepage layout list. | C2 §2 vs C1 §8 | Home | OQ-09 |
| CF-11 | **Badges are "possible"** and "Kesh Squad Legend" has no threshold. | C1 §5 | Honour Board | OQ-33 |
| CF-12 | **Transparency of courier arrangements** is required but the platform processes no payments — what exactly must be recorded/shown isn't defined. | C1 §4, §7 | Donations | OQ-28 |
| CF-13 | **"Rankings update when donations are confirmed"** — confirmer not specified. | C1 §5 | Integrity | OQ-29 |
| CF-14 | **AMA:** "visitors can ask questions" (C2) — unclear whether non-logged-in visitors can submit. | C2 §2 | Spam/access | OQ-04 |
| CF-15 | **Project brief vs. concept:** the brief lists "donation requests" and "Ask Me Anything" in the Community pillar; C1 puts AMA in Community and donations in Social impact. No conflict in substance — noted only for navigation grouping. | Brief vs C1 | IA | OQ-07 |

---

## 2. Open questions

Priority: 🔴 blocks implementation of that area · 🟠 needed before Milestone B · 🟢 can wait until Milestone C or later.

### Identity, access & accounts
| ID | Question | Options / notes | Proposed default (mock only) | Pri |
|---|---|---|---|---|
| **OQ-01** | How should guest buyers get a secure identity that lets them return to conversations? | **A.** Anonymous session (Supabase anonymous sign-in) + optional "save my chats" by adding email later. Easiest; lost if browser data cleared before email added. **B.** Email one-time code ("lightweight account": email only, no password, no profile setup). Recoverable on any device; slightly more friction. **C.** A + B: start anonymous, prompt for email after first message. Also: how long should inactive guest data be kept? | **C** | 🔴 |
| **OQ-02** | Must a donation **requester** be logged in, or can guests request? | Guest (same as buyers) / member only | Same as buyers (guest allowed) | 🔴 |
| **OQ-03** | Can guests post, comment or upvote in Community? | Docs only say visitors can *read*. | Members only | 🟠 |
| **OQ-04** | Can visitors/guests submit AMA questions without logging in? | Open (with CAPTCHA) / guest / member only | Guest or member | 🟠 |
| **OQ-05** | Can non-signed-in visitors report content? | Yes with CAPTCHA / must have identity | Must have guest/member identity | 🟢 |
| **OQ-06** | Login methods and the "Seller Login" nav item: one shared account for all roles? Which methods — email+password, email magic link/OTP, Google sign-in? | | One account type; email+password + Google; nav label "Log in" (with "Sell" CTA) | 🟠 |
| **OQ-26** | Public profile pages? Avatars/bio? Can donors opt out of appearing on the Honour Board? | C1: only display name + donation stats public | Minimal profile (name, badges, donation count); opt-out allowed | 🟠 |
| **OQ-37** | Do we collect phone numbers at all? If users type a phone number in chat, should we warn, mask, or allow? | C1: "phone numbers are not publicly displayed" | Don't collect; allow in chat with a gentle safety tip | 🟠 |
| **OQ-44** | May moderators/admins read a private conversation when it is reported? Only the reported message, or the full thread? | Needed to act on fraud reports while honouring privacy | Reported message + 10 messages of context, logged | 🟠 |

### Navigation, home, design
| ID | Question | Proposed default | Pri |
|---|---|---|---|
| **OQ-07** | Should Ask Me Anything be in the main navigation? Where? | Keep C1 nav; AMA as a tab inside Community + Home quick link | 🔴 |
| **OQ-08** | Intro screen: every visit, first visit only, or once per session? | First visit per browser; logo click can replay | 🟠 |
| **OQ-09** | What are "community updates" on Home? (announcements by the creator?) | Omit for now | 🟢 |
| **OQ-46** | Is there an existing logo, wordmark or preferred fonts? | Text wordmark in a premium serif; I'll propose 2 options | 🟠 |

### Videos
| ID | Question | Options | Proposed default | Pri |
|---|---|---|---|---|
| **OQ-10** | Instagram Reels: embed inline, or show thumbnail + "Watch on Instagram"? (Instagram embeds require their script and may need a Meta app for oEmbed thumbnails.) | Embed / link-out | Link-out cards with manual thumbnail | 🟠 |
| **OQ-11** | How do videos get onto the site? Which YouTube channel and Instagram account? | **A.** Admin pastes URLs (free, simple). **B.** Auto-sync YouTube via RSS/API (needs a Worker/cron with API key). | A at launch | 🔴 for B |
| **OQ-12** | Should each video have its own discussion thread? | Yes via linked community post / no | Yes, "Discuss" button creates/links a post | 🟢 |

### Community
| ID | Question | Proposed default | Pri |
|---|---|---|---|
| **OQ-13** | Upvotes only, or upvotes + downvotes ("upvote or like")? Can users vote on their own content? | Upvote only; no self-vote | 🟠 |
| **OQ-14** | Definitions: Popular (most upvotes all-time? this week?), Trending (recent velocity)? | Popular = top score in last 30 days; Trending = score/age decay over 48 h; Recent = newest | 🟢 |
| **OQ-15** | Post categories/flairs? List? | Videos, College Life, Experiences, Random, Books, AMA | 🟠 |
| **OQ-16** | Images or links in posts? | Text + auto-linked URLs only at launch | 🟢 |
| **OQ-17** | Length limits for titles/posts/comments | 150 / 10,000 / 5,000 chars | 🟢 |
| **OQ-31** | Will there be moderators besides the creator? Can moderators suspend users? | Admin role only at launch; moderator role built but unused | 🟠 |

### AMA
| ID | Question | Proposed default | Pri |
|---|---|---|---|
| **OQ-18** | Are submitted (unanswered) questions public? Can others upvote them to signal interest? | Private until selected; no voting | 🟠 |

### Marketplace & pricing
| ID | Question | Proposed default | Pri |
|---|---|---|---|
| **OQ-41** | **Finalise the pricing table.** Confirm 50 / 40 / 25 % for 1, 2–3, 4–5 years, and choose a **single** cap for 6+ years (10%? 15%? 20%?), or a rule within 10–20% (e.g. by condition). | Mock uses table as written with **20%** as the 6+ cap, labelled "proposed" | 🔴 |
| **OQ-42** | **How is "age" measured and who decides "current edition"?** (a) years since publication year, (b) number of editions behind the current one, or (c) seller declares current/older + publication year, and age = current year − publication year. What if a book is not the current edition but was published this year (age 0)? Rounding: down to nearest ₹1 / ₹10? | (c), age 0 non-current treated as "1-year" band; round down to ₹1 | 🔴 |
| **OQ-21** | Is a price **equal to** the cap allowed ("below the maximum" vs "maximum price")? | Allowed (≤) | 🔴 |
| **OQ-43** | If you change percentages later, do existing listings keep their old cap or must they be re-priced? | Keep old cap (snapshot) | 🟢 |
| **OQ-19** | Book condition scale | Like new / Good / Fair / Heavily used (+ "has highlights/notes" checkbox) | 🟠 |
| **OQ-20** | Photos: min/max count, mandatory photos (e.g. cover + printed price page)? | 1–6, cover required | 🟠 |
| **OQ-25** | Should sellers prove the original printed price (photo of price on book)? | Encouraged, not required | 🟠 |
| **OQ-22** | Only MBBS and BDS, or also other courses (BAMS, BHMS, Nursing, PG entrance books)? Can a book be tagged for both MBBS and BDS? | MBBS, BDS; multi-select | 🟠 |
| **OQ-23** | Subject list per course | Standard Indian MBBS (CBME) & BDS subjects; you review | 🟠 |
| **OQ-24** | Should listings show the seller's city/state to help with courier/meet-up? | City (optional), never full address | 🟠 |
| **OQ-27** | "Express interest": one-tap interest that the seller accepts before chatting, or opens a chat instantly? | Opens a chat instantly with a pre-filled first message | 🔴 |
| **OQ-32** | Limits/expiry: max active listings per user? Listings auto-expire after N days? Max pending donation requests per person? | No listing cap; reminder at 60 days; max 3 pending donation requests | 🟢 |
| **OQ-51** | Upper bounds for original price and courier charge (sanity limits) | Original ≤ ₹50,000; courier ≤ ₹5,000 | 🟢 |

### Donations & Honour Board
| ID | Question | Proposed default | Pri |
|---|---|---|---|
| **OQ-28** | What does "transparent courier arrangements" require on the platform? Record the agreed courier charge in the request? Show it to both parties? Require a tracking number? | Agreed amount + "donor covers shipping" flag recorded on acceptance; optional tracking note; visible to both parties only | 🔴 |
| **OQ-29** | Who confirms a donation is complete? (donor only / recipient only / **both** / admin) | **Both** (donor marks shipped, recipient confirms received); auto-complete if recipient silent 14 days? — needs your call | 🔴 |
| **OQ-30** | Can one donation listing contain several books (a set)? Can a recipient take only some of them? | Yes, quantity field; each book counted individually | 🟠 |
| **OQ-33** | Adopt badges? Threshold for "Kesh Squad Legend"? | Adopt; Legend = 50 books | 🟢 |
| **OQ-34** | Honour Board ties and time windows (all-time only, or also monthly/yearly)? | All-time; tie → earlier to reach the count ranks higher | 🟢 |

### Messaging
| ID | Question | Proposed default | Pri |
|---|---|---|---|
| **OQ-36** | Are member-to-member DMs (outside listings) in scope at launch? | No — only listing-based chats | 🟠 |
| **OQ-38** | Photo attachments in chat (e.g. to show a book page)? | No at launch | 🟢 |
| **OQ-39** | Notify users of new messages when they're offline? (email / browser push / none) | Email digest via SMTP if a free provider is configured; otherwise in-app only | 🟠 |

### Legal, operations, hosting
| ID | Question | Proposed default | Pri |
|---|---|---|---|
| **OQ-35** | Who writes/approves Terms, Privacy Policy, marketplace rules (delivery, disputes, refunds, fraud) and community guidelines? Minimum user age? Data retention? (India DPDP Act 2023.) | I draft plain-language versions for your/legal review; not legal advice | 🔴 for C |
| **OQ-40** | Success metrics and whether to use analytics (e.g. Cloudflare Web Analytics, cookie-free) | Cloudflare Web Analytics | 🟢 |
| **OQ-45** | Approve supporting libraries: React Router, TanStack Query, Zod, React Hook Form, date-fns, clsx/tailwind-merge, browser-image-compression, Vitest, Testing Library, Playwright | Approve | 🔴 |
| **OQ-47** | Email provider for auth emails (Supabase built-in emails are rate-limited and not for production) — e.g. Resend / Brevo free tiers | Decide before C4 | 🟠 |
| **OQ-48** | Rich link previews for shared listings (needs prerender or a Pages Function) — needed at launch? | Post-launch | 🟢 |
| **OQ-49** | Stay on Supabase Free at launch (project pauses when idle, no automated backups) or budget for Pro later? | Free + scheduled `pg_dump` backups | 🟠 |
| **OQ-50** | Domain name (e.g. keshsquad.com/.in) — owned yet? | Use `*.pages.dev` until provided | 🟢 |

---

## 3. Blocking by milestone

| Milestone | Must be answered first | Can proceed with proposed defaults (mock) |
|---|---|---|
| **A (frontend)** | OQ-45 (libraries), OQ-07 (nav) | Everything else — mock uses the defaults above, clearly labelled |
| **B (backend)** | OQ-01, OQ-02, OQ-06, OQ-11, OQ-21, OQ-27, OQ-28, OQ-29, OQ-41, OQ-42, plus 🟠 items affecting schema (OQ-13, OQ-19, OQ-22, OQ-24, OQ-30, OQ-36, OQ-37, OQ-44) | 🟢 items |
| **C (launch)** | OQ-35, OQ-47, OQ-49, OQ-50 | — |

---

## 4. Engineering assumptions (not business rules — please flag if wrong)
- English UI, Indian Rupee formatting, Asia/Kolkata timezone for display.
- Users are students (adults); a minimum-age statement belongs in the Terms (OQ-35).
- Kesh Squad never stores payment details, bank/UPI IDs, or delivery addresses on the platform.
- Images are compressed and EXIF-stripped on upload to protect location privacy.
- The illustrative Honour Board names (Donor A–E) and all mock fixtures are fake and will not ship to production.
