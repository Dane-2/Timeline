# A Little Piece of Me

A private digital scrapbook and time capsule. React + Vite + Tailwind + Motion on
the front, Supabase (Postgres RLS, Auth, private Storage) behind it.

- Architecture, security model, roadmap, setup: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Security tests: `npm run test:db` (in-process Postgres, no Docker) — [tests/db](tests/db)

```sh
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key
npm run dev
```
# Timeline
