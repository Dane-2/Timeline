-- Local development seed. PLACEHOLDERS ONLY — no real personal details.
-- Optional. Load into the linked project with `npx supabase db push --include-seed`.

insert into public.content_items (kind, status, title, body, hidden_message, sort_order) values
  ('sticky_note', 'published', 'Important reminder: you''re pretty cool.', '{"color":"pink"}', null, 1),
  ('sticky_note', 'published', 'Don''t forget to give the cats attention.', '{"color":"butter"}', '[placeholder: cat names go here]', 2),
  ('sticky_note', 'published', 'There''s something hidden around here...', '{"color":"lavender"}', 'Keep looking. (placeholder)', 3),
  ('sticky_note', 'published', 'Just checking in from the future.', '{"color":"sky"}', null, 4);

insert into public.content_items (kind, status, title, caption, event_date, is_featured) values
  ('timeline', 'published', '[Placeholder] A first memory', '[a caption in your words]', '2024-06-01', true),
  ('timeline', 'published', '[Placeholder] Another memory', '[a caption in your words]', '2025-03-15', false);

insert into public.content_items (kind, status, title, occasion, locked_teaser, theme, unlock_at, body) values
  ('letter', 'published', '[Departure letter]',    'The day I leave', 'Not quite time yet...', 'classic',      '2026-11-09 05:00:00+00', '{"text":"[placeholder letter]"}'),
  ('letter', 'published', '[Thanksgiving letter]', 'Thanksgiving',    'Not quite time yet...', 'thanksgiving', '2026-11-26 13:00:00+00', '{"text":"[placeholder letter]"}'),
  ('letter', 'published', '[Christmas surprise]',  'Christmas',       'Not quite time yet...', 'christmas',    '2026-12-25 13:00:00+00', '{"text":"[placeholder letter]"}'),
  ('letter', 'published', '[New Year letter]',     'New Year''s',     'Not quite time yet...', 'newyear',      '2027-01-01 05:00:00+00', '{"text":"[placeholder letter]"}'),
  ('letter', 'published', '[Valentine''s letter]', 'Valentine''s Day','Not quite time yet...', 'valentine',    '2027-02-14 13:00:00+00', '{"text":"[placeholder letter]"}'),
  -- Birthday stays a draft with no date until the real date is provided.
  ('letter', 'draft',     '[Birthday surprise]',   'Your birthday',   'Not quite time yet...', 'birthday',     null,                     '{"text":"[placeholder letter]"}');

insert into public.content_items (kind, status, title) values
  ('cat_message', 'published', '[placeholder cat line]');
