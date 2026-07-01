# 2.0 character migration

`migrate_to_2_0.py` copies characters from an old deployment into a 2.0 one
**entirely through the HTTP API** — it never talks to MongoDB directly, so it
works against a remote/hosted instance with only an admin login.

The app stores each character sheet as an **opaque** sub-document, so the 2024
sheet redesign needs no data migration (removed fields become orphan data, added
fields fall back to their defaults). The only structural changes are on the
character document — `npc` and the new `primary` flag — both of which the
`/api/char/import` endpoint already coerces to booleans.

Endpoints used (an **admin** account is required on both ends):
`POST /api/auth/login`, `GET /api/char/export`, `POST /api/char/import`,
`GET /api/user`, `PUT /api/char/reassign`.

## Setup

```sh
cd migration
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

## Usage

One-shot copy from the old deployment to the new one, restoring owners:

```sh
export SOURCE_API_URL="https://old.example.com" SOURCE_ADMIN_USER=admin SOURCE_ADMIN_PASS=...
export TARGET_API_URL="http://localhost:5000"   TARGET_ADMIN_USER=admin TARGET_ADMIN_PASS=...
python migrate_to_2_0.py run --reassign
```

Or in stages, keeping an on-disk backup between steps:

```sh
python migrate_to_2_0.py download --url "$SOURCE_API_URL" --user admin --pass "$SOURCE_ADMIN_PASS" --out prod.json
python migrate_to_2_0.py migrate  --in prod.json --out prod-2.0.json
python migrate_to_2_0.py upload   --url "$TARGET_API_URL" --user admin --pass "$TARGET_ADMIN_PASS" --in prod-2.0.json --reassign
```

Any flag can be supplied via the matching env var (`SOURCE_API_URL`,
`SOURCE_ADMIN_USER`, `SOURCE_ADMIN_PASS`, and the `TARGET_*` equivalents).

## Ownership

`/api/char/import` recreates every character as an **unowned** document (by
design). With `--reassign` the script then restores ownership best-effort: it
matches each imported sheet back to its source owner and calls
`/api/char/reassign` when a **target user with the same name already exists**.
Users are *not* migrated by this script — create the accounts on the new
deployment first (registration/seed), then run with `--reassign`. Without the
flag, an admin can assign owners manually in the admin → characters view.
