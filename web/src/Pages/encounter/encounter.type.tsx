import {Monster} from "../monster/monster.type";

export interface EncounterType {
    _id: string,
    name: string,
    encounter: [{
        monster: string,
        name?: string,
        hidden: boolean,
        amount: number
    }]
}
