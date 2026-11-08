-- =============================================================================
-- Public viewing: no login needed to look around.
--
-- Logged-out visitors (`anon`) now see exactly what a visitor account sees:
-- published items whose unlock_at has passed (by the database clock), their
-- media, the locked-letter teasers, published collections and site settings.
-- Unchanged: drafts and locked items stay hidden, every write is still
-- admin-only, and visitor_notes / content_opens still need an account.
--
-- A signed-in account with no role still sees nothing (is_member() is only
-- widened for callers with no auth.uid()).
--
-- To go back to login-only, run:
--   create or replace function public.is_member() ... (the version in
--     20261026000000_foundation.sql)
--   alter policy ... to authenticated;   -- for each policy below
--   revoke execute on function public.is_member(), public.is_admin(),
--     public.app_user_role(), public.can_read_media(text, text),
--     public.locked_previews() from anon;
-- =============================================================================

create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is null
      or coalesce(public.app_user_role() in ('admin', 'visitor'), false);
$$;

alter policy "collections: members read published" on public.collections to anon, authenticated;
alter policy "content: members read open items" on public.content_items to anon, authenticated;
alter policy "media: members read media of open items" on public.media_assets to anon, authenticated;
alter policy "content_media: members read links of open items" on public.content_media to anon, authenticated;
alter policy "private-media: read when content is open" on storage.objects to anon, authenticated;
alter policy "settings: members read" on public.site_settings to anon, authenticated;

grant execute on function public.is_member() to anon;
grant execute on function public.is_admin() to anon;
grant execute on function public.app_user_role() to anon;
grant execute on function public.can_read_media(text, text) to anon;
grant execute on function public.locked_previews() to anon;
