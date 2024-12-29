import React, {useEffect, useState} from "react";
import {
    Button,
    Center,
    Input,
    NumberInput,
    NumberInputField,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr
} from "@chakra-ui/react"
import {AddIcon} from "@chakra-ui/icons";
import _ from "lodash";
import {Player} from "../player.type";
import axios from "axios";
import {DnDCharacter} from "dnd-character-sheets";
import {ColorMarkerEnum} from "../color-marker.enum";

const App = (props: {u: () => void}) => {

    const [data, setData] = useState<Player[]>([])
    const [values, setValue] = useState<Player[]>([])

    const search = (val: string) => {
        const temp = _.cloneDeep(data)
        // @ts-ignore
        setValue(_.cloneDeep(temp.filter(d => d.character.name.toLowerCase().includes(val.toLowerCase()))))
    }

    const getPlayer = () => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/charlist')
            .then((d) => {
                console.log(d)
                setValue([])
                let players: Player[] = []
                d.data.forEach((c: {
                    character: DnDCharacter;
                    _id: string;
                    npc: boolean;
                }) => {
                    if (!c.npc) {
                        players.push({
                            character: c.character,
                            id: c._id,
                            initiative: 0,
                            isMaster: false,
                            isTurn: false,
                            isTurnSet: false,
                            statusEffects: [],
                            turn: 0
                        })
                    }
                })
                setValue(players)
            })
            .catch(() => {
            })
    }

    const onAdd = (p: Player) => {
        let _p = p
        if (_p.character.color) {
            _p.colorMarker = Number(_p.character.color)
        }
        axios.post(process.env.REACT_APP_API_PREFIX + '/api/initiative/player', {player: _p})
            .then(() => props.u())
            .catch(() => {
            })
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
                        <Th>Initiative</Th>
                        <Th>Hinzufügen</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {
                        values.map((item, index) => (
                            <Tr key={index}>
                                <Td><Text isTruncated maxW='11rem'>{item.character.name}</Text></Td>
                                <Td><NumberInput defaultValue={values[index]['initiative'] || 0} min={0}
                                                 onChange={(val) => {
                                                     // @ts-ignore
                                                     values[index]['initiative'] = val
                                                 }}>
                                    <NumberInputField/>
                                </NumberInput></Td>
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
