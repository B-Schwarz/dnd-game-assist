#!/usr/bin/env python3
"""
Migrate the D&D game-assist database to the 2.0 schema by talking to MongoDB
directly. Designed to run as a throwaway container that shares the compose
network with the `db` service and a `dump` volume (see migration/README.md):

  * `dump`    — read every domain collection (users, characters, monsters,
                encounters) from the OLD deployment's DB into a JSON file on the
                shared volume.
  * `restore` — read that JSON file, apply the 2.0 transforms, and write it into
                the NEW (2.0) deployment's DB.

The 2.0 backend stores each character sheet as an opaque sub-document, so most
of the 2024 sheet redesign needs no data migration (removed fields become orphan
data, added fields fall back to their defaults). What does need converting:

  * the `characters` collection gains two booleans — `npc` (default False) and
    `primary` (default False, new in 2.0); and
  * a handful of renamed/merged sheet fields (see `migrate_character_sheet`):
    `featuresTraits` -> `feats`; `height` -> `size`; the leveled spell lists
    (`cantrips` + `lvl1Spells`..`lvl9Spells`) fold into one `spells` list; and
    the old profile fields (personality/ideals/bonds/flaws/age/weight/eyes/
    skin/hair) are prepended to `backstory` as labelled lines.

Users (with their bcrypt password hashes / roles), monsters and encounters are
carried over verbatim.

The connection string comes from `DB_URI` (the same env var the app uses) or
`--uri`; the JSON dump uses MongoDB extended JSON so ObjectIds and dates
round-trip losslessly.
"""

import argparse
import os
import sys
from urllib.parse import urlsplit

from bson import json_util
from pymongo import MongoClient

MIGRATION_VERSION = "2.0"

# The domain collections we move. Ephemeral data (express-session tokens) is
# deliberately excluded — sessions do not survive a migration anyway.
COLLECTIONS = ["users", "characters", "monsters", "encounters"]


def _db_name_from_uri(uri, override=None):
    """Resolve the database name: explicit --db wins, else the URI path, else 'dnd'."""
    if override:
        return override
    path = urlsplit(uri).path.lstrip("/").split("?")[0]
    return path or "dnd"


def dump_db(uri, db_name):
    """Read the domain collections of `db_name` into {collection: [documents]}."""
    client = MongoClient(uri)
    try:
        db = client[db_name]
        data = {}
        for name in COLLECTIONS:
            data[name] = list(db[name].find())
            print(f"  read {len(data[name]):>5} docs from '{name}'")
        return data
    finally:
        client.close()


# ---- character-sheet field conversions (1.x sheet shape -> 2.0 sheet shape) --
# The character sheet is stored as an opaque sub-document, so these transforms
# operate on plain dicts. Renamed/removed source fields are dropped; unknown
# fields the 2.0 sheet doesn't read simply become orphan data.

# Profile fields the 1.x sheet kept as separate inputs. The 2.0 sheet folds them
# into the free-text backstory, one labelled line each, in this order.
_BACKSTORY_FIELDS = [
    ("personalityTraits", "Personality"),
    ("ideals", "Ideals"),
    ("bonds", "Bonds"),
    ("flaws", "Flaws"),
    ("age", "Age"),
    ("weight", "Weight"),
    ("eyes", "Eyes"),
    ("skin", "Skin"),
    ("hair", "Hair"),
]


def _spell_entry(level, spell):
    """Map a 1.x spell ({name, prepared?}) onto a 2.0 spell ({level, name, notes})."""
    spell = spell or {}
    entry = {"level": str(level), "name": spell.get("name", "")}
    if spell.get("prepared"):
        entry["notes"] = "Prepared"
    return entry


def _is_named_spell(spell):
    """True if a 1.x spell row actually holds a spell (blank padding rows don't)."""
    return bool(str((spell or {}).get("name") or "").strip())


