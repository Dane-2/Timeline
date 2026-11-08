-- =============================================================================
-- A Little Piece of Me — foundation schema
--
-- Security model in one paragraph:
--   * Every table has RLS enabled. `anon` has no policies, so logged-out
--     visitors can read nothing.
--   * A user's role lives in public.profiles and is only ever set by an admin
--     (or by hand in SQL). New sign-ups get NO role, so even a misconfigured
--     sign-up setting would not grant access.
--   * Content rows are readable by members only when published AND
--     unlock_at <= now(). now() is the database clock — the browser's clock is
--     never consulted.
--   * Locked items are previewed through locked_previews(), which returns only
--     non-secret columns (occasion, teaser, theme, unlock time).
--   * Media lives in a private bucket. A storage object is readable only if it
--     is attached to a content item the caller can currently read. Signed URLs
--     are minted through the same check.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('admin', 'visitor');

create type public.content_kind as enum (
  'letter',        -- scheduled letters (holidays, departure, birthday)
  'open_when',     -- "Open when..." envelopes
  'timeline',      -- timeline entries
  'sticky_note',   -- the note wall
  'memory',        -- free-form written memory
  'photo',         -- gallery photo (media attached)
  'video',         -- video message
  'audio',         -- audio message
  'inside_joke',   -- inside jokes / personal references
  'favorite',      -- favorite things (category = collection)
  'quote',         -- quotes, lyrics references, sayings
  'cat_message',   -- speech bubbles for the cat companion
  'easter_egg'     -- hidden surprises, keyed by `placement`
);

create type public.content_status as enum ('draft', 'published');

create type public.collection_kind as enum ('album', 'favorite_category', 'joke_category');

-- ---------------------------------------------------------------------------
-- Shared trigger: updated_at
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles & roles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         public.app_role,             -- null = no access at all
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Every new auth user gets a profile with NO role. An admin grants access.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role helpers. SECURITY DEFINER so policies can call them without recursing
-- through profiles' own RLS.
create function public.app_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.app_user_role() = 'admin', false);
$$;

create function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.app_user_role() in ('admin', 'visitor'), false);
$$;

alter table public.profiles enable row level security;

create policy "profiles: read own or admin reads all"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- Only admins change roles/profiles. Visitors cannot promote themselves.
create policy "profiles: admin writes"
  on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Collections (photo albums, favorite categories, joke categories)
-- ---------------------------------------------------------------------------
create table public.collections (
  id          uuid primary key default gen_random_uuid(),
  kind        public.collection_kind not null,
  title       text not null,
  description text,
  theme       text not null default 'classic',
  emoji       text,
  status      public.content_status not null default 'draft',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger collections_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

alter table public.collections enable row level security;

create policy "collections: members read published"
  on public.collections for select to authenticated
  using (public.is_admin() or (public.is_member() and status = 'published'));

create policy "collections: admin writes"
  on public.collections for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Content items — one table for every content type so scheduling, drafts,
-- ordering and media work identically everywhere.
-- ---------------------------------------------------------------------------
create table public.content_items (
  id                  uuid primary key default gen_random_uuid(),
  kind                public.content_kind not null,
  status              public.content_status not null default 'draft',

  -- What she sees once it's open
  title               text not null default '',
  body                jsonb not null default '{}'::jsonb,  -- rich text + kind-specific fields
  caption             text,                                -- personal handwritten-style caption
  hidden_message      text,                                -- revealed by an extra tap
  event_date          date,                                -- the date the memory is "about"

  -- What she sees while it's locked (via locked_previews only)
  occasion            text,                                -- e.g. 'Christmas'
  locked_teaser       text,                                -- e.g. 'Not quite time yet...'
  visible_while_locked boolean not null default true,      -- false = a total secret until unlock
  show_countdown      boolean not null default true,

  -- Scheduling. Stored in UTC; unlock_timezone is only for the admin's display.
  unlock_at           timestamptz,                         -- null = open as soon as published
  unlock_timezone     text not null default 'America/New_York',

  -- Presentation / organization
  theme               text not null default 'classic',     -- stationery & decoration preset
  placement           text,                                -- easter-egg / cat-message slot key
  collection_id       uuid references public.collections (id) on delete set null,
  related_content_id  uuid references public.content_items (id) on delete set null,
  is_featured         boolean not null default false,
  sort_order          integer not null default 0,

  created_by          uuid references auth.users (id) on delete set null default auth.uid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index content_items_kind_idx on public.content_items (kind, status, sort_order);
create index content_items_unlock_idx on public.content_items (unlock_at);
create index content_items_collection_idx on public.content_items (collection_id);

create trigger content_items_updated_at
  before update on public.content_items
  for each row execute function public.set_updated_at();

alter table public.content_items enable row level security;

create policy "content: members read open items"
  on public.content_items for select to authenticated
  using (
    public.is_admin()
    or (
      public.is_member()
      and status = 'published'
      and (unlock_at is null or unlock_at <= now())
    )
  );

create policy "content: admin writes"
  on public.content_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Locked previews: only the safe, non-secret columns of items that are
-- published, still locked, and allowed to tease.
create function public.locked_previews()
returns table (
  id            uuid,
  kind          public.content_kind,
  occasion      text,
  locked_teaser text,
  theme         text,
  unlock_at     timestamptz,
  event_date    date,
  sort_order    integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id,
         c.kind,
         c.occasion,
         c.locked_teaser,
         c.theme,
         case when c.show_countdown then c.unlock_at end,
         c.event_date,
         c.sort_order
    from public.content_items c
   where public.is_member()
     and c.status = 'published'
     and c.visible_while_locked
     and c.unlock_at > now()
   order by c.unlock_at, c.sort_order;
$$;

-- The client uses this to correct countdowns for a wrong device clock.
-- (Display only — access decisions never depend on it.)
create function public.server_now()
returns timestamptz
language sql
stable
as $$ select now(); $$;

-- ---------------------------------------------------------------------------
-- Media
-- ---------------------------------------------------------------------------
create table public.media_assets (
  id               uuid primary key default gen_random_uuid(),
  bucket           text not null default 'private-media',
  storage_path     text not null unique,  -- random UUID-based name inside the bucket
  media_type       text not null check (media_type in ('image', 'video', 'audio')),
  mime_type        text,
  width            integer,
  height           integer,
  duration_seconds numeric,
  byte_size        bigint,
  alt_text         text,
  created_by       uuid references auth.users (id) on delete set null default auth.uid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger media_assets_updated_at
  before update on public.media_assets
  for each row execute function public.set_updated_at();

create table public.content_media (
  content_id uuid not null references public.content_items (id) on delete cascade,
  media_id   uuid not null references public.media_assets (id) on delete cascade,
  role       text not null default 'gallery'
             check (role in ('primary', 'gallery', 'thumbnail', 'alternate', 'attachment', 'transcript')),
  caption    text,
  sort_order integer not null default 0,
  primary key (content_id, media_id, role)
);

create index content_media_media_idx on public.content_media (media_id);

-- Can the current user read this storage object? True only if it is attached
-- to at least one content item that is open right now (or caller is admin).
create function public.can_read_media(object_bucket text, object_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin()
      or (
        public.is_member()
        and exists (
          select 1
            from public.media_assets m
            join public.content_media cm on cm.media_id = m.id
            join public.content_items c on c.id = cm.content_id
           where m.bucket = object_bucket
             and m.storage_path = object_path
             and c.status = 'published'
             and (c.unlock_at is null or c.unlock_at <= now())
        )
      );
$$;

alter table public.media_assets enable row level security;
alter table public.content_media enable row level security;

create policy "media: members read media of open items"
  on public.media_assets for select to authenticated
  using (public.can_read_media(bucket, storage_path));

create policy "media: admin writes"
  on public.media_assets for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- content_items' own RLS filters the subquery, so locked links stay hidden.
create policy "content_media: members read links of open items"
  on public.content_media for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.content_items c where c.id = content_id)
  );

create policy "content_media: admin writes"
  on public.content_media for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Private bucket. 50 MB matches the Supabase free-tier global cap; raise it
-- (and the project setting) on Pro for longer videos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'private-media', 'private-media', false, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif',
        'video/mp4', 'video/quicktime', 'video/webm',
        'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/wav', 'audio/webm']
)
on conflict (id) do nothing;

create policy "private-media: read when content is open"
  on storage.objects for select to authenticated
  using (bucket_id = 'private-media' and public.can_read_media(bucket_id, name));

create policy "private-media: admin inserts"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'private-media' and public.is_admin());

