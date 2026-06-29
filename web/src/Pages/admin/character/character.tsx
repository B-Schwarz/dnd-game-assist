import React, {useEffect, useState} from "react";
import {
    Button,
    Center,
    GridItem,
    HStack,
    Select,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useToast,
    VStack
} from "@chakra-ui/react";
import {Divider} from "@chakra-ui/layout";
import axios from "axios";
import {User} from "../user.type";

interface ExportedCharacter {
    _id: string,
    character: { name?: string },
    npc: boolean,
    owner: { userID: string, name: string } | null
}

const App = () => {

    const [chars, setChars] = useState<ExportedCharacter[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [assignSel, setAssignSel] = useState<{ [id: string]: string }>({})

    const toast = useToast()

    const prefix = process.env.REACT_APP_API_PREFIX

    const getChars = () => {
        axios.get(prefix + '/api/char/export')
            .then((r) => setChars(r.data))
            .catch(() => {
            })
    }

    const getUsers = () => {
        axios.get(prefix + '/api/user')
            .then((r) => setUsers(r.data))
            .catch(() => {
            })
    }

    useEffect(() => {
        getChars()
        getUsers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const exportAll = () => {
        axios.get(prefix + '/api/char/export')
            .then((r) => {
                const blob = new Blob([JSON.stringify(r.data, null, 2)], {type: 'application/json'})
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `characters-${new Date().toISOString().slice(0, 10)}.json`
                a.click()
                URL.revokeObjectURL(url)
            })
            .catch(() => {
                toast({title: 'Export fehlgeschlagen', status: 'error', duration: 3000, isClosable: true})
            })
    }

    const reassign = (charID: string) => {
        const toUserID = assignSel[charID]
        if (!toUserID) {
            return
        }
        axios.put(prefix + '/api/char/reassign', {charID, toUserID})
            .then(() => {
                toast({title: 'Charakter zugewiesen', status: 'success', duration: 2500, isClosable: true})
                getChars()
            })
            .catch(() => {
                toast({title: 'Fehler', description: 'Konnte nicht zugewiesen werden.', status: 'error', duration: 3000, isClosable: true})
            })
    }

    return (
        <GridItem rowSpan={5} colSpan={4}>
            <VStack align='stretch' w='95%' marginX='auto' spacing='1rem'>
                <HStack justifyContent='space-between'>
                    <Text fontSize='lg' fontWeight='bold'>CHARAKTERE</Text>
                    <Button colorScheme='blue' onClick={exportAll}>Alle exportieren</Button>
                </HStack>
                <Divider/>
                <Center>
                    <Table size='sm' w='100%'>
                        <Thead>
                            <Tr>
                                <Th>Name</Th>
                                <Th>Typ</Th>
                                <Th>Besitzer</Th>
                                <Th>Neuer Besitzer</Th>
                                <Th></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {
                                chars.map((c) => (
                                    <Tr key={c._id}>
                                        <Td>{c.character?.name || '(ohne Name)'}</Td>
                                        <Td>{c.npc ? 'NPC' : 'PC'}</Td>
                                        <Td>{c.owner ? c.owner.name : '—'}</Td>
                                        <Td>
                                            <Select size='sm' placeholder='Benutzer wählen'
                                                    value={assignSel[c._id] || ''}
                                                    onChange={(e) => {
                                                        const v = e.currentTarget.value
                                                        setAssignSel((prev) => ({...prev, [c._id]: v}))
                                                    }}>
                                                {users.map((u) => (
                                                    <option key={u._id} value={u._id}>{u.name}</option>
                                                ))}
                                            </Select>
                                        </Td>
                                        <Td>
                                            <Button size='sm' isDisabled={!assignSel[c._id]}
                                                    onClick={() => reassign(c._id)}>Zuweisen</Button>
                                        </Td>
                                    </Tr>
                                ))
                            }
                        </Tbody>
                    </Table>
                </Center>
            </VStack>
        </GridItem>
    )
}

export default App
