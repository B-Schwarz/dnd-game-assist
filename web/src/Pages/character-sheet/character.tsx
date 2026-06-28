import React, {useEffect, useState} from 'react'

import {DnDCharacter} from "./sheet/dnd-character";
import CharacterSheet from "./sheet/CharacterSheet";

import axios from "axios";
import {useParams} from "react-router-dom";
import WithAuth from "../login/withAuth";
import TitleService from "../../Service/titleService";

const App = () => {
    const id = useParams().id

    const [isMaster, setIsMaster] = useState(true)
    const [character, setCharacter] = useState<DnDCharacter>(loadDefaultCharacter())
    const [change, setChange] = useState(false)

    function loadDefaultCharacter() {
        let character: DnDCharacter = {}
        return character
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (change) {
            send().then(() => {
                setChange(false)
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [change, isMaster])


    return (
        <>
            <TitleService title={character.name || ''}/>
            <div style={{"marginLeft": "auto", "marginRight": "auto", maxWidth: "1200px"}}>
                <CharacterSheet character={character} onCharacterChanged={updateCharacter}/>
            </div>
        </>
    )
}


export default WithAuth(App)
