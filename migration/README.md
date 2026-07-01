# 2.0 database migration

`migrate_to_2_0.py` copies the production MongoDB into a fresh database while
backfilling the schema changes introduced in 2.0.

The app stores each character sheet as an **opaque** sub-document, so the 2024
sheet redesign needs no data migration (removed fields become orphan data, added
fields fall back to their defaults). The only structural changes are on the
`characters` collection:

- `npc` — boolean, defaulted to `false` where missing
- `primary` — boolean, new in 2.0, defaulted to `false` on every existing doc

Users (with their sessions/roles), monsters and encounters are carried over
verbatim.

## Setup

```sh
cd migration
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

## Usage

One-shot copy from prod to the new database:

```sh
export SOURCE_DB_URI="mongodb://user:pass@prod-host:27017/dnd"
export TARGET_DB_URI="mongodb://127.0.0.1:27017/dnd"
python migrate_to_2_0.py run --drop
```

`--drop` empties each target collection before loading (leave it off to append).

Or run it in stages, keeping an on-disk backup between steps:

```sh
python migrate_to_2_0.py download --uri "$SOURCE_DB_URI" --out prod.json
python migrate_to_2_0.py migrate  --in prod.json --out prod-2.0.json
python migrate_to_2_0.py upload   --uri "$TARGET_DB_URI" --in prod-2.0.json --drop
```

The database name is taken from the URI path (`.../dnd`) unless overridden with
`--db` / `--source-db` / `--target-db`. JSON dumps use MongoDB extended JSON, so
ObjectIds and dates round-trip losslessly.
