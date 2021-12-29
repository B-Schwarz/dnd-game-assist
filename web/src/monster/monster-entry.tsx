import React, {useEffect, useState} from "react";
import {Monster} from "./monster.type";
import {
    AccordionButton,
    AccordionItem,
    AccordionPanel,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Flex,
    Grid,
    GridItem,
    HStack,
    IconButton,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Stack, StackItem,
    Table,
    Tbody,
    Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tr, useToast
} from "@chakra-ui/react"
import _ from "lodash";
import {DeleteIcon, EditIcon} from "@chakra-ui/icons";
import {IoSaveSharp} from "react-icons/io5";
import axios from "axios";


// m: Monster of the card
// u: Update function to reload
// e: If the user is permitted to edit
const App = (props: { m: Monster, u: () => void, e: boolean }) => {

    const [monster, setMonster] = useState<Monster>(props.m)
    const [entry, setEntry] = useState<{ stat: string, nr: number, mod: number, save: number }[]>([])
    const [edit, setEdit] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [watched, setWatched] = useState(false)

    const cancelRef = React.useRef()
    const toast = useToast()

    useEffect(() => {
        calcEntries()
    }, [monster])

    const closePopup = () => setIsOpen(false)

    const calcEntries = () => {
        const temp = []
        for (const key of Object.keys(monster.monster.stats)) {
            temp.push({
                stat: key.toUpperCase(),
                // @ts-ignore
                nr: monster.monster.stats[key],
                // @ts-ignore
                mod: Math.floor((monster.monster.stats[key] - 10) / 2),
                // @ts-ignore
                save: monster.monster.saving[key]
            })
        }
        setEntry(temp)
    }

    const updateEntryStat = (key: number, val: number) => {
        const temp = _.cloneDeep(entry)
        const tempMon = _.cloneDeep(monster)

        // @ts-ignore
        tempMon.monster.stats[temp[key].stat.toLowerCase()] = val

        temp[key].nr = val
        // @ts-ignore
        temp[key].mod = Math.floor((val - 10) / 2)

        setEntry(temp)
        setMonster(tempMon)
    }

    const updateEntrySave = (key: number, val: number) => {
        const temp = _.cloneDeep(entry)
        const tempMon = _.cloneDeep(monster)

        // @ts-ignore
        tempMon.monster.saving[temp[key].stat.toLowerCase()] = val
        temp[key].save = val

        setEntry(temp)
        setMonster(tempMon)
    }

    const updateMonster = (key: string, val: string) => {
        const tempMon = _.cloneDeep(monster)

        // @ts-ignore
        tempMon.monster[key] = val

        setMonster(tempMon)
    }

    const editValue = (key: string, big: boolean) => {
        if (edit) {
            if (big) {
                return (
                    // @ts-ignore
                    <Input defaultValue={monster.monster[key]}
                           onChange={(evt) => updateMonster(key, evt.currentTarget.value)}/>
                )
            } else {
                return (
                    // @ts-ignore
                    <Textarea defaultValue={monster.monster[key]}
                              onChange={(evt) => updateMonster(key, evt.currentTarget.value)}/>
                )
            }
        } else {
            return (
                // @ts-ignore
                monster.monster[key].split('\n').map((l, i) => (
                    <React.Fragment key={i}>
                        {!big && replaceBold(l)}
                        {big && l}
                        <br/>
                    </React.Fragment>
                ))
            )
        }
    }

    const replaceBold = (line: string) => {
        if (line.indexOf('{') >= 0) {
            const start = line.indexOf('{')
            const end = line.indexOf('}')

            if (start >= 0 && end > 0) {
                const begin = line.substring(0, start - 1)
                const bold = line.substring(start + 1, end)
                const rest = replaceBold(line.substring(end + 1))

                if (begin.length > 0) {
                    return (
                        <React.Fragment>
                            {begin}<span style={{fontWeight: "bold"}}>&nbsp;{bold}</span>{rest}
                        </React.Fragment>
                    )
                } else {
                    return (
                        <React.Fragment>
                            <span style={{fontWeight: "bold"}}>{bold}</span>{rest}
                        </React.Fragment>
                    )
                }
            } else {
                return line
            }
        } else {
            return line
        }
    }

    const skillNum = (def: number, key: number) => {
        return (
            <NumberInput defaultValue={def} min={0} max={20} onChange={(val) => {
                updateEntryStat(key, Number(val))
            }}>
                <NumberInputField/>
                <NumberInputStepper>
                    <NumberIncrementStepper/>
                    <NumberDecrementStepper/>
                </NumberInputStepper>
            </NumberInput>
        )
    }

    const saveNum = (def: number, key: number) => {
        return (
            <NumberInput defaultValue={def} min={-10} max={10} onChange={(val) => {
                updateEntrySave(key, Number(val))
            }}>
                <NumberInputField/>
                <NumberInputStepper>
                    <NumberIncrementStepper/>
                    <NumberDecrementStepper/>
                </NumberInputStepper>
            </NumberInput>
        )
    }

    const createEntries = () => {
        if (edit) {
            return (
                entry.map((e, i) => (
                    <Tr key={i}>
                        <Td>{e.stat}</Td>
                        <Td>{skillNum(e.nr, i)}</Td>
                        <Td>{e.mod}</Td>
                        <Td>{saveNum(e.save, i)}</Td>
                    </Tr>
                ))
            )
        } else {
            return (
                entry.map((e, i) => (
                    <Tr key={i}>
                        <Td>{e.stat}</Td>
                        <Td>{e.nr}</Td>
                        <Td>{e.mod}</Td>
                        <Td>{e.save}</Td>
                    </Tr>
                ))
            )
        }
    }

    const save = () => {
        axios.put('/api/monster', {
            charID: monster._id,
            monster: monster.monster
        })
            .then(() => {
                toast({
                    description: monster.monster.name + ' wurde gespeichert!',
                    status: 'success',
                    duration: 3000,
                    isClosable: true
                })
            })
            .catch(() => {
        })
        setEdit(false)
    }

    const deleteMonster = () => {
        axios.delete(`/api/monster/${monster._id}`)
            .then(() => props.u())
            .catch(() => {
            })
    }

    const divide = () => {
        return (
            <hr color="#c1040e"/>
        )
    }

    const createAttr = (title: string, key: string, big: boolean = false) => {
        // @ts-ignore
        if (!edit && monster.monster[key] === "") {
            return (<></>)
        } else {
            return (
                <Stack direction={edit ? 'column' : 'row'} w='100%'><Text fontWeight='bold'>{title}:</Text>
                    <StackItem>{editValue(key, !big)}</StackItem></Stack>
            )
        }
    }

    return (
        <React.Fragment>
            <AccordionItem borderWidth='1px' borderRadius='md' width='100%' bg='#fafafa' marginBottom='0.5rem'
                           padding='0.4rem 0.75rem' borderColor='blackAlpha.200'>
                <h2>
                    <AccordionButton onClick={() => setWatched(true)}>
                        <Stack>
                            <Text fontSize='xl' textAlign='left'>{monster.monster.name}</Text>
                            <Text fontSize='xs' fontStyle='italic'>{monster.monster.monsterType}</Text>
                        </Stack>
                    </AccordionButton>
                </h2>
                <AccordionPanel>
                    {edit && createAttr('Name', 'name')}
                    {edit && createAttr('Typ', 'monsterType')}
                    <Flex marginTop='1rem'/>
                    {divide()}
                    <Grid templateColumns='repeat(4, 1fr) 2rem' gap={3} marginTop='1rem' marginBottom='1rem'>
                        <GridItem>
                            {createAttr('Rüstung', 'ac')}
                            {createAttr('Leben', 'hp')}
                            {createAttr('Geschwindigkeit', 'speed')}
                        </GridItem>
                        <GridItem colSpan={3}>
                            <Table size='sm'>
                                <Thead>
                                    <Tr>
                                        <Th>Attribut</Th>
                                        <Th>Wert</Th>
                                        <Th>Modifier</Th>
                                        <Th>Save</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {createEntries()}
                                </Tbody>
                            </Table>
                        </GridItem>
                        {props.e &&
                            <GridItem>
                                <IconButton aria-label={'edit'} icon={<EditIcon/>} onClick={() => setEdit(!edit)}/>
                                <IconButton aria-label={'save'} icon={<IoSaveSharp/>} onClick={save}
                                            marginTop='0.5rem'/>
                                <IconButton aria-label={'delete'} colorScheme='red' icon={<DeleteIcon/>}
                                            onClick={() => setIsOpen(true)} marginTop='0.5rem'/>
                            </GridItem>
                        }
                    </Grid>
                    {divide()}
                    <Flex marginTop='1rem'/>
                    {createAttr('Skills', 'skills')}
                    {createAttr('Anfälligkeiten', 'dmgVulnerability')}
                    {createAttr('Resistenzen', 'dmgResistance')}
                    {createAttr('Immunitäten', 'dmgImmunity')}
                    {createAttr('Status Immunitäten', 'condImmunity')}
                    {createAttr('Sinne', 'senses')}
                    {createAttr('Sprachen', 'languages')}
                    {createAttr('Challenge', 'cr')}
                    <Flex marginTop='1rem'/>
                    {divide()}
                    <Flex marginTop='1rem'/>
                    {watched && createAttr('Attribute', 'attributes', true)}
                    {watched && createAttr('Aktionen', 'actions', true)}
                    {watched && createAttr('Legendäre Aktionen', 'legendaryActions', true)}
                </AccordionPanel>
            </AccordionItem>

            <AlertDialog isOpen={isOpen} onClose={closePopup} leastDestructiveRef={cancelRef.current}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            Monster Löschen?
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Bist du sicher, das du den "{monster.monster.name}" löschen willst?
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef.current} onClick={closePopup}>
                                Abbrechen
                            </Button>
                            <Button colorScheme='red' onClick={() => {
                                deleteMonster()
                                closePopup()
                            }} ml={3}>
                                Löschen
                            </Button>
                        </AlertDialogFooter>

                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </React.Fragment>
    )

}

export default App