def migrate_character_sheet(ch):
    """Convert one opaque character sheet from the 1.x shape to the 2.0 shape.

    Mutates and returns `ch`. Idempotent on already-converted sheets (the 1.x
    source fields are gone, so a second pass is a no-op).
    """
    if not isinstance(ch, dict):
        return ch

    # 1. featuresTraits -> feats  (the TODO writes "featureTraits"; the real 1.x
    #    field is "featuresTraits" — accept either, without clobbering an
    #    existing `feats`).
    for old_key in ("featuresTraits", "featureTraits"):
        if old_key in ch:
            value = ch.pop(old_key)
            if not ch.get("feats"):
                ch["feats"] = value

    # 2. cantrips (level 0) + lvl1Spells..lvl9Spells -> one unified `spells` list.
    #    The TODO only names lvlXSpells; cantrips are folded in as level 0 so the
    #    1.x cantrip list isn't silently dropped. Blank padding rows (no name)
    #    are omitted.
    merged = list(ch.get("spells") or [])
    for spell in (ch.pop("cantrips", None) or []):
        if _is_named_spell(spell):
            merged.append(_spell_entry(0, spell))
    for lvl in range(1, 10):
        for spell in (ch.pop(f"lvl{lvl}Spells", None) or []):
            if _is_named_spell(spell):
                merged.append(_spell_entry(lvl, spell))
    if merged:
        ch["spells"] = merged

    # 3. personalityTraits/ideals/bonds/flaws/age/weight/eyes/skin/hair ->
    #    prepended to backstory as labelled lines (empty fields skipped).
    lines = []
    for key, label in _BACKSTORY_FIELDS:
        value = ch.pop(key, None)
        if value not in (None, ""):
            lines.append(f"{label}: {value}")
    if lines:
        preamble = "\n".join(lines)
        existing = ch.get("backstory") or ""
        ch["backstory"] = preamble + ("\n\n" + existing if existing else "")

    # 4. height -> size
    if "height" in ch:
        ch["size"] = ch.pop("height")

    return ch


def migrate(data):
    """Apply the in-place 2.0 transforms and return the same dict."""
    characters = data.get("characters", [])
    for doc in characters:
        doc["npc"] = bool(doc.get("npc", False))
        doc["primary"] = bool(doc.get("primary", False))
        migrate_character_sheet(doc.get("character"))
    print(f"  migrated {len(characters)} character doc(s) to schema {MIGRATION_VERSION}")
    return data


def restore_db(uri, db_name, data, drop=False):
    """Write {collection: [documents]} into `db_name`, optionally dropping first."""
    client = MongoClient(uri)
    try:
        db = client[db_name]
        for name in COLLECTIONS:
            docs = data.get(name, [])
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


def _resolve_uri(args):
    return _require(args.uri or os.environ.get("DB_URI"), "--uri / DB_URI")


def _require(value, name):
    if not value:
        sys.exit(f"error: {name} is required (pass the flag or set the env var)")
    return value


def cmd_dump(args):
    uri = _resolve_uri(args)
    db_name = _db_name_from_uri(uri, args.db)
    print(f"Dumping database '{db_name}' → {args.out}")
    save_json(args.out, dump_db(uri, db_name))
    print("Done.")


def cmd_restore(args):
    uri = _resolve_uri(args)
    db_name = _db_name_from_uri(uri, args.db)
    print(f"Restoring {args.infile} → database '{db_name}'")
    data = migrate(load_json(args.infile))
    restore_db(uri, db_name, data, drop=args.drop)
    print("Done.")


def cmd_migrate(args):
    print(f"Migrating {args.infile} → {args.out}")
    save_json(args.out, migrate(load_json(args.infile)))
    print("Done.")


def build_parser():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("dump", help="dump the domain collections to a JSON file")
    p.add_argument("--uri", help="Mongo URI (default: DB_URI env)")
    p.add_argument("--db", help="database name (default: from URI, else 'dnd')")
    p.add_argument("--out", required=True, help="output JSON file (on the shared volume)")
    p.set_defaults(func=cmd_dump)

    p = sub.add_parser("restore", help="apply 2.0 transforms and load a dump into the DB")
    p.add_argument("--uri", help="Mongo URI (default: DB_URI env)")
    p.add_argument("--db", help="database name (default: from URI, else 'dnd')")
    p.add_argument("--in", dest="infile", required=True, help="input JSON file (on the shared volume)")
    p.add_argument("--drop", action="store_true", help="drop each collection before loading")
    p.set_defaults(func=cmd_restore)

    p = sub.add_parser("migrate", help="apply 2.0 transforms to a JSON dump (file → file)")
    p.add_argument("--in", dest="infile", required=True, help="input JSON file")
    p.add_argument("--out", required=True, help="output JSON file")
    p.set_defaults(func=cmd_migrate)

    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
