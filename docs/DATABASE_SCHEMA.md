# Kesh Squad — Database Schema (Supabase PostgreSQL)

| Field | Value |
|---|---|
| Status | Draft v0.1 — logical design; SQL migrations are written in Milestone B |
| Date | 27 Oct 2026 |
| Depends on | `PRODUCT_REQUIREMENTS.md`, `SECURITY_AND_PERMISSIONS.md` |

Conventions: `snake_case`; primary keys `uuid` (`gen_random_uuid()`); `created_at`/`updated_at timestamptz default now()` on every table (updated by trigger); soft moderation via `status` columns rather than hard deletes where audit matters. All tables live in `public` with **RLS enabled**. Fields marked ⚠️ depend on an open question and may change.

---

## 1. Entity overview

```
auth.users (Supabase) 1──1 profiles 1──1 profile_private
                         │
     ┌───────────────────┼──────────────────────┬────────────────┬──────────────┐
     │                   │                      │                │              │
  listings ──< listing_images            posts ──< comments   ama_questions   reports
  (sale | donation)                         │         │
     │  └── pricing_rules (FK, sale only)   └─< votes >┘
     │
     ├──< conversations ──< conversation_participants
     │         └──< messages
     │
     └──< donation_requests ──(1:1)── conversations
                └── on completion → donation_completions → honour_board (view)
                                                         → user_badges >── badges
videos ──(0..1)── posts (discussion thread for a video)  ⚠️ OQ-12
user_blocks · moderation_actions · rate_limit_events · app_settings
```

Enumerated types (Postgres `enum` or `text` + `CHECK`; final values depend on open questions):

| Type | Values |
|---|---|
| `user_role` | `member`, `moderator`, `admin` |
| `account_status` | `active`, `suspended`, `banned` |
| `course` | `MBBS`, `BDS` (+ others? ⚠️ OQ-22) |
| `listing_type` | `sale`, `donation` |
| `book_condition` | proposed `like_new`, `good`, `fair`, `heavily_used` ⚠️ OQ-19 |
| `sale_status` / `donation_status` (single `listing_status`) | `draft`, `available`, `reserved`, `sold`, `donated`, `withdrawn`, `removed` |
| `donation_request_status` | `pending`, `accepted`, `completed`, `declined`, `withdrawn`, `cancelled`, `expired` |
| `conversation_kind` | `sale`, `donation`, `direct` (direct only if ⚠️ OQ-36 approves) |
| `video_platform` | `youtube_video`, `youtube_short`, `instagram_reel` |
| `ama_status` | `submitted`, `selected`, `answered`, `not_selected`, `removed` |
| `content_status` | `published`, `removed_by_author`, `removed_by_moderator` |
| `report_target` | `post`, `comment`, `listing`, `user`, `message`, `conversation`, `ama_question` |
| `report_status` | `open`, `reviewing`, `actioned`, `dismissed` |

---

## 2. Tables

### 2.1 `profiles` — public identity (1:1 with `auth.users`)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK, FK → `auth.users.id` ON DELETE CASCADE | |
| `display_name` | citext UNIQUE NOT NULL | 3–30 chars, `^[A-Za-z0-9_. -]+$`, reserved names blocked (admin, kesh, …) |
| `avatar_url` | text NULL | ⚠️ OQ-26 |
| `bio` | text NULL ≤ 280 | ⚠️ OQ-26 |
| `course` | course NULL | optional self-declared |
| `role` | user_role NOT NULL default `member` | changed only by admins (column-level protection) |
| `status` | account_status NOT NULL default `active` | |
| `is_guest` | boolean NOT NULL default false | mirrors `auth.users.is_anonymous` (⚠️ OQ-01) |
| `show_on_honour_board` | boolean NOT NULL default true | ⚠️ OQ-26 |
| `display_name_changed_at` | timestamptz | rate-limit renames |
| `created_at`, `updated_at` | timestamptz | |

Created automatically by trigger on `auth.users` insert (guest gets generated name, e.g. `Amigo-4821`).

