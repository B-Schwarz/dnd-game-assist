// Pure helpers for the encounter editor (encounter-entry.tsx). Extracted so the
// "add a monster row" and "remove a monster row" logic can be unit-tested
// without rendering the axios-driven editor.

import {EncounterMonster, EncounterType} from "./encounter.type";
import {Monster} from "../monster/monster.type";

// Build a new encounter row for the selected monster id, resolving its display
// name from the already-loaded monster list so the row shows the name
// immediately instead of only after the next save/reload.
export const newEncounterRow = (
    monsterId: string,
    monsterList: Monster[],
    hidden: boolean,
    amount: number
): EncounterMonster => {
    const selected = monsterList.find(m => m._id === monsterId)
    return {
        monster: monsterId,
        name: selected ? selected.monster.name : "",
        hidden,
        amount,
    }
}

// Remove the row at `index`, returning a new encounter (the rows array is rebuilt
// so the editor re-renders from state instead of mutating in place and painting
// the deleted row — which previously left a stale highlighted row behind until
// the next reload).
export const removeMonsterAt = (encounter: EncounterType, index: number): EncounterType => ({
    ...encounter,
    encounter: encounter.encounter.filter((_, i) => i !== index),
})
