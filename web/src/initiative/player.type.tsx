import {DnDCharacter} from "dnd-character-sheets";
import {StatusEffectsEnum} from "./status-effects.enum";

export interface Player {
    character: DnDCharacter,
    initiative: number,
    isMaster: boolean,
    isTurn: boolean,
    isTurnSet: boolean,
    turn: number,
    statusEffects: StatusEffectsEnum[],
    hidden?: boolean,
    npc?: boolean,
}
