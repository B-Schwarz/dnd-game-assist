import React, {useEffect, useState} from "react";
import WithAuth from "../login/withAuth";
import {Divider, Text} from "@chakra-ui/layout";
import InitiaveEntry from "./initiave-entry";
import {StatusEffectsEnum} from "./status-effects.enum";
import {Accordion, Button, Center, Heading, HStack, StackItem, VStack} from "@chakra-ui/react";
import {DnDCharacter} from "dnd-character-sheets";
import {Player} from "./player.type";
import axios from "axios";
import _ from "lodash";

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

    const [player, setPlayer] = useState<Player[]>([])
    const [isMaster, setIsMaster] = useState(false)
    const [updateInterval, setUpdateInterval] = useState<number>(0)
    const [round, setRound] = useState<number>(0)

    function save(p: Player[]) {
        axios.put('http://localhost:4000/api/initiative', {player: p}).catch(() => {
        })
    }

    function create() {
        axios.put('http://localhost:4000/api/initiative', {player: createMasterPlayer()}).catch(() => {
        })
    }

    function nextTurn() {
        const temp = _.cloneDeep(player)
        for (let i = 0; i < temp.length; i++) {
            if (temp[i].isTurn) {
                temp[i].isTurn = false
                const next = (i+1) % temp.length
                temp[next].isTurn = true
                if (next < i) {
                    axios.put('http://localhost:4000/api/initiative/round', {round: round+1})
                        .catch(() => {})
                    setRound(round + 1)
                }
                break
            }
        }
        save(temp)
    }

    function prevTurn() {
        const temp = _.cloneDeep(player)
        for (let i = 0; i < temp.length; i++) {
            if (temp[i].isTurn) {
                temp[i].isTurn = false
                const next = (i+temp.length-1) % temp.length
                temp[next].isTurn = true
                if (next > i) {
                    axios.put('http://localhost:4000/api/initiative/round', {round: round-1})
                        .catch(() => {})
                    setRound(round - 1)
                }
                break
            }
        }
        save(temp)
    }

    function get(master: boolean) {
        if (master) {
            try {
                axios.get('http://localhost:4000/api/initiative/master')
                    .then((r) => {
                        updatePlayer(r.data)
                    }).catch(() => {setIsMaster(false)})
            } catch (_) {
                setIsMaster(false)
            }
        } else {
            axios.get('http://localhost:4000/api/initiative')
                .then((r) => {
                    updatePlayer(r.data)
                })
                .catch(() => {
                })
        }
    }

    function updatePlayer(newPlayer: Player[]) {
        if (player.length === 0) {
            setPlayer(newPlayer)
        } else {
            if (newPlayer.length !== player.length) {
                setPlayer([])
                setPlayer(newPlayer)
            } else {
                for (let i = 0; i < player.length; i++) {
                    if (!_.isEqual(player[i], newPlayer[i])) {
                        setPlayer([])
                        setPlayer(newPlayer)
                        break
                    }
                }
            }
        }
    }

    function sort() {
        axios.get('http://localhost:4000/api/initiative/sort')
            .then(() => {
                get(isMaster)
            }).catch(() => {
        })
    }

    useEffect(() => {
        axios.get('http://localhost:4000/api/me/master')
            .then(() => {
                setIsMaster(true)
                axios.get('http://localhost:4000/api/initiative/round')
                    .then((r) => {
                        setRound(r.data.round)
                    })
                    .catch(() => {})
            })
            .catch(() => {
            })
    }, [])

    useEffect(() => {
        if (updateInterval === 0) {
            setTimeout(() => {
                get(isMaster)
                setUpdateInterval(0)
            }, 350)
            setUpdateInterval(1)
        }

    }, [isMaster, player, updateInterval])

    return (
        <>
            <Center>
                <HStack>
                    {
                        isMaster &&
                        <VStack>
                            <Heading>Master</Heading> {/*JUST FOR DEV*/}
                            <Text fontSize='2xl'>Runde: {round}</Text>
                            <StackItem>
                                <Button colorScheme='teal' onClick={create}>Create</Button> {/*JUST FOR DEV*/}
                                <Button colorScheme='blue' onClick={() => save(player)}>Save</Button> {/*JUST FOR DEV*/}
                                <Button colorScheme='blue' onClick={prevTurn}>Vorheriger</Button>
                                <Button colorScheme='blue' onClick={nextTurn}>Nächster</Button>
                                <Button colorScheme='blue' onClick={sort}>Sort</Button>
                                <Button colorScheme='green'>Add</Button>
                            </StackItem>
                        </VStack>
                    }
                    {
                        !isMaster &&
                        <React.Fragment>
                            <Heading>Player</Heading> {/*JUST FOR DEV*/}
                        </React.Fragment>
                    }
                </HStack>
            </Center>
            <Divider marginBottom='2rem'/>
            <Center>
                <Accordion allowToggle width='80%'>
                    {
                        player.map((m, i) => (
                            <InitiaveEntry p={m} i={i} f={i === 0} l={i === player.length - 1} key={i}/>
                        ))
                    }
                </Accordion>
            </Center>
        </>
    )
}

export default WithAuth(App)
