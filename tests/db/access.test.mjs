// Time-lock and role tests, run against the real migration in an in-process
// Postgres (PGlite). No Docker, no network, no Supabase account needed.
//
//   npm run test:db

import { test, before } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'

const root = new URL('../../', import.meta.url).pathname
const ADMIN = '00000000-0000-0000-0000-00000000000a'
const HER = '00000000-0000-0000-0000-00000000000b'
const STRANGER = '00000000-0000-0000-0000-00000000000c'

const ID = {
  open: '11111111-0000-0000-0000-000000000001',
  future: '11111111-0000-0000-0000-000000000002',
  draft: '11111111-0000-0000-0000-000000000003',
  hiddenEgg: '11111111-0000-0000-0000-000000000004',
  noCountdown: '11111111-0000-0000-0000-000000000005',
  exactlyNow: '11111111-0000-0000-0000-000000000006',
}

/** @type {PGlite} */
let db

before(async () => {
  db = await PGlite.create()
  await db.exec(readFileSync(join(root, 'tests/db/supabase-shim.sql'), 'utf8'))
  const migrations = readdirSync(join(root, 'supabase/migrations')).filter((f) => f.endsWith('.sql')).sort()
  for (const file of migrations) {
    await db.exec(readFileSync(join(root, 'supabase/migrations', file), 'utf8'))
  }

  // Fixtures, as superuser.
  await db.exec(`
    insert into auth.users (id, email) values
      ('${ADMIN}', 'admin@test.local'), ('${HER}', 'her@test.local'), ('${STRANGER}', 'stranger@test.local');
    update public.profiles set role = 'admin'   where id = '${ADMIN}';
    update public.profiles set role = 'visitor' where id = '${HER}';

    insert into public.content_items (id, kind, status, title, body, occasion, unlock_at, visible_while_locked, show_countdown) values
      ('${ID.open}',        'letter',     'published', 'OPEN LETTER',   '{"text":"open"}',   'Departure', now() - interval '1 day',   true,  true),
      ('${ID.future}',      'letter',     'published', 'FUTURE LETTER', '{"text":"secret"}', 'Christmas', now() + interval '60 days', true,  true),
      ('${ID.draft}',       'letter',     'draft',     'DRAFT LETTER',  '{"text":"draft"}',  null,        null,                       true,  true),
      ('${ID.hiddenEgg}',   'easter_egg', 'published', 'HIDDEN EGG',    '{}',                'Secret',    now() + interval '60 days', false, true),
      ('${ID.noCountdown}', 'letter',     'published', 'NO COUNTDOWN',  '{}',                'Birthday',  now() + interval '90 days', true,  false),
      ('${ID.exactlyNow}',  'letter',     'published', 'EXACTLY NOW',   '{}',                null,        now() - interval '1 millisecond', true, true);

    insert into public.media_assets (id, storage_path, media_type) values
      ('22222222-0000-0000-0000-000000000001', 'open/photo.jpg',   'image'),
      ('22222222-0000-0000-0000-000000000002', 'future/video.mp4', 'video');
    insert into public.content_media (content_id, media_id, role) values
      ('${ID.open}',   '22222222-0000-0000-0000-000000000001', 'primary'),
      ('${ID.future}', '22222222-0000-0000-0000-000000000002', 'primary');
    insert into storage.objects (bucket_id, name) values
      ('private-media', 'open/photo.jpg'), ('private-media', 'future/video.mp4'), ('private-media', 'orphan/unattached.jpg');
  `)
})

/**
 * Run `fn` as a given user (like a request carrying their JWT), inside a
 * transaction that is always rolled back.
 */
async function as(userId, fn) {
  return db.transaction(async (tx) => {
    if (userId) {
      await tx.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: userId, role: 'authenticated' })])
      await tx.exec('set local role authenticated')
    } else {
      await tx.exec('set local role anon')
    }
    const result = await fn({
      rows: async (sql, params) => (await tx.query(sql, params)).rows,
      fails: async (sql, code = '42501') => {
        await tx.exec('savepoint t')
        try {
          await tx.query(sql)
        } catch (e) {
          await tx.exec('rollback to savepoint t')
          assert.equal(e.code, code, `expected SQLSTATE ${code}, got ${e.code}: ${e.message}`)
          return
        }
        assert.fail(`expected failure: ${sql}`)
      },
    })
    await tx.rollback()
    return result
  })
}

