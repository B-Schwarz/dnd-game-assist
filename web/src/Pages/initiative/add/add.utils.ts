// Pure helpers for the "add to initiative" modals (add-player / add-npc /
// add-monster / add-encounter). Extracted so the search filter, initiative
// roll, colour mapping and encounter expansion can be unit-tested without
// rendering the axios-driven modal components.

import _ from "lodash";
import {Player} from "../player.type";
import {EncounterType} from "../../encounter/encounter.type";

// Case-insensitive name filter; returns a new array and never mutates the input.
export const filterByName = <T extends { character: { name?: string } }>(list: T[], query: string): T[] =>
    list.filter(d => (d.character?.name || '').toLowerCase().includes(query.toLowerCase()))

// A d20 roll as the board uses it: Math.floor(Math.random()*20) → 0..19.
export const rollD20 = (): number => Math.floor(Math.random() * 20)

// 5e ability modifier; non-numeric input yields NaN (callers that want a 0
// fallback apply `|| 0` themselves, matching the add-npc behaviour).
export const abilityModifier = (score: any): number => Math.floor((Number(score) - 10) / 2)

// A character colour maps straight onto a board colour marker.
export const colorToMarker = (color: any): number => Number(color)

type RawChar = { character: any; _id: string; npc: boolean }

const baseEntry = (character: any, id: string): Player => ({
    character,
    id,
    initiative: 0,
    isMaster: false,
    isTurnSet: false,
    statusEffects: [],
    turnId: 0,
})

// add-player: only non-NPC characters become board entries.
export const playableEntries = (chars: RawChar[]): Player[] =>
    chars.filter(c => !c.npc).map(c => baseEntry(c.character, c._id))

// add-npc: only NPC characters, flagged npc + visible by default.
export const npcEntries = (chars: RawChar[]): Player[] =>
    chars.filter(c => c.npc).map(c => ({...baseEntry(c.character, c._id), hidden: false, npc: true}))

// onHide: stamp the hidden flag on an entry before it is added (mutates in place,
// as the modals do, and returns it for convenience).
export const applyHidden = <T extends { hidden?: boolean }>(entry: T, val: boolean): T => {
    entry.hidden = val
    return entry
}

// add-encounter: expand an encounter into one independently-rolled board entry
// per monster per `amount`. Each instance is a deep clone so their initiatives
// don't clobber one another. `amount: 0` contributes nothing.
export const buildEncounterInstances = (encounter: EncounterType, roll: () => number = rollD20): Player[] => {
    const out: Player[] = []
    encounter.encounter.forEach(group => {
        for (let i = 0; i < group.amount; i++) {
            const data: Player | undefined = group.data ? _.cloneDeep(group.data) : undefined
            if (data && data.character && data.character.dex) {
                data.initiative = abilityModifier(data.character.dex) + roll()
            }
            if (data) out.push(data)
        }
    })
    return out
}