create policy "private-media: admin updates"
  on storage.objects for update to authenticated
  using (bucket_id = 'private-media' and public.is_admin())
  with check (bucket_id = 'private-media' and public.is_admin());

create policy "private-media: admin deletes"
  on storage.objects for delete to authenticated
  using (bucket_id = 'private-media' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Site settings (single row). Readable by members — never put secrets here.
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id         boolean primary key default true check (id),
  settings   jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (settings) values (
  jsonb_build_object(
    'herName', null,
    'siteTitle', 'A Little Piece of Me',
    'siteSubtitle', 'Some things I wanted you to have while I''m away.',
    'enterLabel', 'Come on in ♡',
    'signature', null,
    'departureDate', '2026-11-09'
  )
);

alter table public.site_settings enable row level security;

create policy "settings: members read"
  on public.site_settings for select to authenticated
  using (public.is_member());

create policy "settings: admin writes"
  on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Her own notes (kept separate from prewritten content)
-- ---------------------------------------------------------------------------
create table public.visitor_notes (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 4000),
  color      text not null default 'pink',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger visitor_notes_updated_at
  before update on public.visitor_notes
  for each row execute function public.set_updated_at();

alter table public.visitor_notes enable row level security;

create policy "visitor_notes: members read"
  on public.visitor_notes for select to authenticated
  using (public.is_member());

create policy "visitor_notes: members write own"
  on public.visitor_notes for insert to authenticated
  with check (public.is_member() and author_id = auth.uid());

create policy "visitor_notes: authors update own"
  on public.visitor_notes for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());

create policy "visitor_notes: authors or admin delete"
  on public.visitor_notes for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- "Opened" receipts — powers the "new!" badges.
-- ---------------------------------------------------------------------------
create table public.content_opens (
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  content_id      uuid not null references public.content_items (id) on delete cascade,
  first_opened_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

alter table public.content_opens enable row level security;

create policy "opens: read own"
  on public.content_opens for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Can only record opening something you can actually see right now.
create policy "opens: insert own for open content"
  on public.content_opens for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.content_items c where c.id = content_id)
  );

-- ---------------------------------------------------------------------------
-- Function privileges: nothing for anonymous callers.
-- ---------------------------------------------------------------------------
revoke execute on function public.locked_previews() from public, anon;
revoke execute on function public.can_read_media(text, text) from public, anon;
revoke execute on function public.app_user_role() from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_member() from public, anon;
grant execute on function public.locked_previews() to authenticated;
grant execute on function public.can_read_media(text, text) to authenticated;
grant execute on function public.app_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_member() to authenticated;
