const mongoose = require('mongoose');

//Define a schema
const MonsterSchema = new mongoose.Schema({
    monster: {
        name: {
            type: String,
            default: ''
        },
        monsterType: {
          type: String,
            default: ''
        },
        ac: {
            type: String,
            default: ''
        },
        hp: {
            type: String,
            default: ''
        },
        speed: {
            type: String,
            default: ''
        },
        stats: {
            str: {
                type: Number,
                default: 10
            },
            dex: {
                type: Number,
                default: 10
            },
            con: {
                type: Number,
                default: 10
            },
            int: {
                type: Number,
                default: 10
            },
            wis: {
                type: Number,
                default: 10
            },
            cha: {
                type: Number,
                default: 10
            }
        },
        saving: {
            str: {
                type: Number,
                default: 0
            },
            dex: {
                type: Number,
                default: 0
            },
            con: {
                type: Number,
                default: 0
            },
            int: {
                type: Number,
                default: 0
            },
            wis: {
                type: Number,
                default: 0
            },
            cha: {
                type: Number,
                default: 0
            }
        },
        skills: {
            type: String,
            default: ''
        },
        dmgImmunity: {
            type: String,
            default: ''
        },
        dmgResistance: {
            type: String,
            default: ''
        },
        dmgVulnerability: {
            type: String,
            default: ''
        },
        condImmunity: {
            type: String,
            default: ''
        },
        senses: {
            type: String,
            default: ''
        },
        languages: {
            type: String,
            default: ''
        },
        cr: {
            type: String,
            default: ''
        },
        attributes: {
            type: String,
            default: ''
        },
        actions: {
            type: String,
            default: ''
        },
        legendaryActions: {
            type: String,
            default: ''
        }
    }
});


//Create Model
const Monster = mongoose.model('Monster', MonsterSchema);

//Export Model
module.exports = {Monster};