const titles = (rows) => rows.map((r) => r.title).sort()

// ---------------------------------------------------------------------------
// Her (visitor)
// ---------------------------------------------------------------------------
test('visitor sees only published items whose unlock time has passed', () =>
  as(HER, async ({ rows }) => {
    assert.deepEqual(titles(await rows('select title from content_items')), ['EXACTLY NOW', 'OPEN LETTER'])
  }))

test('visitor cannot fetch a future letter by id or by searching its body', () =>
  as(HER, async ({ rows }) => {
    assert.equal((await rows('select 1 from content_items where id = $1', [ID.future])).length, 0)
    assert.equal((await rows(`select 1 from content_items where body::text like '%secret%'`)).length, 0)
  }))

test('visitor cannot see drafts', () =>
  as(HER, async ({ rows }) => {
    assert.equal((await rows(`select 1 from content_items where status = 'draft'`)).length, 0)
  }))

test('locked_previews exposes only safe columns of teasable locked items', () =>
  as(HER, async ({ rows }) => {
    const previews = await rows('select * from locked_previews()')
    assert.deepEqual(previews.map((p) => p.occasion).sort(), ['Birthday', 'Christmas'])
    assert.deepEqual(Object.keys(previews[0]).sort(), [
      'event_date', 'id', 'kind', 'locked_teaser', 'occasion', 'sort_order', 'theme', 'unlock_at',
    ])
    assert.equal(previews.find((p) => p.occasion === 'Birthday').unlock_at, null, 'show_countdown=false hides the date')
    assert.ok(!previews.some((p) => p.id === ID.hiddenEgg), 'secret items are not even previewed')
  }))

test('visitor only sees media rows and storage objects for open content', () =>
  as(HER, async ({ rows }) => {
    assert.deepEqual((await rows('select storage_path from media_assets')).map((r) => r.storage_path), ['open/photo.jpg'])
    assert.deepEqual(
      (await rows(`select name from storage.objects where bucket_id = 'private-media'`)).map((r) => r.name),
      ['open/photo.jpg'],
    )
    assert.deepEqual(
      (await rows('select media_id from content_media')).map((r) => r.media_id),
      ['22222222-0000-0000-0000-000000000001'],
    )
  }))

test('signing check refuses locked and unattached media', () =>
  as(HER, async ({ rows }) => {
    const can = async (path) => (await rows(`select can_read_media('private-media', $1) as ok`, [path]))[0].ok
    assert.equal(await can('open/photo.jpg'), true)
    assert.equal(await can('future/video.mp4'), false)
    assert.equal(await can('orphan/unattached.jpg'), false)
  }))

test('visitor cannot create, edit, reschedule or delete content', () =>
  as(HER, async ({ rows, fails }) => {
    await fails(`insert into content_items (kind, title) values ('letter', 'hax')`)
    assert.equal((await rows(`update content_items set unlock_at = now() - interval '1 year' where id = $1 returning 1`, [ID.future])).length, 0)
    assert.equal((await rows(`update content_items set title = 'x' where id = $1 returning 1`, [ID.open])).length, 0)
    assert.equal((await rows('delete from content_items where id = $1 returning 1', [ID.open])).length, 0)
    await fails(`insert into storage.objects (bucket_id, name) values ('private-media', 'evil.jpg')`)
  }))

test('visitor cannot promote herself to admin', () =>
  as(HER, async ({ rows }) => {
    assert.equal((await rows(`update profiles set role = 'admin' where id = $1 returning 1`, [HER])).length, 0)
  }))

test('visitor can leave her own notes but not forge someone else\'s', () =>
  as(HER, async ({ rows, fails }) => {
    await rows(`insert into visitor_notes (body) values ('hi from me')`)
    assert.equal((await rows('select 1 from visitor_notes')).length, 1)
    await fails(`insert into visitor_notes (body, author_id) values ('forged', '${ADMIN}')`)
  }))

test('opened-receipts only work for content she can see (no existence oracle)', () =>
  as(HER, async ({ rows, fails }) => {
    await rows('insert into content_opens (content_id) values ($1)', [ID.open])
    await fails(`insert into content_opens (content_id) values ('${ID.future}')`)
  }))