### 2.2 `profile_private` — never publicly readable
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK FK → profiles.id | |
| `phone` | text NULL | only if collection approved ⚠️ OQ-37; E.164 format |
| `city` | text NULL | ⚠️ OQ-24 |
| `accepted_rules_at` | timestamptz NULL | marketplace/donation rules acceptance (MOD-04) |
| `accepted_terms_version` | text NULL | |

### 2.3 `pricing_rules` — configurable price caps (C1 §3)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `label` | text | e.g. "Current / newest edition" |
| `is_current_edition` | boolean | true only for the current-edition rule |
| `min_age_years` | int NULL | inclusive; age definition ⚠️ OQ-42 |
| `max_age_years` | int NULL | inclusive; NULL = open-ended (6+) |
| `max_percent` | numeric(5,2) NOT NULL CHECK (0 < x ≤ 100) | 6+ value ⚠️ OQ-41 |
| `active` | boolean | |
| `effective_from` | timestamptz | |
| `sort_order` | int | |

Seed (from C1, flagged *proposed* except current edition):
| label | current | min | max | max_percent |
|---|---|---|---|---|
| Current / newest edition | true | — | — | 75 |
| 1-year-old edition | false | 1 | 1 | 50 |
| 2–3-year-old edition | false | 2 | 3 | 40 |
| 4–5-year-old edition | false | 4 | 5 | 25 |
| 6+ years old | false | 6 | NULL | **10–20 → single value required** ⚠️ OQ-41 |

### 2.4 `listings` — sale and donation listings
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `owner_id` | uuid FK → profiles.id NOT NULL | must be non-guest member |
| `listing_type` | listing_type NOT NULL | |
| `title` | text NOT NULL (2–200) | book name |
| `author` | text NOT NULL (2–200) | |
| `edition_label` | text NOT NULL | e.g. "10th", "2024 reprint" |
| `is_current_edition` | boolean NOT NULL | seller-declared ⚠️ OQ-42 |
| `publication_year` | smallint NOT NULL CHECK (1950 ≤ y ≤ current year) | |
| `subject_id` | uuid FK → subjects.id NOT NULL | |
| `course` | course NOT NULL | or `course[]` if a book is for both ⚠️ OQ-22 |
| `condition` | book_condition NOT NULL | |
| `description` | text NULL ≤ 2000 | |
| `quantity` | int NOT NULL default 1 CHECK (≥1) | for multi-book donations ⚠️ OQ-30 |
| `original_price` | integer (₹) NULL | required for `sale`; optional/hidden for donation |
| `asking_price` | integer (₹) NULL | **required for sale; must be NULL for donation** |
| `pricing_rule_id` | uuid FK → pricing_rules NULL | snapshot of rule applied (sale) |
| `max_allowed_price` | integer NULL | snapshot computed by trigger |
| `donor_covers_shipping` | boolean NULL | donation default/offer (C1 §4) |
| `city` | text NULL | ⚠️ OQ-24 |
| `status` | listing_status NOT NULL default `available` | |
| `interest_count` | int default 0 | maintained by trigger |
| `search_vector` | tsvector GENERATED | title, author, edition_label, subject name, course |
| `published_at`, `created_at`, `updated_at` | timestamptz | |

Constraints:
- `CHECK (listing_type <> 'donation' OR asking_price IS NULL)` — **donors cannot charge** (C1 §4).
- `CHECK (listing_type <> 'sale' OR (original_price > 0 AND asking_price > 0))`.
- Trigger `enforce_price_cap`: for `sale`, selects the active rule matching `is_current_edition` / age, sets `pricing_rule_id`, `max_allowed_price = floor(original_price * max_percent / 100)` (rounding ⚠️ OQ-42), raises error if `asking_price > max_allowed_price` (or `>=`, ⚠️ OQ-21).
- Status transitions validated by trigger (e.g. `sold` only from `available|reserved`; `donated` only via RPC).
- Indexes: GIN on `search_vector`; trigram GIN on `title`, `author`; btree `(listing_type, status, published_at desc)`; `(owner_id)`.

