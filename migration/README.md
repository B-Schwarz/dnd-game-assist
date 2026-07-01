# 2.0 database migration

Copies the whole database from the old (1.x) deployment into a fresh 2.0 one,
using a throwaway container that reaches MongoDB **directly** over the compose
network. Data is handed over on a shared `./migration/dump` volume.

Two collections' worth of nuance:

- The character sheet is stored as an **opaque** sub-document, so the 2024 sheet
  redesign needs no data migration (removed fields become orphan data, added
  fields fall back to their defaults). The only structural change is on the
  `characters` collection: `npc` and the new `primary` flag are backfilled to
  booleans at restore time.
- Users (with their bcrypt password hashes and roles), monsters and encounters
  are carried over verbatim. Ephemeral express-session tokens are skipped.

The migration services live in the root `docker-compose.yml` behind a
`migration` profile, so a normal `docker compose up` never starts them.

## Flow

**1. On the OLD (1.x) deployment** — dump the running database:

```sh
docker compose --profile migration run --rm migration-dump
```

This writes `./migration/dump/dump.json` (MongoDB extended JSON, so ObjectIds
and dates round-trip losslessly).

**2. Move the dump** to the 2.0 host — copy `./migration/dump/dump.json` over
(same host? nothing to do). The file is the entire hand-off.

**3. On the NEW (2.0) deployment** — bring the stack up so the fresh `db` exists,
then restore into it:

```sh
docker compose up -d db
docker compose --profile migration run --rm migration-restore
```

`migration-restore` applies the 2.0 transforms and loads the data. It runs with
`--drop`, so each target collection is emptied first — this replaces the seeded
default admin with the real migrated users and makes the step idempotent
(re-running produces the same result).

## Notes / one-offs

- Both services read the connection string from `DB_URI`
  (`mongodb://db:27017/dnd`), the same env var the app uses.
- Run the transform on an existing dump without touching a DB:
  `python migrate_to_2_0.py migrate --in dump.json --out dump-2.0.json`.
- Locally (no Docker): `pip install -r requirements.txt`, then
  `DB_URI=mongodb://127.0.0.1:27017/dnd python migrate_to_2_0.py dump --out dump.json`.
- `migration/dump/` is git-ignored — dumps contain production data.
