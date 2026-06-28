import {Color} from './Components/color.enum'

export default class DnDCharacter {
  name?: string
  classLevel?: string // 2024: "Class" (level tracked separately in `level`)
  subclass?: string
  level?: string
  background?: string
  race?: string // 2024: "Species"
  alignment?: string
  xp?: string
  color?: Color

  str?: string
  dex?: string
  con?: string
  int?: string
  wis?: string
  cha?: string

  inspiration?: string // 2024: "Heroic Inspiration"
  proficiencyBonus?: string

  strSave?: string
  strSaveChecked?: string
  dexSave?: string
  dexSaveChecked?: string
  conSave?: string
  conSaveChecked?: string
  intSave?: string
  intSaveChecked?: string
  wisSave?: string
  wisSaveChecked?: string
  chaSave?: string
  chaSaveChecked?: string
  skillAcrobatics?: string
  skillAcrobaticsChecked?: string
  skillAnimalHandling?: string
  skillAnimalHandlingChecked?: string
  skillArcana?: string
  skillArcanaChecked?: string
  skillAthletics?: string
  skillAthleticsChecked?: string
  skillDeception?: string
  skillDeceptionChecked?: string
  skillHistory?: string
  skillHistoryChecked?: string
  skillInsight?: string
  skillInsightChecked?: string
  skillIntimidation?: string
  skillIntimidationChecked?: string
  skillInvestigation?: string
  skillInvestigationChecked?: string
  skillMedicine?: string
  skillMedicineChecked?: string
  skillNature?: string
  skillNatureChecked?: string
  skillPerception?: string
  skillPerceptionChecked?: string
  skillPerformance?: string
  skillPerformanceChecked?: string
  skillPersuasion?: string
  skillPersuasionChecked?: string
  skillReligion?: string
  skillReligionChecked?: string
  skillSlightOfHand?: string
  skillSlightOfHandChecked?: string
  skillStealth?: string
  skillStealthChecked?: string
  skillSurvival?: string
  skillSurvivalChecked?: string

  passivePerception?: string

  // 2024: Equipment Training & Proficiencies
  armorTrainingLight?: boolean
  armorTrainingMedium?: boolean
  armorTrainingHeavy?: boolean
  armorTrainingShields?: boolean
  weaponProficiencies?: string
  toolProficiencies?: string

  ac?: string
  shield?: boolean
  init?: string
  speed?: string
  size?: string

  maxHp?: string
  hp?: string
  tempHp?: string

  hitDiceMax?: string
  hitDice?: string // 2024: hit dice "Spent" (was "remaining")

  deathsaveSuccesses?: number
  deathsaveFailures?: number

  attacks?: any[] // 2024: "Weapons & Damage Cantrips"

  cp?: string
  sp?: string
  ep?: string
  gp?: string
  pp?: string
  equipment?: string

  // 2024: Magic Item Attunement slots
  attunement1?: string
  attunement2?: string
  attunement3?: string

  // 2024: split feature boxes
  classFeatures?: string
  speciesTraits?: string
  feats?: string

  languages?: string

  appearance?: string
  backstory?: string // 2024: "Backstory & Personality"

  spellcastingAbility?: string
  spellcastingModifier?: string
  spellSaveDC?: string
  spellAttackBonus?: string

  cantrips?: any[]

  lvl1SpellSlotsTotal?: string
  lvl1SpellSlotsUsed?: number
  lvl1Spells?: any[]

  lvl2SpellSlotsTotal?: string
  lvl2SpellSlotsUsed?: number
  lvl2Spells?: any[]

  lvl3SpellSlotsTotal?: string
  lvl3SpellSlotsUsed?: number
  lvl3Spells?: any[]

  lvl4SpellSlotsTotal?: string
  lvl4SpellSlotsUsed?: number
  lvl4Spells?: any[]

  lvl5SpellSlotsTotal?: string
  lvl5SpellSlotsUsed?: number
  lvl5Spells?: any[]

  lvl6SpellSlotsTotal?: string
  lvl6SpellSlotsUsed?: number
  lvl6Spells?: any[]

  lvl7SpellSlotsTotal?: string
  lvl7SpellSlotsUsed?: number
  lvl7Spells?: any[]

  lvl8SpellSlotsTotal?: string
  lvl8SpellSlotsUsed?: number
  lvl8Spells?: any[]

  lvl9SpellSlotsTotal?: string
  lvl9SpellSlotsUsed?: number
  lvl9Spells?: any[]
}
