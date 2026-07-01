"""Unit tests for the 2.0 character-sheet field conversions.

Pure-dict transforms, no MongoDB needed:  python -m unittest -v  (from migration/)
"""
import unittest

from migrate_to_2_0 import migrate, migrate_character_sheet


class MigrateCharacterSheet(unittest.TestCase):
    def test_features_traits_renamed_to_feats(self):
        ch = migrate_character_sheet({"featuresTraits": "Lucky, Alert"})
        self.assertEqual(ch["feats"], "Lucky, Alert")
        self.assertNotIn("featuresTraits", ch)

    def test_accepts_todo_spelling_featuretraits(self):
        ch = migrate_character_sheet({"featureTraits": "Tough"})
        self.assertEqual(ch["feats"], "Tough")
        self.assertNotIn("featureTraits", ch)

    def test_existing_feats_not_clobbered(self):
        ch = migrate_character_sheet({"feats": "keep", "featuresTraits": "drop"})
        self.assertEqual(ch["feats"], "keep")
        self.assertNotIn("featuresTraits", ch)

    def test_height_renamed_to_size(self):
        ch = migrate_character_sheet({"height": "5'10\""})
        self.assertEqual(ch["size"], "5'10\"")
        self.assertNotIn("height", ch)

    def test_spells_merge_levels_and_cantrips(self):
        ch = migrate_character_sheet({
            "cantrips": [{"name": "Fire Bolt"}, {"name": "Mage Hand"}],
            "lvl1Spells": [
                {"name": "Shield", "prepared": True},
                {"name": "Magic Missile", "prepared": False},
            ],
            "lvl3Spells": [{"name": "Fireball", "prepared": True}],
        })
        self.assertEqual(ch["spells"], [
            {"level": "0", "name": "Fire Bolt"},
            {"level": "0", "name": "Mage Hand"},
            {"level": "1", "name": "Shield", "notes": "Prepared"},
            {"level": "1", "name": "Magic Missile"},
            {"level": "3", "name": "Fireball", "notes": "Prepared"},
        ])
        # source arrays are consumed
        for key in ("cantrips", "lvl1Spells", "lvl3Spells"):
            self.assertNotIn(key, ch)

    def test_blank_spell_rows_are_omitted(self):
        ch = migrate_character_sheet({
            "cantrips": [{"name": "Light"}, {}, {"name": ""}],
            "lvl1Spells": [
                {"name": "Bless", "prepared": True},
                {"name": "   ", "prepared": True},  # whitespace-only padding
                {"prepared": False},
            ],
            "lvl2Spells": [{}, {"name": None}],  # entirely blank level
        })
        self.assertEqual(ch["spells"], [
            {"level": "0", "name": "Light"},
            {"level": "1", "name": "Bless", "notes": "Prepared"},
        ])

    def test_all_blank_spells_produce_no_spells_key(self):
        ch = migrate_character_sheet({"lvl1Spells": [{}, {"name": ""}], "cantrips": [{}]})
        self.assertNotIn("spells", ch)
        self.assertNotIn("lvl1Spells", ch)
        self.assertNotIn("cantrips", ch)

    def test_no_spells_key_when_empty(self):
        ch = migrate_character_sheet({"name": "Nobody"})
        self.assertNotIn("spells", ch)

    def test_backstory_preamble_order_and_labels(self):
        ch = migrate_character_sheet({
            "personalityTraits": "Curious",
            "ideals": "Knowledge",
            "bonds": "My tower",
            "flaws": "Reckless",
            "age": "124",
            "weight": "130 lb",
            "eyes": "Violet",
            "skin": "Pale",
            "hair": "Silver",
            "backstory": "Born under a comet.",
        })
        self.assertEqual(ch["backstory"], (
            "Personality: Curious\n"
            "Ideals: Knowledge\n"
            "Bonds: My tower\n"
            "Flaws: Reckless\n"
            "Age: 124\n"
            "Weight: 130 lb\n"
            "Eyes: Violet\n"
            "Skin: Pale\n"
            "Hair: Silver\n\n"
            "Born under a comet."
        ))
        for key in ("personalityTraits", "ideals", "bonds", "flaws",
                    "age", "weight", "eyes", "skin", "hair"):
            self.assertNotIn(key, ch)

    def test_backstory_skips_empty_fields_and_no_existing_backstory(self):
        ch = migrate_character_sheet({"personalityTraits": "Bold", "ideals": ""})
        self.assertEqual(ch["backstory"], "Personality: Bold")

    def test_backstory_untouched_when_no_profile_fields(self):
        ch = migrate_character_sheet({"backstory": "As-is."})
        self.assertEqual(ch["backstory"], "As-is.")

    def test_idempotent(self):
        raw = {
            "featuresTraits": "Alert",
            "height": "Medium",
            "cantrips": [{"name": "Light"}],
            "lvl1Spells": [{"name": "Bless", "prepared": True}],
            "personalityTraits": "Kind",
            "backstory": "Origin.",
        }
        once = migrate_character_sheet(dict(raw))
        twice = migrate_character_sheet(dict(once))
        self.assertEqual(once, twice)

    def test_non_dict_sheet_is_passthrough(self):
        self.assertIsNone(migrate_character_sheet(None))


class MigrateDump(unittest.TestCase):
    def test_migrate_backfills_flags_and_converts_sheet(self):
        data = {"characters": [
            {"character": {"featuresTraits": "Lucky", "height": "Tall"}},
            {"character": {"name": "NPC"}, "npc": True, "primary": True},
        ]}
        out = migrate(data)
        self.assertEqual(out["characters"][0]["character"]["feats"], "Lucky")
        self.assertEqual(out["characters"][0]["character"]["size"], "Tall")
        # flags coerced to booleans
        self.assertIs(out["characters"][0]["npc"], False)
        self.assertIs(out["characters"][0]["primary"], False)
        self.assertIs(out["characters"][1]["npc"], True)
        self.assertIs(out["characters"][1]["primary"], True)


if __name__ == "__main__":
    unittest.main()
