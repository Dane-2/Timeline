# A Little Piece of Me — Architecture & Roadmap

Deadline: **November 9, 2026**. Planning date: October 26, 2026 (14 days).

---

## 1. Shape of the system

```
 iPhone (Safari / Home Screen app)
        │  HTTPS, anon key + her session JWT
        ▼
 Vercel — static React build (no content inside it, ever)
        │
        ▼
 Supabase
   ├─ Auth ............ invite-only, email one-time code, sign-ups disabled
   ├─ Postgres ........ all content + RLS policies (the actual lock)
   │    └─ now() ...... the only clock that decides "is it unlocked?"
   └─ Storage ......... private bucket; signed URLs only for unlocked media
```

**The lock is in the database, not in the app.** The visitor's SELECT policy on
`content_items` is `status = 'published' AND (unlock_at IS NULL OR unlock_at <= now())`.
If a row doesn't pass, Postgres never sends it. That covers every path:

| Attack | Why it fails |
| --- | --- |
| Change the phone's date | `now()` is the database clock. The browser clock is used only to draw countdowns. |
| Inspect network requests | Locked rows are never in any response. Previews come from `locked_previews()`, which returns only occasion, teaser, theme, and time. |
| Read the JS bundle | The bundle contains no content. Everything is fetched at runtime. |
| Guess a media URL | The bucket is private. Signing a URL runs the storage RLS policy `can_read_media()`, which requires the file to be attached to an unlocked item. Paths are random UUIDs, but that's a bonus, not the defense. |
| Visit `/admin` | The route guard is cosmetic. Every write policy requires `is_admin()`. |
| Sign up a new account | Sign-ups are disabled, and new users get `role = null`, which grants nothing. |

**Why no Edge Functions for unlocking?** A Postgres policy evaluated with `now()`
is already server-side, can't be skipped, and has no moving parts. Nothing has
to run on a schedule, and nothing needs you online. Edge Functions stay
available if we need one later, e.g. for image processing.

## 2. Accounts & sign-in

- **Admin (you):** a Supabase user with `profiles.role = 'admin'`.
- **Visitor (her):** invited from the Supabase dashboard. You then set `role = 'visitor'`.
- **Sign-in:** a 6-digit email code (`signInWithOtp`, `shouldCreateUser: false`).
  A code works inside the iPhone Home Screen app, where a magic link would open
  Safari instead. Sessions refresh themselves, so she signs in about once.
- **Home Screen:** she should "Add to Home Screen". Home Screen web apps keep their
  login, while Safari tabs can lose site storage after weeks without a visit.

## 3. Data model (shared content model)

One `content_items` table holds every content type. Scheduling, drafts, ordering,
media and visibility work the same everywhere, and adding a new kind of thing
needs no migration.

| Table | Purpose |
| --- | --- |
| `profiles` | role (`admin` / `visitor` / null), display name |
| `content_items` | `kind` (letter, open_when, timeline, sticky_note, memory, photo, video, audio, inside_joke, favorite, quote, cat_message, easter_egg), `status`, title, `body` jsonb, caption, hidden_message, event_date, occasion, locked_teaser, `unlock_at` (UTC) + `unlock_timezone`, `visible_while_locked`, `show_countdown`, theme, `placement` (easter-egg slot), `collection_id`, `related_content_id`, `is_featured`, `sort_order` |
| `collections` | photo albums, favorite categories (foods, music, cats, movies, anything), joke categories |
| `media_assets` | file in the private bucket + type, size, alt text |
| `content_media` | links media to content with a role (primary, gallery, thumbnail, alternate, attachment, transcript) |
| `site_settings` | her name, homepage text, signature. Readable by members, so no secrets go here. |
| `visitor_notes` | her own notes, separate from yours |
| `content_opens` | "first opened" receipts that power the "new!" badges |

Migration: `supabase/migrations/20261026000000_foundation.sql`
Tests: `tests/db/access.test.mjs`, run with `npm run test:db`. No Docker and no
account needed. They load the real migration into PGlite (Postgres compiled to
WebAssembly, running inside Node), behind a small stand-in for Supabase's
`auth` and `storage` schemas (`tests/db/supabase-shim.sql`). Then they act as
her, as a signed-in stranger, as an anonymous visitor, and as the admin. This
includes a test that waits for an unlock time to pass on the database clock.

What PGlite can't cover is the hosted Storage service itself: that it actually
refuses to sign URLs for locked media. Once the real project exists, a small
smoke test hits the live API with a test visitor account to check that. It's
planned for Phase 2.

### How each feature maps onto it

- **Scheduled letters:** `kind='letter'`, `unlock_at` set, theme = stationery.
- **Open when…:** `kind='open_when'`, usually no `unlock_at`.
- **Favorites:** `kind='favorite'` + `collection_id` → a `favorite_category` collection
  (Foods, Music, Cats, … whatever you create). Spotify links go in `body.url`.
- **Inside jokes:** `kind='inside_joke'`, optional `related_content_id` → a timeline entry.
- **Easter eggs:** `kind='easter_egg'` + `placement` (e.g. `dashboard-star`). The page
  shows a trigger only if the server returns an egg for that slot.
- **Cat lines:** `kind='cat_message'`, title = what the cat says.
- **Birthday:** a draft letter with no date. Publish it once you set the date.

