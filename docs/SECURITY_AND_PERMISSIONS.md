# Kesh Squad — Security & Permissions

| Field | Value |
|---|---|
| Status | Draft v0.1 — awaiting owner approval |
| Date | 27 Oct 2026 |
| Depends on | `DATABASE_SCHEMA.md` |

---

## 1. Security principles
1. **The database is the security boundary.** The browser is untrusted. Every table has Row Level Security (RLS) enabled; route guards and hidden buttons are UX only.
2. **No secrets in browser code.** Only the Supabase URL and publishable (anon) key reach the client. Service-role/secret keys, DB passwords, SMTP and CAPTCHA secrets live only in Supabase settings, the CLI on a trusted machine, or CI secrets.
3. **Least privilege.** Default deny; grant per role, per operation, per row. Sensitive columns (role, status, counters, price cap snapshot) are not client-writable.
4. **Multi-row state changes go through RPCs** (`SECURITY DEFINER`, fixed `search_path = ''`, explicit authorisation checks inside).
5. **Privacy by design** (C1 §6): phone numbers never public; conversations private; display names only.
6. **Mock ≠ production.** Milestone A shows a visible prototype indicator; no mock flow is described as secure or live.

---

## 2. Identities and roles

| Identity | Supabase representation | Helper |
|---|---|---|
| Visitor | No session — Postgres role `anon` | — |
| Guest (⚠️ OQ-01) | Anonymous sign-in: role `authenticated`, JWT claim `is_anonymous = true` | `is_guest()` |
| Member | `authenticated`, `is_anonymous = false`, `profiles.status = 'active'` | `is_member()` |
| Moderator | Member + `profiles.role = 'moderator'` | `is_moderator()` (true for admin too) |
| Admin / Creator | Member + `profiles.role = 'admin'` | `is_admin()` |
| Suspended | Member with `status = 'suspended'` → treated as read-only | `is_active()` |

Role changes only via `admin_set_role()`; `profiles.role` and `profiles.status` are excluded from the client `UPDATE` grant (column privileges) and guarded by trigger.

---

## 3. Permission matrix (authoritative)

Legend: ✅ allowed · ❌ denied · **own** = rows where the user is owner/author · **part** = participant · ⚠️ = depends on open question.

### 3.1 Content & community
| Resource / action | Visitor | Guest | Member | Moderator | Admin |
|---|---|---|---|---|---|
| Read published videos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create/edit/hide videos | ❌ | ❌ | ❌ | ❌ | ✅ |
| Read published posts & comments | ✅ | ✅ | ✅ | ✅ (incl. removed) | ✅ (incl. removed) |
| Create post | ❌ | ⚠️ OQ-03 (default ❌) | ✅ | ✅ | ✅ |
| Create comment / reply | ❌ | ⚠️ OQ-03 (default ❌) | ✅ (not on locked posts) | ✅ | ✅ |
| Edit / delete post or comment | ❌ | ❌ | own | own + remove any | ✅ |
| Vote | ❌ | ⚠️ OQ-03 | ✅ one per target | ✅ | ✅ |
| Pin / lock post | ❌ | ❌ | ❌ | ✅ | ✅ |
| Submit AMA question | ⚠️ OQ-04 | ⚠️ OQ-04 | ✅ | ✅ | ✅ |
| Read AMA questions | answered (+ public submitted ⚠️ OQ-18) | same + own | same + own | all | all |
| Select / answer / reject AMA | ❌ | ❌ | ❌ | ❌ | ✅ |

