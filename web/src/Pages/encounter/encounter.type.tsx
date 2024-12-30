import {Monster} from "../monster/monster.type";
import {Player} from "../initiative/player.type";

export interface EncounterType {
    _id: string,
    name: string,
    encounter: EncounterMonster[]
}

export interface EncounterMonster {
    monster: string,
    name?: string,
    data?: Player,
    hidden: boolean,
    amount: number
}