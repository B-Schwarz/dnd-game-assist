import React, {useState} from 'react'

import { DnDCharacterStatsSheet, DnDCharacterProfileSheet, DnDCharacterSpellSheet, DnDCharacter } from 'dnd-character-sheets'
import 'dnd-character-sheets/dist/index.css'

import {Button} from "@chakra-ui/react";

const App = () => {
    const [character, setCharacter] = useState<DnDCharacter>(loadDefaultCharacter())
    const [navTop, setNavTop] = useState<number>(0)
    const [prevScrollpos, setPrevScrollpos] = useState<number>(window.scrollY)
    const [, setLoading] = useState<boolean>(false)

    const statsSheet = (
        <DnDCharacterStatsSheet
            character={character}
            onCharacterChanged={updateCharacter}
        />
    )

    const profileSheet = (
        <DnDCharacterProfileSheet
            character={character}
            onCharacterChanged={updateCharacter}
        />
    )

    const spellSheet = (
        <DnDCharacterSpellSheet
            character={character}
            onCharacterChanged={updateCharacter}
        />
    )

    function loadDefaultCharacter () {
        let character: DnDCharacter = {}
        const lsData = localStorage.getItem('dnd-character-data')
        if (lsData) {
            try {
                character = JSON.parse(lsData)
            } catch {}
        }
        return character
    }

    function updateCharacter (character: DnDCharacter) {
        setCharacter(character)
        localStorage.setItem('dnd-character-data', JSON.stringify(character))
    }

    function click() {
        console.log(character)
    }

    return (
            <div>
                <Button colorScheme='blue' onClick={click}>Test!</Button>
                <div>
                    {statsSheet}
                    {profileSheet}
                    {spellSheet}
                </div>
            </div>
    )
}


export default App