### 3.2 Marketplace & donations
| Resource / action | Visitor | Guest | Member | Moderator | Admin |
|---|---|---|---|---|---|
| Browse/search listings (`available`, `reserved`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| View `sold`/`donated`/`withdrawn` listing | ❌ (404) | if part of a conversation on it | own, or part | ✅ | ✅ |
| View `draft` listing | ❌ | ❌ | own | ✅ | ✅ |
| Create sale or donation listing | ❌ | ❌ | ✅ (rules accepted) | ✅ | ✅ |
| Edit listing / change status | ❌ | ❌ | own (validated transitions) | remove only | ✅ |
| Upload listing images | ❌ | ❌ | own path only | ❌ | ✅ |
| Express interest / start sale conversation | ❌ → prompt | ✅ (not own) | ✅ (not own) | ✅ | ✅ |
| Request donation | ❌ → prompt | ⚠️ OQ-02 | ✅ (not own) | ✅ | ✅ |
| Accept / decline request | ❌ | ❌ | donor (own listing) | ❌ | ✅ |
| Confirm donation completed | ❌ | ⚠️ OQ-29 recipient | donor/recipient per OQ-29 | ❌ | ✅ (and revoke) |
| Read Honour Board | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit pricing rules | ❌ | ❌ | ❌ | ❌ | ✅ (audited) |

### 3.3 Messaging & private data
| Resource / action | Visitor | Guest | Member | Moderator | Admin |
|---|---|---|---|---|---|
| List conversations | ❌ | part | part | part | part |
| Read messages | ❌ | part | part | **only via an open report on that conversation** (⚠️ OQ-44) | same as moderator |
| Send message | ❌ | part, not blocked, active | same | same | same |
| Edit/delete own message | ❌ | own (≤ 15 min edit, proposed) | same | — | — |
| Block user | ❌ | ✅ | ✅ | ✅ | ✅ |
| Read `profile_private` (phone, city) | ❌ | own | own | ❌ | ❌ (⚠️ OQ-44 for fraud cases) |
| Read `profiles` public columns | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update own profile | ❌ | display name only (⚠️) | ✅ excl. role/status | ✅ | ✅ |
| Submit report | ⚠️ OQ-05 (default ❌) | ✅ | ✅ | ✅ | ✅ |
| Read / resolve reports | ❌ | own submitted (status only) | own submitted | ✅ | ✅ |
| Suspend user / change role | ❌ | ❌ | ❌ | suspend ⚠️ OQ-31 | ✅ |

---

## 4. RLS policy sketch (implemented as SQL in Milestone B)

```sql
-- listings: public browse
create policy listings_public_read on listings for select
  using (status in ('available','reserved')
         or owner_id = (select auth.uid())
         or exists (select 1 from conversations c
                    join conversation_participants p on p.conversation_id = c.id
                    where c.listing_id = listings.id and p.user_id = (select auth.uid()))
         or public.is_moderator());

create policy listings_owner_insert on listings for insert to authenticated
  with check (owner_id = (select auth.uid()) and public.is_member() and public.is_active());

create policy listings_owner_update on listings for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
-- (status transitions + price cap enforced by triggers; no DELETE policy — withdraw instead)

-- messages: participants only
create policy messages_participant_read on messages for select to authenticated
  using (public.is_participant(conversation_id));

create policy messages_participant_insert on messages for insert to authenticated
  with check (sender_id = (select auth.uid())
              and public.is_participant(conversation_id)
              and not public.conversation_blocked(conversation_id)
              and public.check_rate_limit('message', 30, interval '1 minute'));

-- conversations: no direct INSERT policy → only start_conversation() RPC can create.

-- profile_private: owner only
create policy private_owner on profile_private for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
```

Realtime: `messages` added to the `supabase_realtime` publication; Supabase Realtime applies the SELECT policy, so a user only receives rows for conversations they participate in. Clients subscribe with a `conversation_id=eq.<id>` filter.

Storage policies (`storage.objects`):
- `listing-images`: `SELECT` public; `INSERT/UPDATE/DELETE` only when `(storage.foldername(name))[1] = auth.uid()::text` and `is_member()`.

---

## 5. Required automated security tests (pgTAP, Milestone B)
| # | Test | Expected |
|---|---|---|
| S1 | User C selects messages of conversation between A and B | 0 rows |
| S2 | User C inserts message into A–B conversation | error |
| S3 | User A inserts message with `sender_id = B` | error |
| S4 | Anon reads `profile_private` | 0 rows |
| S5 | Member updates own `profiles.role` to admin | error / unchanged |
| S6 | Seller sets `asking_price` > cap (direct API) | error |
| S7 | Donation listing with non-null `asking_price` | error |
| S8 | Seller starts conversation on own listing | error |
| S9 | Two calls to `start_conversation` by same buyer | same conversation id |
| S10 | Guest creates listing | error |
| S11 | Member uploads to another user's storage folder | error |
| S12 | Non-admin calls `admin_*` RPC | error |
| S13 | Cancelled donation appears on Honour Board | not present |
| S14 | Realtime subscription by non-participant | receives nothing |
| S15 | Visitor reads `draft`/`sold` listing by id | 0 rows |
| S16 | Blocked user sends message | error |
| S17 | Rate limit exceeded (e.g. 31 messages/min) | error `rate_limited` |
| S18 | Suspended member creates post | error |

---

## 6. Threats and mitigations

| Threat | Mitigation |
|---|---|
| Reading others' private chats | RLS participant policy; no `SELECT` on conversations for non-participants; UUID ids; 404 not 403 in UI |
| Price-cap bypass via direct API | DB trigger is authoritative |
| Charging for donations | No price column allowed (CHECK); report reason `charging_for_donation`; rules shown to both parties |
| Fake donations to climb Honour Board | Confirmation model (⚠️ OQ-29) — two-party confirmation strongly recommended; admin revoke; rate limit on completions; same-pair repeat detection |
| Spam accounts / guest abuse | Cloudflare Turnstile on sign-up, guest creation and first message; per-user rate limits; email verification for members |
| Scams / payment fraud (no gateway) | Prominent safety rules (MOD-04); never pay in advance warnings (wording ⚠️ OQ-35); report + block; moderation queue |
| Phone number harvesting | Phone never in public views; optional in-chat warning when a number is typed (⚠️ OQ-37) |
| XSS via posts/messages | Render as text or sanitised markdown subset (no raw HTML); React escaping; strict CSP |
| Clickjacking | `frame-ancestors 'none'` |
| Malicious uploads | MIME + size limits in bucket and client; re-encode images client-side; no SVG uploads; EXIF stripped |
| Secret leakage | Only `VITE_` public vars in client; secret scanning in repo; `.env*` gitignored |
| Privilege escalation via `SECURITY DEFINER` | `set search_path = ''`, explicit `auth.uid()` checks, revoke `EXECUTE` from `anon` where not needed |
| Account takeover | Supabase Auth password rules (min 8, leaked-password check if available), email confirmation, secure reset flow |
| Enumeration of users / emails | Generic auth error messages; no public user search beyond display names |
| Personal data exposure (DPDP Act 2023) | Data minimisation, privacy policy, deletion path (⚠️ OQ-35) |

---

## 7. Validation rules (client **and** server)
| Field | Rule |
|---|---|
| Display name | 3–30 chars, letters/digits/space/`_.-`, unique (case-insensitive), not reserved |
| Book title / author | 2–200 chars, trimmed |
| Publication year | 1950 – current year |
| Original price | integer ₹1 – ₹50,000 (upper bound proposed ⚠️ OQ-51) |
| Asking price | integer ≥ ₹1 and ≤ calculated cap |
| Description | ≤ 2,000 chars |
| Images | 1–6 (⚠️ OQ-20), JPEG/PNG/WebP, ≤ 5 MB before compression |
| Post title / body | 5–150 / 1–10,000 (⚠️ OQ-17) |
| Comment | 1–5,000 |
| Message | 1–2,000 |
| AMA question | 10–500 |
| Report details | ≤ 1,000 |
| Courier charge | integer ₹0 – ₹5,000 (proposed) |

Proposed rate limits (tunable in `app_settings`): sign-ups 5/hour/IP (Supabase Auth); guest sessions via Turnstile; listings 10/day; posts 10/hour; comments 60/hour; votes 300/hour; messages 30/min; new conversations 20/day; AMA 5/day; reports 20/day.

---

## 8. Security review checklist (Milestone C)
- [ ] Supabase Security Advisor & Performance Advisor: zero errors.
- [ ] Every table: RLS enabled, policies reviewed, no `using (true)` on private data.
- [ ] pgTAP suite S1–S18 green in CI.
- [ ] Built JS bundle grepped for `service_role`, `sb_secret_`, passwords: none.
- [ ] CSP and security headers verified in production response.
- [ ] Auth: email confirmation on, redirect URL allow-list exact, custom SMTP configured, Turnstile on.
- [ ] Storage bucket MIME/size limits verified by attempted bad upload.
- [ ] Manual test: two browsers, third user cannot see their chat.
- [ ] Rules/terms/privacy pages published and linked at signup and first contact.
- [ ] Backups: scheduled `pg_dump` tested by restore.
- [ ] Admin accounts: strong passwords, MFA enabled (Supabase Auth TOTP).
