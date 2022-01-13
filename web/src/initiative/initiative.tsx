import React, {useEffect, useState} from "react";
import WithAuth from "../login/withAuth";
import {Divider, Text} from "@chakra-ui/layout";
import InitiaveEntry from "./initiave-entry";
import {StatusEffectsEnum} from "./status-effects.enum";
import {
    Accordion,
    Button,
    Center,
    Grid,
    GridItem,
    Modal,
    ModalContent,
    ModalFooter,
    ModalOverlay,
    StackItem,
    useDisclosure,
    VStack
} from "@chakra-ui/react";
import {Player} from "./player.type";
import axios from "axios";
import _ from "lodash";
import Add from "./add/add";

const App = () => {

    async function createMasterPlayer() {
        const p1 = await axios.get('http://localhost:4000/api/char/get/61bde2e1d908d9469fee4030')
            .then((c) => {
                return {
                    hidden: false, initiative: 20, isMaster: true, npc: false, statusEffects: [],
                    character: c.data.character, isTurn: false, turn: 0, isTurnSet: false, id: c.data._id
                }
            })

        const p2 = await axios.get('http://localhost:4000/api/char/get/61c866303282743779bba3d0')
            .then((c) => {
                return {
                    character: c.data.character,
                    initiative: 12,
                    isMaster: true,
                    statusEffects: [StatusEffectsEnum.PRONE],
                    isTurn: false,
                    turn: 0,
                    isTurnSet: false,
                    id: c.data._id
                }
            })

        const p3 = await axios.get('http://localhost:4000/api/char/get/61c866343282743779bba421')
            .then((c) => {
                return {
                    character: c.data.character,
                    initiative: 11,
                    isMaster: true,
                    statusEffects: [StatusEffectsEnum.POISONED, StatusEffectsEnum.BLIND],
                    isTurn: true,
                    turn: 0,
                    isTurnSet: false,
                    id: c.data._id
                }
            })

        return [p1, p2, p3]
    }

    const [player, setPlayer] = useState<Player[]>([])
    const [isMaster, setIsMaster] = useState(false)
    const [updateInterval, setUpdateInterval] = useState<number>(0)
    const [round, setRound] = useState<number>(0)

    const {isOpen, onOpen, onClose} = useDisclosure()

    function save(p: Player[]) {
        axios.put('http://localhost:4000/api/initiative', {player: p})
            .then(() => update())
            .catch(() => {
            })
    }

    // TODO: DEV
    async function create() {
        const p = await createMasterPlayer()
        axios.put('http://localhost:4000/api/initiative', {player: p})
            .then(() => update())
            .catch(() => {
            })
    }

    function nextTurn() {
        const temp = _.cloneDeep(player)
        let done = false
        for (let i = 0; i < temp.length; i++) {
            if (temp[i].isTurn) {
                temp[i].isTurn = false
                const next = (i + 1) % temp.length
                temp[next].isTurn = true
                if (next < i) {
                    axios.put('http://localhost:4000/api/initiative/round', {round: round + 1})
                        .catch(() => {
                        })
                    setRound(round + 1)
                }
                done = true
                break
            }
        }
        if (!done && temp.length > 0) {
            temp[0].isTurn = true
        }
        save(temp)
    }

    function prevTurn() {
        const temp = _.cloneDeep(player)
        for (let i = 0; i < temp.length; i++) {
            if (temp[i].isTurn) {
                temp[i].isTurn = false
                const next = (i + temp.length - 1) % temp.length
                temp[next].isTurn = true
                if (next > i) {
                    axios.put('http://localhost:4000/api/initiative/round', {round: round - 1})
                        .catch(() => {
                        })
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
                    }).catch(() => {
                    setIsMaster(false)
                })
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
                update()
            }).catch(() => {
        })
    }

    function reset() {
        axios.delete('http://localhost:4000/api/initiative/player')
            .then(() => update())
            .catch(() => {
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
                    .catch(() => {
                    })
            })
            .catch(() => {
            })
    }, [])

    useEffect(() => {
        if (updateInterval === 0) {
            let i = 350
            window.setTimeout(() => {
                get(isMaster)
                setUpdateInterval(0)
            }, i)
            if (!isMaster) {
                setUpdateInterval(1)
            }

        }
    }, [isMaster, updateInterval])

    const update = () => {
        get(isMaster)
    }

    return (
        <>
            {
                isMaster &&
                <VStack>
                    <Button colorScheme='teal' onClick={create}>Create</Button> {/*JUST FOR DEV*/}
                    <Text fontSize='2xl'>Runde: {round}</Text>
                    <StackItem>
                        <Grid templateColumns='repeat(4, 1fr)' gap={3}>
                            <Button colorScheme='red' onClick={reset}>RESET</Button>
                            <Button colorScheme='blue' onClick={sort}>Sort</Button>
                            <GridItem>
                                <Button colorScheme='blue' onClick={prevTurn}>Vorheriger</Button>
                                <Button colorScheme='blue' onClick={nextTurn}>Nächster</Button>
                            </GridItem>
                            <Button colorScheme='green' onClick={onOpen}>Add</Button>
                        </Grid>
                    </StackItem>
                </VStack>
            }
            <Divider marginTop='1rem' marginBottom='2rem'/>
            <Center>
                <Accordion allowToggle width='80%'>
                    {
                        player.map((m, i) => (
                            <InitiaveEntry p={m} i={i} f={i === 0} l={i === player.length - 1} u={update} key={i}/>
                        ))
                    }
                </Accordion>
            </Center>
            <Modal isOpen={isOpen} onClose={() => {
                update()
                onClose()
            }} closeOnEsc isCentered
                   scrollBehavior='inside'>
                <ModalOverlay/>
                <ModalContent maxW='35rem' maxH='40rem'>
                    <Add u={update}/>
                    <ModalFooter>
                        <Button onClick={() => {
                            update()
                            onClose()
                        }}>Schließen</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default WithAuth(App)