### 2.5 `listing_images`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `listing_id` | uuid FK → listings ON DELETE CASCADE | |
| `storage_path` | text NOT NULL | `listing-images/{owner_id}/{listing_id}/{uuid}.webp` |
| `width`, `height` | int | |
| `sort_order` | smallint | 0 = cover |
| `alt_text` | text NULL | |
Max images per listing enforced by trigger (⚠️ OQ-20, proposed 6).

### 2.6 `subjects`
| `id` uuid PK · `name` text · `course` course · `sort_order` · `active` | — list ⚠️ OQ-23 |

### 2.7 `conversations`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `kind` | conversation_kind NOT NULL | |
| `listing_id` | uuid FK → listings NULL | required for sale/donation |
| `initiator_id` | uuid FK → profiles | buyer / requester (guest or member) |
| `owner_id` | uuid FK → profiles | seller / donor |
| `last_message_at` | timestamptz | |
| `last_message_preview` | text ≤ 120 | |
| `created_at` | timestamptz | |
`UNIQUE (listing_id, initiator_id)` — **one private conversation per buyer per listing** (C1 §3). `CHECK (initiator_id <> owner_id)`. Created only through `start_conversation()` RPC.

### 2.8 `conversation_participants`
| `conversation_id` FK · `user_id` FK · `role` (`initiator`/`owner`) · `last_read_at` · `archived` bool · `muted` bool · PK(conversation_id, user_id) |
Used by RLS (`is_participant(conversation_id)`) and unread counts.

### 2.9 `messages`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `conversation_id` | uuid FK ON DELETE CASCADE | |
| `sender_id` | uuid FK → profiles | must equal `auth.uid()` |
| `body` | text NOT NULL (1–2000) | text only ⚠️ OQ-38 |
| `kind` | text default `user` | `user` / `system` (e.g. "Listing marked sold") |
| `created_at` | timestamptz | |
| `edited_at`, `deleted_at` | timestamptz NULL | |
Index `(conversation_id, created_at desc)`. Added to `supabase_realtime` publication. Trigger updates `conversations.last_message_*`.

### 2.10 `donation_requests`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `listing_id` | uuid FK → listings (type = donation) | |
| `requester_id` | uuid FK → profiles | ⚠️ OQ-02 guest allowed? |
| `conversation_id` | uuid FK → conversations UNIQUE | chat opened on request |
| `message` | text ≤ 500 | why they need it |
| `books_requested` | int default 1 | ⚠️ OQ-30 |
| `status` | donation_request_status | |
| `agreed_courier_charge` | integer (₹) NULL CHECK ≥ 0 | transparency record ⚠️ OQ-28 |
| `donor_covers_shipping` | boolean NULL | voluntary (C1 §4) |
| `accepted_at`, `donor_confirmed_at`, `recipient_confirmed_at`, `completed_at`, `cancelled_at` | timestamptz | confirmation model ⚠️ OQ-29 |
| `cancel_reason` | text NULL | |
`UNIQUE (listing_id, requester_id)`; `CHECK (requester_id <> listing.owner)` via trigger. Transitions only through RPCs.

### 2.11 `donation_completions` — ledger feeding the Honour Board
| `id` · `donation_request_id` UNIQUE FK · `donor_id` FK · `recipient_id` FK · `books_count` int CHECK ≥ 1 · `completed_at` · `revoked_at` NULL · `revoked_reason` |
Inserted only by `confirm_donation_completed()`; one row per completed request; `books_count` counted individually (C1 §5). Revocation (e.g. fraud found) sets `revoked_at` so it drops off the board.

### 2.12 `honour_board` (VIEW, optionally MATERIALIZED)
```
select donor_id, p.display_name,
       sum(books_count) as books_donated,
       min(completed_at) as first_donation_at,
       max(completed_at) as last_donation_at,
       rank() over (order by sum(books_count) desc /* tie-break ⚠️ OQ-34 */) as rank
from donation_completions dc join profiles p on p.id = dc.donor_id
where dc.revoked_at is null and p.show_on_honour_board and p.status = 'active'
group by donor_id, p.display_name;
```
Exposes **only** display name + donation stats (C1 §5).

