#!/usr/bin/env python3
"""
Migrate D&D game-assist characters to the 2.0 schema — entirely through the HTTP
API (no direct database access).

The 2.0 backend stores each character sheet as an opaque sub-document, so the
2024 sheet redesign needs no data migration (removed fields become orphan data,
added fields fall back to their defaults). The only structural changes live on
the character document:

  * `npc`     — boolean, default False
  * `primary` — boolean, default False (new in 2.0)

Both are already coerced to booleans by the `/api/char/import` endpoint, so the
migration is really just: export from the old deployment, import into the new
one, and (optionally) restore ownership.

Endpoints used (an **admin** login is required on both ends):

  POST /api/auth/login      authenticate (session cookie)
  GET  /api/char/export     dump every character + its owner
  POST /api/char/import     recreate characters (as unowned documents)
  GET  /api/user            list users (to resolve owners by name)
  PUT  /api/char/reassign   move a character to a user

Typical use — copy prod → new deployment in one shot, restoring owners:

    export SOURCE_API_URL="https://old.example.com" SOURCE_ADMIN_USER=admin SOURCE_ADMIN_PASS=...
    export TARGET_API_URL="http://localhost:5000"   TARGET_ADMIN_USER=admin TARGET_ADMIN_PASS=...
    python migrate_to_2_0.py run --reassign

Or in stages, keeping an on-disk backup:

    python migrate_to_2_0.py download --url "$SOURCE_API_URL" --user admin --pass ... --out prod.json
    python migrate_to_2_0.py migrate  --in prod.json --out prod-2.0.json
    python migrate_to_2_0.py upload   --url "$TARGET_API_URL" --user admin --pass ... --in prod-2.0.json --reassign

Reassignment is best-effort: it matches each imported character back to its
source owner by sheet content and restores ownership when a target user with the
same name exists (users themselves are not migrated by this script).
"""

import argparse
import json
import os
import sys

import requests

MIGRATION_VERSION = "2.0"


class ApiClient:
    """A logged-in session against one deployment's HTTP API."""

    def __init__(self, base_url):
        self.base = base_url.rstrip("/")
        self.session = requests.Session()

    def login(self, username, password):
        r = self.session.post(f"{self.base}/api/auth/login",
                               json={"username": username, "password": password})
        if r.status_code != 200:
            sys.exit(f"error: login to {self.base} failed ({r.status_code})")
        return self

    def export_characters(self):
        r = self.session.get(f"{self.base}/api/char/export")
        if r.status_code != 200:
            sys.exit(f"error: export failed ({r.status_code}); is the account an admin?")
        return r.json()

    def import_characters(self, characters):
        r = self.session.post(f"{self.base}/api/char/import", json={"characters": characters})
        if r.status_code != 200:
            sys.exit(f"error: import failed ({r.status_code})")
        return r.json().get("created", 0)

    def list_users(self):
        r = self.session.get(f"{self.base}/api/user")
        if r.status_code != 200:
            sys.exit(f"error: user list failed ({r.status_code})")
        return r.json()

    def reassign(self, char_id, to_user_id):
        r = self.session.put(f"{self.base}/api/char/reassign",
                             json={"charID": char_id, "toUserID": to_user_id})
        return r.status_code == 200


def migrate(characters):
    """Backfill the 2.0 booleans in place (import coerces too; done here for clarity)."""
    for c in characters:
        c["npc"] = bool(c.get("npc", False))
        c["primary"] = bool(c.get("primary", False))
    print(f"  migrated {len(characters)} character(s) to schema {MIGRATION_VERSION}")
    return characters


def _signature(character):
    """A stable key for a character sheet, used to match imported docs to sources."""
    return json.dumps(character.get("character"), sort_keys=True, default=str)


def restore_owners(client, source_chars):
    """Best-effort: reassign freshly-imported characters to their source owners by name."""
    owners_by_sig = {}
    for c in source_chars:
        if c.get("owner") and c["owner"].get("name"):
            owners_by_sig.setdefault(_signature(c), []).append(c["owner"]["name"])

    if not owners_by_sig:
        print("  no owned characters to reassign")
        return

    users_by_name = {u["name"]: u["_id"] for u in client.list_users()}

    # Only unowned docs are reassignment candidates (i.e. the ones we just imported).
    candidates = {}
    for c in client.export_characters():
        if not c.get("owner"):
            candidates.setdefault(_signature(c), []).append(c["_id"])

    assigned, skipped = 0, 0
    for sig, names in owners_by_sig.items():
        for name in names:
            ids = candidates.get(sig)
            user_id = users_by_name.get(name)
            if not ids or not user_id:
                skipped += 1
                continue
            if client.reassign(ids.pop(0), user_id):
                assigned += 1
            else:
                skipped += 1
    print(f"  reassigned {assigned} character(s)" + (f", skipped {skipped}" if skipped else ""))


def load_json(path):
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, default=str)


def _require(value, name):
    if not value:
        sys.exit(f"error: {name} is required (pass the flag or set the env var)")
    return value


