import React, {useEffect, useState} from "react";
import {Button, Center, Input, Switch, Table, Tbody, Td, Text, Th, Thead, Tr} from "@chakra-ui/react"
import {AddIcon} from "@chakra-ui/icons";
import _ from "lodash";
import {Player} from "../player.type";
import axios from "axios";
import {DnDCharacter} from "dnd-character-sheets";

const App = (props: {u: () => void}) => {

    const [data, setData] = useState<Player[]>([])
    const [values, setValue] = useState<Player[]>([])

    const search = (val: string) => {
        const temp = _.cloneDeep(data)
        // @ts-ignore
        setValue(_.cloneDeep(temp.filter(d => d.character.name.toLowerCase().includes(val.toLowerCase()))))
    }

    const getPlayer = () => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/charlist/npc')
            .then((d) => {
                setValue([])
                let npcs: Player[] = []
                d.data.forEach((c: {
                    character: DnDCharacter;
                    _id: string;
                    npc: boolean;
                }) => {
                    if (c.npc) {
                        npcs.push({
                            character: c.character,
                            id: c._id,
                            initiative: 0,
                            isMaster: false,
                            isTurnSet: false,
                            statusEffects: [],
                            turnId: 0,
                            hidden: false,
                            npc: true
                        })
                    }
                })
                setValue(npcs)
            })
            .catch(() => {
            })
    }

    const onAdd = (p: Player) => {
        const roll = Math.floor(Math.random() * 20)
        const dexMod = Math.floor((Number(p.character.dex) - 10) / 2) || 0
        p.initiative = dexMod + roll

        axios.post(process.env.REACT_APP_API_PREFIX + '/api/initiative/player', {player: p})
            .then(() => props.u())
            .catch(() => {
            })
    }

    const onHide = (p: Player, val: boolean) => {
        p.hidden = val
    }

    useEffect(() => {
        if (data.length === 0) {
            getPlayer()
        }
    }, [data])

    return (
        <React.Fragment>
            <Input placeholder='Suchen...' onChange={(val) => search(val.currentTarget.value)}/>
            <Table marginTop='1rem'>
                <Thead>
                    <Tr>
                        <Th>Charactername</Th>
                        <Th>Versteckt</Th>
                        <Th>Hinzufügen</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {
                        values.map((item, index) => (
                            <Tr key={index}>
                                <Td><Text isTruncated maxW='11rem'>{item.character.name}</Text></Td>
                                <Td><Switch onChange={(evt) => onHide(item, evt.currentTarget.checked)}/></Td>
                                <Td>
                                    <Center>
                                        <Button colorScheme='green'
                                                onClick={() => onAdd(item)}><AddIcon/></Button>
                                    </Center>
                                </Td>
                            </Tr>
                        ))
                    }
                </Tbody>
            </Table>
        </React.Fragment>
    )
}

export default App
