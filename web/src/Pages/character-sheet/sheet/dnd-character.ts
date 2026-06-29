// In-app D&D 2024 character model. Previously this lived in the external
// `dnd-character-sheets` package; it is now embedded directly in the frontend.

export enum Color {
    NONE,
    BLACK,
    GREY,
    PURPLE,
    RED,
    PINK,
    ORANGE,
    YELLOW,
    GREEN,
    BLUE,
    WHITE
}

export interface Attack {
    name?: string
    bonus?: string
    damage?: string
    notes?: string
}

export interface Spell {
    level?: string
    name?: string
    castingTime?: string
    range?: string
    concentration?: boolean
    ritual?: boolean
    material?: boolean
    notes?: string
}

export interface DnDCharacter {
    // Identity
    name?: string
    playerName?: string
    background?: string
    classLevel?: string // "Class"
    subclass?: string
    level?: string
    race?: string // "Species"
    xp?: string
    alignment?: string
    color?: Color

    // Abilities
    str?: string
    dex?: string
    con?: string
    int?: string
    wis?: string
    cha?: string

    inspiration?: string // "Heroic Inspiration"
    proficiencyBonus?: string

    // Saving throws (value + proficiency state 'none' | 'normal' | 'expert')
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

    // Skills
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

    // Equipment Training & Proficiencies
    armorTrainingLight?: boolean
    armorTrainingMedium?: boolean
    armorTrainingHeavy?: boolean
    armorTrainingShields?: boolean
    weaponProficiencies?: string
    toolProficiencies?: string

    // Combat
    ac?: string
    shield?: boolean
    init?: string
    speed?: string
    size?: string

    maxHp?: string
    hp?: string
    tempHp?: string

    hitDiceMax?: string
    hitDice?: string // spent

    deathsaveSuccesses?: number
    deathsaveFailures?: number

    attacks?: Attack[] // Weapons & Damage Cantrips

    // Features
    classFeatures?: string
    classFeatures2?: string
    speciesTraits?: string
    feats?: string

    // Background / profile
    appearance?: string
    backstory?: string
    languages?: string

    equipment?: string
    attunement1?: string
    attunement2?: string
    attunement3?: string
    attunement1Checked?: boolean
    attunement2Checked?: boolean
    attunement3Checked?: boolean

    cp?: string
    sp?: string
    ep?: string
    gp?: string
    pp?: string

    // Spellcasting
    spellcastingAbility?: string
    spellcastingModifier?: string
    spellSaveDC?: string
    spellAttackBonus?: string

    lvl1SpellSlotsTotal?: string
    lvl1SpellSlotsExpended?: number
    lvl2SpellSlotsTotal?: string
    lvl2SpellSlotsExpended?: number
    lvl3SpellSlotsTotal?: string
    lvl3SpellSlotsExpended?: number
    lvl4SpellSlotsTotal?: string
    lvl4SpellSlotsExpended?: number
    lvl5SpellSlotsTotal?: string
    lvl5SpellSlotsExpended?: number
    lvl6SpellSlotsTotal?: string
    lvl6SpellSlotsExpended?: number
    lvl7SpellSlotsTotal?: string
    lvl7SpellSlotsExpended?: number
    lvl8SpellSlotsTotal?: string
    lvl8SpellSlotsExpended?: number
    lvl9SpellSlotsTotal?: string
    lvl9SpellSlotsExpended?: number

    spells?: Spell[] // unified Cantrips & Prepared Spells list
}
