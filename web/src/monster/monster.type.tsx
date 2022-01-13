export interface Monster {
    _id: String,
    monster: {
        name: String,
        monsterType: String,
        ac: String,
        hp: String,
        speed: String,
        stats: {
            str: Number,
            dex: Number,
            con: Number,
            int: Number,
            wis: Number,
            cha: Number
        },
        saving: {
            str: Number,
            dex: Number,
            con: Number,
            int: Number,
            wis: Number,
            cha: Number
        },
        skills: String,
        dmgImmunity: String,
        dmgResistance: String,
        dmgVulnerability: String,
        condImmunity: String,
        senses: String,
        languages: String,
        cr: String,
        attributes: String,
        actions: String,
        legendaryActions: String
    },
    hidden: boolean
}