def _source_client(args):
    return ApiClient(_require(args.url or os.environ.get("SOURCE_API_URL"), "--url / SOURCE_API_URL")).login(
        _require(args.user or os.environ.get("SOURCE_ADMIN_USER"), "--user / SOURCE_ADMIN_USER"),
        _require(args.password or os.environ.get("SOURCE_ADMIN_PASS"), "--pass / SOURCE_ADMIN_PASS"))


def _target_client(args):
    return ApiClient(_require(args.url or os.environ.get("TARGET_API_URL"), "--url / TARGET_API_URL")).login(
        _require(args.user or os.environ.get("TARGET_ADMIN_USER"), "--user / TARGET_ADMIN_USER"),
        _require(args.password or os.environ.get("TARGET_ADMIN_PASS"), "--pass / TARGET_ADMIN_PASS"))


def cmd_download(args):
    client = _source_client(args)
    print(f"Downloading characters from {client.base} → {args.out}")
    chars = client.export_characters()
    save_json(args.out, chars)
    print(f"Done ({len(chars)} character(s)).")


def cmd_migrate(args):
    print(f"Migrating {args.infile} → {args.out}")
    save_json(args.out, migrate(load_json(args.infile)))
    print("Done.")


def cmd_upload(args):
    client = _target_client(args)
    chars = migrate(load_json(args.infile))
    print(f"Uploading {len(chars)} character(s) to {client.base}")
    created = client.import_characters(chars)
    print(f"  imported {created} character(s)")
    if args.reassign:
        restore_owners(client, chars)
    print("Done.")


def cmd_run(args):
    src_url = _require(args.source_url or os.environ.get("SOURCE_API_URL"), "--source-url / SOURCE_API_URL")
    tgt_url = _require(args.target_url or os.environ.get("TARGET_API_URL"), "--target-url / TARGET_API_URL")
    source = ApiClient(src_url).login(
        _require(args.source_user or os.environ.get("SOURCE_ADMIN_USER"), "--source-user / SOURCE_ADMIN_USER"),
        _require(args.source_pass or os.environ.get("SOURCE_ADMIN_PASS"), "--source-pass / SOURCE_ADMIN_PASS"))
    target = ApiClient(tgt_url).login(
        _require(args.target_user or os.environ.get("TARGET_ADMIN_USER"), "--target-user / TARGET_ADMIN_USER"),
        _require(args.target_pass or os.environ.get("TARGET_ADMIN_PASS"), "--target-pass / TARGET_ADMIN_PASS"))

    print(f"Exporting from {source.base}")
    chars = source.export_characters()
    print(f"  {len(chars)} character(s)")
    migrate(chars)
    print(f"Importing into {target.base}")
    created = target.import_characters(chars)
    print(f"  imported {created} character(s)")
    if args.reassign:
        restore_owners(target, chars)
    print("Done.")


def build_parser():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("download", help="export characters from a deployment to a JSON file")
    p.add_argument("--url", help="source API base URL (or SOURCE_API_URL)")
    p.add_argument("--user", help="admin username (or SOURCE_ADMIN_USER)")
    p.add_argument("--pass", dest="password", help="admin password (or SOURCE_ADMIN_PASS)")
    p.add_argument("--out", required=True, help="output JSON file")
    p.set_defaults(func=cmd_download)

    p = sub.add_parser("migrate", help="apply 2.0 transforms to an exported JSON file")
    p.add_argument("--in", dest="infile", required=True, help="input JSON file")
    p.add_argument("--out", required=True, help="output JSON file")
    p.set_defaults(func=cmd_migrate)

    p = sub.add_parser("upload", help="import characters from a JSON file into a deployment")
    p.add_argument("--url", help="target API base URL (or TARGET_API_URL)")
    p.add_argument("--user", help="admin username (or TARGET_ADMIN_USER)")
    p.add_argument("--pass", dest="password", help="admin password (or TARGET_ADMIN_PASS)")
    p.add_argument("--in", dest="infile", required=True, help="input JSON file")
    p.add_argument("--reassign", action="store_true", help="restore owners by name (users must already exist)")
    p.set_defaults(func=cmd_upload)

    p = sub.add_parser("run", help="export + migrate + import in one pass (no file)")
    p.add_argument("--source-url", help="source API base URL (or SOURCE_API_URL)")
    p.add_argument("--source-user", help="source admin username (or SOURCE_ADMIN_USER)")
    p.add_argument("--source-pass", help="source admin password (or SOURCE_ADMIN_PASS)")
    p.add_argument("--target-url", help="target API base URL (or TARGET_API_URL)")
    p.add_argument("--target-user", help="target admin username (or TARGET_ADMIN_USER)")
    p.add_argument("--target-pass", help="target admin password (or TARGET_ADMIN_PASS)")
    p.add_argument("--reassign", action="store_true", help="restore owners by name (users must already exist)")
    p.set_defaults(func=cmd_run)

    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