## 4. Frontend structure

```
src/
  admin/               admin screens (route-gated; RLS does the real gating)
  components/
    layout/            AppShell, ScrapbookTabs
    scrapbook/         Polaroid, StickyNote, WashiTape, Pushpin, SealedEnvelope, Doodles
  features/
    auth/              AuthProvider, SignInCard, RouteGuards
    content/           api.ts (all Supabase reads), SiteSettingsContext
    dashboard/         FeaturedMemory, UpcomingSurprises, NoteWallPreview, TimelinePreview, SurpriseMe
    cat/               CatCompanion
    (phase 2+)         letters/, timeline/, notes/, gallery/, favorites/, media/
  hooks/               useAsync, useSignedUrl, useServerNow, useCalmMode
  lib/                 supabase.ts, serverClock.ts, dates.ts
  pages/               WelcomePage, DashboardPage, …
  styles/index.css     design tokens + paper materials
  types/content.ts
```

Routes: `/` cover → `/home` dashboard · `/timeline` · `/letters` · `/notes` ·
`/photos` · `/favorites` · `/admin/*`

### Design system

- **Palette:** blush `#F6B8CE`, petal `#FFDCE8`, cream `#FFF5E9`, lavender `#B59AD8`,
  mauve `#8C6178`, ink `#3A3034`. Supporting colors: kraft, butter, sage, sky.
  Seasonal accents: pine, cranberry, pumpkin, maple.
- **Type:** Fraunces (display), Caveat (handwriting), DM Sans (body). All three
  are self-hosted, so no Google Fonts requests and no third-party tracking.
- **Materials:** dotted journal background, paper grain, torn edges (CSS masks),
  washi tape, pushpins, polaroids, sticky notes, wax-sealed envelopes.
- **Motion:** Motion for springs and reveals, CSS for ambient loops. The OS
  `prefers-reduced-motion` setting and the in-site "Less motion" toggle both work.

## 5. Roadmap (14 days)

You also need time to **write the letters and gather photos**. That's the part
only you can do. Start writing now, in parallel with the build.

| Dates | Phase | Scope |
| --- | --- | --- |
| Oct 26–27 | **1 · Foundation** | App, design system, cover + dashboard, invite-only auth, schema + RLS + tests, Vercel deploy ← *code done* |
| Oct 28–31 | **2 · Essentials** | Admin editor (all kinds, drafts, schedule with timezone, uploads with progress and client-side resize), envelope-opening letter view, Open When, timeline page, sticky note wall, photo gallery |
| Nov 1–3 | **3 · Personal** | Favorites + categories, inside jokes, music corner (Spotify embeds), video/audio player, her own notes, improved Surprise Me |
| Nov 4–5 | **4 · Polish** (cuttable) | Seasonal themes, easter eggs, walking cat, confetti, Home Screen icon |
| Nov 5–7 | **Content** | You fill everything in. Preview each locked letter in the admin. |
| Nov 7–8 | **Hand-off** | Full test on her iPhone, final security test run, invite her, operations checklist (below) |
| Nov 9 | Ship | |

### MVP (must ship) vs. later

**MVP:** secure scheduled letters with the envelope view, Open When, admin editor
with uploads, timeline, sticky note wall, gallery, dashboard, sign-in.

**Nice to have** (cut in this order if time runs short): walking cat behaviors,
easter-egg configurator UI, seasonal effects, polaroid flip, drag-to-move notes,
audio transcripts.

## 6. Running it while you're unreachable

These are the real risks. None of them are code bugs.

1. **Supabase free projects pause after about a week with no activity.** If she
   doesn't visit for a week, the site goes down and only you can restore it.
   → Use **Supabase Pro** while you're away. It also allows bigger video uploads
   and adds daily backups.
2. **Supabase's built-in email only sends to your project's team members.**
   Her sign-in codes won't arrive without your own email sender.
   → Set up **custom SMTP** (e.g. Resend's free tier). Edit the "Magic Link"
   email template so it shows `{{ .Token }}`.
3. **Billing:** the cards on Supabase, Vercel, and the domain must stay valid.
   Set anything with a renewal date to auto-renew.
4. **Break-glass contact (optional):** a trusted person with written instructions
   for "she's locked out" (send a new code / restart the project). Not an admin.
5. **Keep media small:** 720p H.264 MP4 for video. Photos get resized to WebP on upload.

## 7. Setup checklist

1. Create a Supabase project (Pro recommended; see §6).
2. `npx supabase link --project-ref <ref>` → `npx supabase db push` (no Docker needed).
   Add `--include-seed` only if you want the placeholder content loaded.
3. **Auth → Providers → Email:** enable it and **turn off "Allow new users to sign up"**.
   Set the OTP length to 6.
4. **Auth → SMTP:** add your custom SMTP sender.
5. **Auth → Email Templates → Magic Link:** include `Your code: {{ .Token }}`.
6. **Auth → Users → Invite user:** invite yourself, then run
   `update profiles set role='admin' where id='<your uuid>';`
7. Later, invite her: `update profiles set role='visitor' where id='<her uuid>';`
8. `cp .env.example .env.local`, then fill in the URL and the anon/publishable key.
9. On Vercel: import the repo and set the same two env vars. `vercel.json`
   handles SPA routing and the noindex/security headers.
