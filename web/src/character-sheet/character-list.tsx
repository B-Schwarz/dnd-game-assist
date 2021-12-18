import React, {useEffect, useState} from 'react'

import axios from "axios";
import {Button, Center, Heading} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";
import {Divider} from "@chakra-ui/layout";

const App = () => {

    const [ownCharData, setOwnCharData] = useState([])
    const [charData, setCharData] = useState([])
    const navigate = useNavigate()

    function getOwnChars() {
        return axios.get('http://localhost:4000/api/charlist/me')
    }

    function getChars() {
        return axios.get('http://localhost:4000/api/charlist')
    }

    useEffect(() => {
        getOwnChars()
            .then(r => {
                setOwnCharData([])
                for (let char of r.data) {
                    // @ts-ignore
                    setOwnCharData(ownCharData => [...ownCharData, char])
                }
            })
            .catch(() => {
            })
    }, [])

    useEffect(() => {
        getChars()
            .then(r => {
                setCharData([])
                for (let char of r.data) {
                    if (ownCharData.filter(c => c['_id'] === char['_id']).length === 0) {
                        // @ts-ignore
                        setCharData(charData => [...charData, char])
                    }
                }
            })
            .catch(() => {})
    }, [ownCharData])

    function openCharacter(id: string) {
        navigate("/character/"+id)
    }

    return (
        <>
            <Center marginBottom={'1rem'}>
                <Heading>
                    Eigene Charactere
                </Heading>
            </Center>
            {
                ownCharData.map((item) => (
                    <Center key={item['_id']}>
                        <Button borderWidth='1px' borderRadius='lg' marginBlock={'0.25rem'}
                                width={"90%"} onClick={() => openCharacter(item['_id'])}>
                            Name: {item['character']['name'] || 'N/A'},
                            Klasse: {item['character']['classLevel'] || 'N/A'},
                            Rasse: {item['character']['race'] || 'N/A'},
                            Player: {item['character']['playerName'] || 'N/A'}
                        </Button>
                    </Center>
                ))
            }
            {charData.length > 0 &&
                <>
                    <Divider marginTop={'0.5rem'} marginBottom={'0.5rem'} />
                    <Center marginBottom={'1rem'}>
                        <Heading>
                            Alle Charactere
                        </Heading>
                    </Center>
                    {
                        charData.map((item) => (
                            <Center key={item['_id']}>
                                <Button borderWidth='1px' borderRadius='lg' marginBlock={'0.25rem'}
                                        width={"90%"} onClick={() => openCharacter(item['_id'])}>
                                    Name: {item['character']['name'] || 'N/A'},
                                    Klasse: {item['character']['classLevel'] || 'N/A'},
                                    Rasse: {item['character']['race'] || 'N/A'},
                                    Player: {item['character']['playerName'] || 'N/A'}
                                </Button>
                            </Center>
                        ))
                    }
                </>
            }
        </>
    )
}

export default App
