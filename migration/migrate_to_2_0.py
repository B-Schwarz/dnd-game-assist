#!/usr/bin/env python3
"""
Migrate the D&D game-assist database to the 2.0 schema.

The 2.0 backend is a superset of the old one — the character sheet sub-document
is stored opaquely (removed fields simply become orphan data, added fields are
absent on old docs and fall back to their defaults), so the only structural
changes that need backfilling live on the `characters` collection:

  * `npc`     — boolean, default False  (older docs may omit it)
  * `primary` — boolean, default False  (new in 2.0; absent on every old doc)

Everything else (users with their sessions/roles, monsters, encounters) is
carried over verbatim.

Typical use — dump prod, migrate, and load into the new database in one shot:

    export SOURCE_DB_URI="mongodb://user:pass@prod-host:27017/dnd"
    export TARGET_DB_URI="mongodb://127.0.0.1:27017/dnd"
    python migrate_to_2_0.py run --drop

Or split it into steps (e.g. to keep an on-disk backup between machines):

    python migrate_to_2_0.py download --uri "$SOURCE_DB_URI" --out prod.json
    python migrate_to_2_0.py migrate  --in prod.json --out prod-2.0.json
    python migrate_to_2_0.py upload   --uri "$TARGET_DB_URI" --in prod-2.0.json --drop

The JSON dumps use MongoDB extended JSON (via bson.json_util), so ObjectIds and
dates round-trip losslessly.
"""

import argparse
import os
import sys
from urllib.parse import urlsplit

from bson import json_util
from pymongo import MongoClient

MIGRATION_VERSION = "2.0"


def _db_name_from_uri(uri, override=None):
    """Resolve the database name: explicit --db wins, else the URI path, else 'dnd'."""
    if override:
        return override
    path = urlsplit(uri).path.lstrip("/")
    # strip any options after the db name (mongodb://host/dnd?authSource=admin)
    path = path.split("?")[0]
    return path or "dnd"


def dump_db(uri, db_name):
    """Read every collection of `db_name` into {collection_name: [documents]}."""
    client = MongoClient(uri)
    try:
        db = client[db_name]
        data = {}
        for name in db.list_collection_names():
            data[name] = list(db[name].find())
            print(f"  read {len(data[name]):>5} docs from '{name}'")
        return data
    finally:
        client.close()


def migrate(data):
    """Apply the in-place 2.0 transforms and return the same dict."""
    characters = data.get("characters", [])
    for doc in characters:
        doc["npc"] = bool(doc.get("npc", False))
        doc["primary"] = bool(doc.get("primary", False))
    print(f"  migrated {len(characters)} character docs to schema {MIGRATION_VERSION}")
    return data


def restore_db(uri, db_name, data, drop=False):
    """Write {collection: [documents]} into `db_name`, optionally dropping first."""
    client = MongoClient(uri)
    try:
        db = client[db_name]
        for name, docs in data.items():
            coll = db[name]
            if drop:
                coll.drop()
            if docs:
                coll.insert_many(docs)
            print(f"  wrote {len(docs):>5} docs to '{name}'"
                  + (" (dropped first)" if drop else ""))
    finally:
        client.close()


def load_json(path):
    with open(path, "r", encoding="utf-8") as fh:
        return json_util.loads(fh.read())


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(json_util.dumps(data, indent=2))


def _require(value, name):
    if not value:
        sys.exit(f"error: {name} is required (pass the flag or set the env var)")
    return value


def cmd_download(args):
    uri = _require(args.uri or os.environ.get("SOURCE_DB_URI"), "--uri / SOURCE_DB_URI")
    db_name = _db_name_from_uri(uri, args.db)
    print(f"Downloading database '{db_name}' → {args.out}")
    data = dump_db(uri, db_name)
    save_json(args.out, data)
    print("Done.")


def cmd_migrate(args):
    print(f"Migrating {args.infile} → {args.out}")
    data = load_json(args.infile)
    migrate(data)
    save_json(args.out, data)
    print("Done.")


def cmd_upload(args):
    uri = _require(args.uri or os.environ.get("TARGET_DB_URI"), "--uri / TARGET_DB_URI")
    db_name = _db_name_from_uri(uri, args.db)
    print(f"Uploading {args.infile} → database '{db_name}'")
    data = load_json(args.infile)
    restore_db(uri, db_name, data, drop=args.drop)
    print("Done.")


def cmd_run(args):
    source = _require(args.source or os.environ.get("SOURCE_DB_URI"), "--source / SOURCE_DB_URI")
    target = _require(args.target or os.environ.get("TARGET_DB_URI"), "--target / TARGET_DB_URI")
    source_db = _db_name_from_uri(source, args.source_db)
    target_db = _db_name_from_uri(target, args.target_db)

    print(f"Downloading source database '{source_db}'")
    data = dump_db(source, source_db)
    print("Migrating")
    migrate(data)
    print(f"Uploading to target database '{target_db}'")
    restore_db(target, target_db, data, drop=args.drop)
    print("Done.")


def build_parser():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("download", help="dump a database to a JSON file")
    p.add_argument("--uri", help="source Mongo URI (or SOURCE_DB_URI)")
    p.add_argument("--db", help="database name (default: from URI, else 'dnd')")
    p.add_argument("--out", required=True, help="output JSON file")
    p.set_defaults(func=cmd_download)

    p = sub.add_parser("migrate", help="apply 2.0 transforms to a JSON dump")
    p.add_argument("--in", dest="infile", required=True, help="input JSON file")
    p.add_argument("--out", required=True, help="output JSON file")
    p.set_defaults(func=cmd_migrate)

    p = sub.add_parser("upload", help="load a JSON dump into a database")
    p.add_argument("--uri", help="target Mongo URI (or TARGET_DB_URI)")
    p.add_argument("--db", help="database name (default: from URI, else 'dnd')")
    p.add_argument("--in", dest="infile", required=True, help="input JSON file")
    p.add_argument("--drop", action="store_true", help="drop each collection before loading")
    p.set_defaults(func=cmd_upload)

    p = sub.add_parser("run", help="download + migrate + upload in one pass (no file)")
    p.add_argument("--source", help="source Mongo URI (or SOURCE_DB_URI)")
    p.add_argument("--target", help="target Mongo URI (or TARGET_DB_URI)")
    p.add_argument("--source-db", help="source database name (default: from URI)")
    p.add_argument("--target-db", help="target database name (default: from URI)")
    p.add_argument("--drop", action="store_true", help="drop each target collection before loading")
    p.set_defaults(func=cmd_run)

    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
