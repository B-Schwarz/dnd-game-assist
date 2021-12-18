import React, {useEffect, useState} from 'react'

import {
    DnDCharacterStatsSheet,
    DnDCharacterProfileSheet,
    DnDCharacterSpellSheet,
    DnDCharacter
} from 'dnd-character-sheets'
import 'dnd-character-sheets/dist/index.css'

import {Button} from "@chakra-ui/react";
import axios from "axios";
import {useParams} from "react-router-dom";

const App = () => {
    const [character, setCharacter] = useState<DnDCharacter>(loadDefaultCharacter())
    const [change, setChange] = useState(false)

    const id = useParams().id

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

    function loadDefaultCharacter() {
        let character: DnDCharacter = {}
        const lsData = localStorage.getItem('dnd-character-data')
        if (lsData) {
            try {
                character = JSON.parse(lsData)
            } catch {
            }
        }
        return character
    }

    function updateCharacter(character: DnDCharacter) {
        setCharacter(character)
        localStorage.setItem('dnd-character-data', JSON.stringify(character))
        setChange(true)
        console.log(change)
    }

    async function send() {
        const data = {character: character, charID: id}
        console.log(data)
        await axios.post('http://localhost:4000/api/char', data, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(async (e) => {
            if (e.response.status === 401) {
                await axios.post(`http://localhost:4000/api/char/me/${id}`, data, {withCredentials: true})
                    .catch(() => {
                    })
            }
        })
    }

    async function recv() {
        axios.get(`http://localhost:4000/api/char/${id}`, {withCredentials: true})
            .then((data) => {
                updateCharacter(data.data.character)
            })
            .catch(async (e) => {
                if (e.response.status === 401) {
                    await axios.get(`http://localhost:4000/api/char/me/${id}`, {withCredentials: true})
                        .then((data) => {
                            updateCharacter(data.data.character)
                        })
                        .catch((e) => {
                        })
                }
            })
    }

    useEffect(() => {
        recv()
    }, [])

    useEffect(() => {
        if (change) {
            send().then(() => {
                setChange(false)
            })
        }
    }, [change])

    return (
        <>
            <div>
                {statsSheet}
                {profileSheet}
                {spellSheet}
            </div>
        </>
    )
}


export default App
