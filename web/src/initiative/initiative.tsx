import React, {useEffect, useState} from "react";
import WithAuth from "../login/withAuth";
import {Divider} from "@chakra-ui/layout";
import InitiaveEntry from "./initiave-entry";
import {StatusEffectsEnum} from "./status-effects.enum";
import {Accordion, Button, Center, Heading, HStack} from "@chakra-ui/react";
import {DnDCharacter} from "dnd-character-sheets";
import {Player} from "./player.type";
import character from "../character-sheet/character";
import axios from "axios";

const App = () => {

    const tempChar = new DnDCharacter()
    tempChar.name = 'Craigman'
    tempChar.ac = '16'
    tempChar.hp = '30'
    tempChar.maxHp = '30'
    tempChar.tempHp = '3'
    tempChar.deathsaveSuccesses = 0
    tempChar.deathsaveFailures = 0

    const tempCharTwo = new DnDCharacter()
    tempCharTwo.name = 'Jeremy'
    tempCharTwo.ac = '14'
    tempCharTwo.hp = '21'
    tempCharTwo.maxHp = '32'
    tempCharTwo.deathsaveSuccesses = 0
    tempCharTwo.deathsaveFailures = 0

    const tempCharThree = new DnDCharacter()
    tempCharThree.name = 'Sneaky Assasin'
    tempCharThree.ac = '15'
    tempCharThree.hp = '30'
    tempCharThree.maxHp = '30'
    tempCharThree.deathsaveSuccesses = 0
    tempCharThree.deathsaveFailures = 0

    const tempCharFour = new DnDCharacter()
    tempCharFour.name = 'Dummy'
    tempCharFour.ac = '15'
    tempCharFour.hp = '15'
    tempCharFour.maxHp = '30'
    tempCharFour.deathsaveSuccesses = 0
    tempCharFour.deathsaveFailures = 0

    function createMasterPlayer() {
        const p1: Player = {
            hidden: false, initiative: 13, isMaster: true, npc: false, statusEffects: [],
            character: tempChar, isTurn: false, turn: 0, isTurnSet: false
        }

        const p2: Player = {
            character: tempCharTwo, initiative: 11, isMaster: true, statusEffects: [StatusEffectsEnum.DOWNED],
            isTurn: false, turn: 0, isTurnSet: false
        }

        const p3: Player = {
            character: tempCharThree,
            initiative: 10,
            isMaster: true,
            statusEffects: [StatusEffectsEnum.POISONED, StatusEffectsEnum.BLIND],
            hidden: true,
            isTurn: true,
            turn: 0,
            isTurnSet: false
        }
        const p4: Player = {
            character: tempCharFour,
            initiative: 11,
            isMaster: true,
            statusEffects: [StatusEffectsEnum.POISONED, StatusEffectsEnum.BLIND],
            hidden: false,
            isTurn: false,
            turn: 0,
            isTurnSet: false,
            npc: true
        }

        return [p1, p2, p3, p4]
    }

    function createPlayerPlayer(mp: Player[]) {
        const p1p: Player = {...mp[0]}
        p1p.isMaster = false

        const p2p: Player = {...mp[1]}
        p2p.isMaster = false

        const p3p: Player = {...mp[2]}
        p3p.isMaster = false

        const p4p: Player = {...mp[3]}
        p4p.isMaster = false

        return [p1p, p2p, p3p, p4p]
    }

    const [player, setPlayer] = useState([])
    const [isMaster, setIsMaster] = useState(true)

    function save() {
        axios.put('http://localhost:4000/api/initiative', {player: player}, {
            withCredentials: true
        }).catch(() => {
        })
    }

    function create() {
        axios.put('http://localhost:4000/api/initiative', {player: createMasterPlayer()}, {
            withCredentials: true
        }).catch(() => {
        })
    }

    function get() {
        if (isMaster) {
            axios.get('http://localhost:4000/api/initiative/master', {withCredentials: true})
                .then((r) => {
                    setPlayer([])
                    setPlayer(r.data)
                })
                .catch(() => {
                    setIsMaster(false)
                    axios.get('http://localhost:4000/api/initiative', {withCredentials: true})
                        .then((r) => {
                            setPlayer([])
                            setPlayer(r.data)
                        })
                        .catch(() => {
                        })
                })
        } else {
            axios.get('http://localhost:4000/api/initiative', {withCredentials: true})
                .then((r) => {
                    setPlayer([])
                    setPlayer(r.data)
                })
                .catch(() => {
                })
        }
    }

    function sort() {
        axios.get('http://localhost:4000/api/initiative/sort', {withCredentials: true})
            .then(() => {
                get()
            }).catch(() => {
        })
    }

    useEffect(() => {
        get()
    }, [])

    return (
        <>
            <Center>
                <HStack>
                    {
                        isMaster &&
                        <>
                            <Heading>Master</Heading>
                            <Button colorScheme='teal' onClick={create}>Create</Button>
                            <Button colorScheme='blue' onClick={save}>Save</Button>
                            <Button colorScheme='blue' onClick={get}>Reload</Button>
                            <Button colorScheme='blue' onClick={sort}>Sort</Button>
                            <Button colorScheme='green'>Add</Button>
                        </>
                    }
                    {
                        !isMaster &&
                        <>
                            <Heading>Player</Heading>
                            <Button colorScheme='blue' onClick={get}>Reload</Button>
                        </>
                    }
                </HStack>
            </Center>
            <Divider marginBottom='2rem'/>
            <Center>
                <Accordion allowToggle width='80%'>
                    {
                        player.map((m, i) => (
                            <InitiaveEntry p={m} f={i === 0} l={i === player.length-1} key={i}/>
                        ))
                    }
                </Accordion>
            </Center>
        </>
    )
}

export default WithAuth(App)
