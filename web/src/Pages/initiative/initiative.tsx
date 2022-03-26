import React, {useEffect, useRef, useState} from "react";
import WithAuth from "../login/withAuth";
import {Divider, Text} from "@chakra-ui/layout";
import InitiaveEntry from "./initiave-entry";
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
import TitleService from "../../Service/titleService";
import {ColorMarkerEnum} from "./color-marker.enum";

const App = () => {

    const [player, setPlayer] = useState<Player[]>([])
    const [isMaster, setIsMaster] = useState(false)
    const [round, setRound] = useState<number>(0)

    const [updatePing, setUpdatePing] = useState(0)
    const updateTimer = useRef(null)

    const {isOpen, onOpen, onClose} = useDisclosure()

    function save(p: Player[]) {
        axios.put(process.env.REACT_APP_API_PREFIX + '/api/initiative', {player: p})
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
                    axios.put(process.env.REACT_APP_API_PREFIX + '/api/initiative/round', {round: round + 1})
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
                    axios.put(process.env.REACT_APP_API_PREFIX + '/api/initiative/round', {round: round - 1})
                        .catch(() => {
                        })
                    setRound(round - 1)
                }
                break
            }
        }
        save(temp)
    }

    const updatePlayer = (newPlayer: Player[]) => {
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

    const get = (master: boolean) => {
        if (master) {
            try {
                axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative/master')
                    .then((r) => {
                        updatePlayer(r.data)
                    }).catch(() => {
                    setIsMaster(false)
                })
            } catch (_) {
                setIsMaster(false)
            }
        } else {
            axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative')
                .then((r) => {
                    updatePlayer(r.data)
                })
                .catch(() => {
                })
        }
    }

    function sort() {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative/sort')
            .then(() => {
                update()
            }).catch(() => {
        })
    }

    function reset() {
        axios.delete(process.env.REACT_APP_API_PREFIX + '/api/initiative/player')
            .then(() => update())
            .catch(() => {
            })
        axios.put(process.env.REACT_APP_API_PREFIX + '/api/initiative/round', {round: 0})
            .catch(() => {
            })
        setRound(0)
    }

    const update = () => {
        get(isMaster)
    }

    useEffect(() => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/me/master')
            .then(() => {
                setIsMaster(true)
                axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative/round')
                    .then((r) => {
                        setRound(r.data.round)
                    })
                    .catch(() => {
                    })
                get(true)
            })
            .catch(() => {
            })

        // @ts-ignore
        return () => clearTimeout(updateTimer.current)
    }, [])

    useEffect(() => {
        // @ts-ignore
        updateTimer.current = setTimeout(() => {
            if (!isMaster) {
                setUpdatePing((updatePing) => updatePing + 1)
            }
        }, 350)

        update()
    }, [isMaster, updatePing])

    return (
        <>
            <TitleService title={'Initiative'}/>
            {
                isMaster &&
                <VStack>
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

                    <Divider marginTop='1rem'/>
                </VStack>
            }
            <Center marginTop='2rem'>
                <Accordion allowToggle width='80%'>
                    {
                        player.map((m, i) => (
                            <InitiaveEntry p={m} i={i} f={i === 0} l={i === player.length - 1} u={update} key={i}/>
                        ))
                    }
                </Accordion>
            </Center>
            <Modal isOpen={isOpen} onClose={() => {
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
