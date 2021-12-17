import React, {useState} from 'react'

import { DnDCharacterStatsSheet, DnDCharacterProfileSheet, DnDCharacterSpellSheet, DnDCharacter } from 'dnd-character-sheets'
import 'dnd-character-sheets/dist/index.css'

import {Button} from "@chakra-ui/react";
import axios from "axios";
import {useParams} from "react-router-dom";

const App = () => {
    const [character, setCharacter] = useState<DnDCharacter>(loadDefaultCharacter())

    const id = useParams().id
    console.log(id)
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

    async function send() {
        const data = {character: character}
        console.log(data)
        await axios.post('http://localhost:4000/api/test', data, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    async function recv() {
        axios.get('http://localhost:4000/api/test', {withCredentials: true})
            .then((data) => updateCharacter(data.data.character))
            .catch((e) => console.error(e))
    }

    return (
            <React.Fragment>
                <Button colorScheme='blue' onClick={send}>Senden!</Button>
                <Button colorScheme='blue' onClick={recv}>Erhalten!</Button>
                <div>
                    {statsSheet}
                    {profileSheet}
                    {spellSheet}
                </div>
            </React.Fragment>
    )
}


export default App
