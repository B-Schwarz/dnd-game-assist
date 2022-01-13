import React, {useEffect, useState} from 'react'

import {
    DnDCharacterStatsSheet,
    DnDCharacterProfileSheet,
    DnDCharacterSpellSheet,
    DnDCharacter
} from 'dnd-character-sheets'
import 'dnd-character-sheets/dist/index.css'

import axios from "axios";
import {useParams} from "react-router-dom";
import WithAuth from "../login/withAuth";

const App = () => {
    const [character, setCharacter] = useState<DnDCharacter>(loadDefaultCharacter())
    const [change, setChange] = useState(false)
    const [isMaster, setIsMaster] = useState(true)

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
    }

    async function send() {
        const data = {character: character, charID: id}
        if (isMaster) {
            axios.post('http://localhost:4000/api/char', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).catch(() => {
                setIsMaster(false)
                axios.post(`http://localhost:4000/api/char/me`, data)
                    .catch(() => {
                    })
            })
        } else {
            axios.post(`http://localhost:4000/api/char/me`, data)
                .catch(() => {
                })
        }
    }

    async function recv() {
        if (isMaster) {
            axios.get(`http://localhost:4000/api/char/get/${id}`)
                .then((data) => {
                    updateCharacter(data.data.character)
                })
                .catch(() => {
                    axios.get(`http://localhost:4000/api/char/me/get/${id}`)
                        .then((data) => {
                            updateCharacter(data.data.character)
                        })
                        .catch(() => {
                        })
                })
        } else {
            axios.get(`http://localhost:4000/api/char/me/get/${id}`)
                .then((data) => {
                    updateCharacter(data.data.character)
                })
                .catch(() => {
                })
        }
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
    }, [change, isMaster])

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


export default WithAuth(App)