### 2.13 `badges` / `user_badges`
`badges(id text PK, name, description, threshold_books int, sort_order)` seeded: `first_contribution` (1), `five_books` (5), `ten_books` (10), `twenty_five_books` (25), `legend` (⚠️ OQ-33).
`user_badges(user_id, badge_id, awarded_at, PK(user_id, badge_id))` — awarded by trigger on `donation_completions`.

### 2.14 `posts`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `author_id` | uuid FK → profiles | |
| `title` | text (5–150) | ⚠️ OQ-17 |
| `body` | text (1–10000) | markdown-lite, sanitised on render |
| `category` | text NULL | ⚠️ OQ-15 |
| `video_id` | uuid FK → videos NULL | ⚠️ OQ-12 |
| `score` | int default 0 | upvotes (− downvotes ⚠️ OQ-13) |
| `comment_count` | int default 0 | |
| `hot_rank` | double precision | for Trending ⚠️ OQ-14 |
| `status` | content_status | |
| `is_pinned`, `is_locked` | boolean | admin |
| `edited_at`, `created_at`, `updated_at` | timestamptz | |
Indexes: `(status, created_at desc)`, `(status, score desc)`, `(status, hot_rank desc)`, GIN full-text.

### 2.15 `comments`
| `id` · `post_id` FK · `parent_id` FK → comments NULL · `author_id` · `body` (1–5000) · `depth` smallint (≤ 5 display) · `score` · `status` content_status · `edited_at` · `created_at` |
Deleted-with-replies comments keep the row with `status=removed_by_author` and body hidden.

### 2.16 `votes`
| `user_id` · `target_type` (`post`/`comment`) · `target_id` uuid · `value` smallint CHECK (value IN (1) or (-1,1) ⚠️ OQ-13) · `created_at` · PK(user_id, target_type, target_id) |
Trigger updates `score`. Users cannot vote on own content (⚠️ product choice — proposed default allow? listed in OQ-13).

### 2.17 `videos`
| `id` · `platform` video_platform · `external_id` text · `url` · `title` · `description` NULL · `thumbnail_url` · `published_at` · `is_featured` bool · `status` (`published`/`hidden`) · `created_by` FK · UNIQUE(platform, external_id) |
Populated by admin entry or sync job ⚠️ OQ-11.

### 2.18 `ama_questions`
| `id` · `asker_id` FK NULL (if anonymous submission allowed ⚠️ OQ-04) · `body` (10–500) · `is_public` bool ⚠️ OQ-18 · `status` ama_status · `answer_text` NULL · `answer_url` NULL · `answer_type` (`video`/`short`/`reel`/`post`/`text`) · `answer_video_id` FK NULL · `answer_post_id` FK NULL · `upvotes` int ⚠️ OQ-18 · `selected_at` · `answered_at` · `created_at` |

### 2.19 `reports`
| `id` · `reporter_id` FK · `target_type` report_target · `target_id` uuid · `reason` (`spam`, `scam_or_fraud`, `harassment`, `inappropriate`, `price_rule_violation`, `charging_for_donation`, `other`) · `details` ≤ 1000 · `status` report_status · `assigned_to` FK NULL · `resolution_note` · `resolved_at` · `created_at` |
`UNIQUE (reporter_id, target_type, target_id)` to stop duplicate spam reports.

### 2.20 `moderation_actions` (audit log)
| `id` · `actor_id` · `action` (`remove_content`, `restore_content`, `suspend_user`, `unsuspend_user`, `change_role`, `revoke_donation`, `dismiss_report`, `edit_pricing_rule`) · `target_type` · `target_id` · `report_id` NULL · `note` · `created_at` | Append-only.

### 2.21 `user_blocks`
| `blocker_id` · `blocked_id` · `created_at` · PK(blocker_id, blocked_id) | Blocks messaging both ways.

