import React, {useEffect, useState} from 'react'

import {
    DnDCharacter,
    DnDCharacterProfileSheet,
    DnDCharacterSpellSheet,
    DnDCharacterStatsSheet
} from 'dnd-character-sheets'
import 'dnd-character-sheets/index.css'

import axios from "axios";
import {useParams} from "react-router-dom";
import WithAuth from "../login/withAuth";
import TitleService from "../../Service/titleService";
import {LanguageType} from "../settings/language.type";

const App = () => {
    const id = useParams().id

    const [isMaster, setIsMaster] = useState(true)
    const [character, setCharacter] = useState<DnDCharacter>(loadDefaultCharacter())
    const [change, setChange] = useState(false)
    const [german] = useState<boolean>(loadDefaultLanguage())


    const statsSheet = (
        <DnDCharacterStatsSheet
            character={character}
            onCharacterChanged={updateCharacter}
            german={german}
            />
    )

    const profileSheet = (
        <DnDCharacterProfileSheet
            character={character}
            onCharacterChanged={updateCharacter}
            german={german}
        />
    )

    const spellSheet = (
        <DnDCharacterSpellSheet
            character={character}
            onCharacterChanged={updateCharacter}
            german={german}
        />
    )

    function loadDefaultCharacter() {
        let character: DnDCharacter = {}
        return character
    }

    function loadDefaultLanguage() {
        let lang: LanguageType = LanguageType.en
        const lsData = localStorage.getItem('dnd-character-language')
        if (lsData) {
            if (lsData in LanguageType) {
                lang = LanguageType[lsData as keyof typeof LanguageType]
            } else {
                localStorage.setItem('dnd-character-language', lang.toString())
            }
        } else {
            localStorage.setItem('dnd-character-language', lang.toString())
        }
        return lang === LanguageType.de
    }

    function updateCharacter(char: DnDCharacter) {
        setCharacter(char)
        setChange(true)
    }

    async function send() {
        const data = {character: character, charID: id}

        if (isMaster) {
            axios.post(process.env.REACT_APP_API_PREFIX + '/api/char', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).catch(() => {
                setIsMaster(false)
                axios.post(process.env.REACT_APP_API_PREFIX + `/api/char/me`, data)
                    .catch(() => {
                    })
            })
        } else {
            axios.post(process.env.REACT_APP_API_PREFIX + `/api/char/me`, data)
                .catch(() => {
                })
        }
    }

    function initUpdate(char: DnDCharacter) {
        setCharacter(char)
    }

    async function recv() {
        if (isMaster) {
            axios.get(process.env.REACT_APP_API_PREFIX + `/api/char/get/${id}`)
                .then((data) => {
                    initUpdate(data.data.character);
                })
                .catch(() => {
                    axios.get(process.env.REACT_APP_API_PREFIX + `/api/char/me/get/${id}`)
                        .then((data) => {
                            initUpdate(data.data.character);
                        })
                        .catch(() => {
                        })
                })
        } else {
            axios.get(process.env.REACT_APP_API_PREFIX + `/api/char/me/get/${id}`)
                .then((data) => {
                    initUpdate(data.data.character);
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
            <TitleService title={character.name || ''}/>
            <div style={{"marginLeft": "auto", "marginRight": "auto", maxWidth: "1200px"}}>
                {statsSheet}
                {profileSheet}
                {spellSheet}
            </div>
        </>
    )
}


export default WithAuth(App)