// ---------------------------------------------------------------------------
// Strangers and anonymous visitors
// ---------------------------------------------------------------------------
test('a signed-in user with no role sees nothing', () =>
  as(STRANGER, async ({ rows }) => {
    assert.equal((await rows('select 1 from content_items')).length, 0)
    assert.equal((await rows('select 1 from locked_previews()')).length, 0)
    assert.equal((await rows('select 1 from site_settings')).length, 0)
    assert.equal((await rows(`select 1 from storage.objects`)).length, 0)
  }))

test('anonymous callers see nothing and cannot call the preview function', () =>
  as(null, async ({ rows, fails }) => {
    assert.equal((await rows('select 1 from content_items')).length, 0)
    assert.equal((await rows('select 1 from storage.objects')).length, 0)
    assert.equal((await rows('select 1 from site_settings')).length, 0)
    await fails('select * from locked_previews()')
  }))

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
test('admin sees and manages everything, including drafts and locked items', () =>
  as(ADMIN, async ({ rows }) => {
    assert.equal((await rows('select 1 from content_items')).length, 6)
    await rows(`insert into content_items (kind, title) values ('letter', 'new draft')`)
    assert.equal((await rows(`select can_read_media('private-media', 'future/video.mp4') as ok`))[0].ok, true)
  }))

test('admin can run the whole editor workflow', () =>
  as(ADMIN, async ({ rows }) => {
    const [item] = await rows(`insert into content_items (kind, title, theme) values ('memory', 'from admin', 'seal') returning id`)
    await rows(`insert into storage.objects (bucket_id, name) values ('private-media', '2026/new.webp')`)
    const [asset] = await rows(`insert into media_assets (storage_path, media_type, byte_size) values ('2026/new.webp', 'image', 1234) returning id`)
    await rows('insert into content_media (content_id, media_id, role) values ($1, $2, $3)', [item.id, asset.id, 'primary'])
    await rows(`update content_media set role = 'gallery' where content_id = $1`, [item.id])
    await rows(`insert into collections (kind, title, status) values ('favorite_category', 'Foods', 'published')`)
    await rows(`update site_settings set settings = settings || '{"herName":"Test"}'::jsonb`)
    assert.equal((await rows(`select settings->>'herName' as n from site_settings`))[0].n, 'Test')
    await rows('delete from media_assets where id = $1', [asset.id])
    assert.equal((await rows('select 1 from content_media where content_id = $1', [item.id])).length, 0, 'deleting media detaches it')
  }))

test('visitor cannot change settings, collections or media links', () =>
  as(HER, async ({ rows, fails }) => {
    assert.equal((await rows(`update site_settings set settings = '{}'::jsonb returning 1`)).length, 0)
    await fails(`insert into collections (kind, title) values ('album', 'x')`)
    await fails(`insert into media_assets (storage_path, media_type) values ('x.jpg', 'image')`)
    await fails(`insert into content_media (content_id, media_id) values ('${ID.open}', '22222222-0000-0000-0000-000000000002')`)
  }))

// ---------------------------------------------------------------------------
// The clock
// ---------------------------------------------------------------------------
test('a letter unlocks on its own when the database clock passes unlock_at', async () => {
  const id = '11111111-0000-0000-0000-0000000000ff'
  await db.query(
    `insert into content_items (id, kind, status, title, unlock_at)
     values ($1, 'letter', 'published', 'SOON', now() + interval '1.5 seconds')`,
    [id],
  )
  const visible = () => as(HER, async ({ rows }) => (await rows('select 1 from content_items where id = $1', [id])).length === 1)

  assert.equal(await visible(), false, 'locked before its time')
  await new Promise((r) => setTimeout(r, 2000))
  assert.equal(await visible(), true, 'open after its time — no admin action needed')
  await db.query('delete from content_items where id = $1', [id])
})

test('the device clock plays no part: access is decided by now() in the database', async () => {
  // Every policy and function that gates content must reference now(), and
  // nothing the client sends (headers/claims) is compared to unlock_at.
  const { rows } = await db.query(`
    select polname, pg_get_expr(polqual, polrelid) as qual
      from pg_policy where polrelid = 'public.content_items'::regclass and polcmd = 'r'`)
  assert.equal(rows.length, 1)
  assert.match(rows[0].qual, /unlock_at <= now\(\)/)
  assert.doesNotMatch(rows[0].qual, /current_setting|request\./)
})
