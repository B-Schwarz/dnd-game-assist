export interface Monster {
    _id: string,
    monster: {
        name: string,
        monsterType: string,
        ac: string,
        hp: string,
        speed: string,
        stats: {
            str: number,
            dex: number,
            con: number,
            int: number,
            wis: number,
            cha: number
        },
        saving: {
            str: number,
            dex: number,
            con: number,
            int: number,
            wis: number,
            cha: number
        },
        skills: string,
        dmgImmunity: string,
        dmgResistance: string,
        dmgVulnerability: string,
        condImmunity: string,
        senses: string,
        languages: string,
        cr: string,
        attributes: string,
        actions: string,
        legendaryActions: string
    },
    hidden?: boolean
}
