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
    ModalHeader,
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

enum confirmType {
    RESET,
    SORT
}

const App = () => {

    const [player, setPlayer] = useState<Player[]>([])
    const [isMaster, setIsMaster] = useState(false)
    const [round, setRound] = useState<number>(1)
    const [turnBtnActive, setTurnBtnActive] = useState<boolean>(false)
    const [turn, setTurn] = useState(0)

    const [updatePing, setUpdatePing] = useState(0)
    const updateTimer = useRef(null)

    const [confirm, setConfirm] = useState<confirmType>()

    const {isOpen, onOpen, onClose} = useDisclosure()
    const {isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose} = useDisclosure()

    function save(p: Player[]) {
        axios.put(process.env.REACT_APP_API_PREFIX + '/api/initiative', {player: p})
            .then(() => update())
            .catch(() => {
            })
    }

    function nextTurn() {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative/turn/next')
            .then(() => update())
            .catch(() => {
            })
    }

    function prevTurn() {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative/turn/prev')
            .then(() => update())
            .catch(() => {
            })
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
                        updatePlayer(r.data.player)
                        setTurn(r.data.turn)
                    }).catch(() => {
                    setIsMaster(false)
                })
            } catch (_) {
                setIsMaster(false)
            }
        } else {
            axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative')
                .then((r) => {
                    updatePlayer(r.data.player)
                    setTurn(r.data.turn)
                })
                .catch(() => {
                })
        }

        axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative/round')
            .then((r) => {
                setRound(r.data.round)
            })
            .catch(() => {
            })
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
        axios.put(process.env.REACT_APP_API_PREFIX + '/api/initiative/round', {round: 1})
            .catch(() => {
            })
        setRound(1)
    }

    const update = () => {
        get(isMaster)
    }

    useEffect(() => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/me/master')
            .then(() => {
                setIsMaster(true)
                get(true)
            })
            .catch(() => {
            })

        axios.get(process.env.REACT_APP_API_PREFIX + '/api/initiative/round')
            .then((r) => {
                setRound(r.data.round)
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
                <VStack>
                    <Text fontSize='2xl'>Runde: {round}</Text>
                    { isMaster &&
                        <StackItem>
                            <Grid templateColumns='repeat(4, 1fr)' gap={3}>
                                <Button colorScheme='red' onClick={() => {
                                    setConfirm(confirmType.RESET)
                                    onConfirmOpen()
                                }}>Board Löschen</Button>
                                <Button colorScheme='blue' onClick={() => {
                                    setConfirm(confirmType.SORT)
                                    onConfirmOpen()
                                }}>Sortieren</Button>
                                <GridItem>
                                    <Button colorScheme='blue' onClick={prevTurn} isDisabled={turnBtnActive}>Vorheriger</Button>
                                    <Button colorScheme='blue' onClick={nextTurn} isDisabled={turnBtnActive}>Nächster</Button>
                                </GridItem>
                                <Button colorScheme='green' onClick={onOpen}>Hinzufügen</Button>
                            </Grid>
                        </StackItem>
                    }
                    <Divider marginTop='1rem'/>
                </VStack>
            <Center marginTop='2rem'>
                <Accordion allowToggle width='80%'>
                    {
                        player.map((m, i) => (
                            <InitiaveEntry player={m} statusEffects={m.statusEffects} index={i} first={i === 0} last={i === player.length - 1} isMaster={isMaster} isTurn={i === turn} update={update} key={i}/>
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
            <Modal isOpen={isConfirmOpen} onClose={() => {
                onConfirmClose()
            }} closeOnEsc isCentered>
                <ModalOverlay/>
                <ModalContent maxW='35rem' maxH='40rem'>
                    <ModalHeader textAlign='center'>
                        Bist Du sicher?
                    </ModalHeader>
                    <ModalFooter m='auto'>
                            {
                                confirm === confirmType.SORT && <Button onClick={() => {
                                    sort()
                                    onConfirmClose()
                                }} marginRight='1rem' colorScheme='blue'>
                                    Sortieren
                                </Button>
                            }
                            {
                                confirm === confirmType.RESET && <Button onClick={() => {
                                    reset()
                                    onConfirmClose()
                                }} marginRight='1rem' colorScheme='red'>
                                    Board Löschen
                                </Button>
                            }
                            <Button onClick={() => {
                                onConfirmClose()
                            }}>Schließen</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default WithAuth(App)
