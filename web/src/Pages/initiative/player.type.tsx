import {DnDCharacter} from "dnd-character-sheets";
import {StatusEffectsEnum} from "./status-effects.enum";
import {ColorMarkerEnum} from "./color-marker.enum";

export interface Player {
    character: DnDCharacter,
    initiative: number,
    isMaster: boolean,
    isTurnSet: boolean,
    turnId: number,
    statusEffects: StatusEffectsEnum[],
    id: string,
    hidden?: boolean,
    npc?: boolean,
    colorMarker?: ColorMarkerEnum
}