### 2.22 `rate_limit_events`
| `user_id` · `action` text · `created_at` | Written by triggers/RPCs; checked by `check_rate_limit(action, max, window)`; purged after 7 days.

### 2.23 `app_settings`
| `key` text PK · `value` jsonb · `updated_by` · `updated_at` | e.g. max images, limits, feature flags (guest messaging on/off).

---

## 3. Server-side functions (RPC) — Milestone B
| Function | Caller | Purpose |
|---|---|---|
| `start_conversation(p_listing_id, p_first_message)` | guest/member | Validates listing `available`, caller ≠ owner, not blocked, rules accepted; upserts conversation + participants (idempotent); inserts first message; increments `interest_count` |
| `request_donation(p_listing_id, p_message, p_books)` | member (guest ⚠️ OQ-02) | Creates `donation_requests` + conversation |
| `accept_donation_request(p_request_id, p_courier_charge, p_donor_covers)` | donor | Sets accepted; listing → `reserved`; notifies other requesters (system messages) |
| `confirm_donation_completed(p_request_id)` | donor and/or recipient ⚠️ OQ-29 | Records confirmation; when complete → `donation_completions` row, listing → `donated` (or decrement quantity), badges |
| `cancel_donation_request(p_request_id, p_reason)` | either party | Sets cancelled; listing back to `available`; no points |
| `set_listing_status(p_listing_id, p_status)` | owner | Validated transition; posts system message to open conversations when sold/withdrawn |
| `mark_conversation_read(p_conversation_id)` | participant | Updates `last_read_at` |
| `cast_vote(p_target_type, p_target_id, p_value)` | member | Upsert/remove vote; rate-limited |
| `submit_report(...)` | identity | Insert report; rate-limited |
| `admin_*` (resolve report, remove content, suspend user, set role, revoke completion, update pricing rule) | admin/mod | Checked by `is_admin()` / `is_moderator()`; writes `moderation_actions` |
| `get_unread_counts()` | identity | Inbox badge |
| `search_all(p_query)` | anyone | Grouped results across listings/posts/videos (published only) |

Helper SQL functions (STABLE, SECURITY DEFINER with fixed `search_path`): `is_admin()`, `is_moderator()`, `is_participant(conv_id)`, `is_member()` (non-anonymous), `is_blocked(a, b)`, `current_max_price(original, is_current, pub_year)`.

---

## 4. Storage buckets
| Bucket | Read | Write | Limits |
|---|---|---|---|
| `listing-images` | Public | Authenticated non-guest; path prefix must equal `auth.uid()` | `image/jpeg, image/png, image/webp`; ≤ 2 MB post-compression (bucket limit) |
| `avatars` (⚠️ OQ-26) | Public | Owner only | ≤ 512 KB |

Removed listings: images moved/deleted by admin action; sold listings keep images (proposed retention ⚠️ OQ-35).

---

## 5. Data retention & privacy (proposed, needs owner/legal review ⚠️ OQ-35)
- Messages retained while either participant's account exists; deleted account → messages anonymised ("Deleted user").
- Rate-limit events purged after 7 days; reports retained 1 year.
- Guest accounts with no activity for N days purged (N ⚠️ OQ-01).

---

## 6. Mock data parity (Milestone A)
`services/mock/fixtures` mirrors these entities with the same field names (camelCase in TS) so mappers are the only translation layer. Fixtures include: ~40 realistic MBBS/BDS textbooks across subjects (Anatomy, Physiology, Biochemistry, Pathology, Pharmacology, Microbiology, Forensic Medicine, Community Medicine, ENT, Ophthalmology, Medicine, Surgery, OBG, Paediatrics; BDS: Dental Anatomy, Oral Pathology, Prosthodontics, Orthodontics, Conservative Dentistry, etc.), ~15 donations, ~30 posts with threaded comments, ~20 videos/shorts/reels (placeholder IDs until real channel links are provided ⚠️ OQ-11), AMA in all states, illustrative Honour Board donors (clearly fictional), and sample conversations.
