export default class DnDCharacter {
  name?: string
  classLevel?: string
  background?: string
  playerName?: string
  faction?: string
  race?: string
  alignment?: string
  xp?: string
  dciNo?: string

  str?: string
  dex?: string
  con?: string
  int?: string
  wis?: string
  cha?: string

  inspiration?: string
  proficiencyBonus?: string

  strSave?: string
  strSaveChecked?: boolean
  dexSave?: string
  dexSaveChecked?: boolean
  conSave?: string
  conSaveChecked?: boolean
  intSave?: string
  intSaveChecked?: boolean
  wisSave?: string
  wisSaveChecked?: boolean
  chaSave?: string
  chaSaveChecked?: boolean

  skillAcrobatics?: string
  skillAcrobaticsChecked?: boolean
  skillAcrobaticsExpert?: boolean
  skillAnimalHandling?: string
  skillAnimalHandlingChecked?: boolean
  skillAnimalHandlingExpert?: boolean
  skillArcana?: string
  skillArcanaChecked?: boolean
  skillArcanaExpert?: boolean
  skillAthletics?: string
  skillAthleticsChecked?: boolean
  skillAthleticsExpert?: boolean
  skillDeception?: string
  skillDeceptionChecked?: boolean
  skillDeceptionExpert?: boolean
  skillHistory?: string
  skillHistoryChecked?: boolean
  skillHistoryExpert?: boolean
  skillInsight?: string
  skillInsightChecked?: boolean
  skillInsightExpert?: boolean
  skillIntimidation?: string
  skillIntimidationChecked?: boolean
  skillIntimidationExpert?: boolean
  skillInvestigation?: string
  skillInvestigationChecked?: boolean
  skillInvestigationExpert?: boolean
  skillMedicine?: string
  skillMedicineChecked?: boolean
  skillMedicineExpert?: boolean
  skillNature?: string
  skillNatureChecked?: boolean
  skillNatureExpert?: boolean
  skillPerception?: string
  skillPerceptionChecked?: boolean
  skillPerceptionExpert?: boolean
  skillPerformance?: string
  skillPerformanceChecked?: boolean
  skillPerformanceExpert?: boolean
  skillPersuasion?: string
  skillPersuasionChecked?: boolean
  skillPersuasionExpert?: boolean
  skillReligion?: string
  skillReligionChecked?: boolean
  skillReligionExpert?: boolean
  skillSlightOfHand?: string
  skillSlightOfHandChecked?: boolean
  skillSlightOfHandExpert?: boolean
  skillStealth?: string
  skillStealthChecked?: boolean
  skillStealthExpert?: boolean
  skillSurvival?: string
  skillSurvivalChecked?: boolean
  skillSurvivalExpert?: boolean

  passivePerception?: string
  otherProficiencies?: string

  ac?: string
  init?: string
  speed?: string

  maxHp?: string
  hp?: string
  tempHp?: string

  hitDiceMax?: string
  hitDice?: string

  deathsaveSuccesses?: number
  deathsaveFailures?: number

  attacks?: any[]
  attacksText?: string

  cp?: string
  sp?: string
  ep?: string
  gp?: string
  pp?: string
  equipment?: string
  equipment2?: string

  personalityTraits?: string
  ideals?: string
  bonds?: string
  flaws?: string

  featuresTraits?: string

  age?: string
  height?: string
  weight?: string
  eyes?: string
  skin?: string
  hair?: string

  appearance?: string
  backstory?: string

  factionImg?: string
  factionRank?: string
  allies?: string
  allies2?: string

  additionalFeatures?: string
  additionalFeatures2?: string

  totalNonConsumableMagicItems?: string
  treasure?: string
  treasure2?: string

  spellcastingClass?: string
  spellcastingAbility?: string
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
