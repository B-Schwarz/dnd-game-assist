import React, {useEffect, useState} from "react";
import {Button, Center, Input, Switch, Table, Tbody, Td, Text, Th, Thead, Tr} from "@chakra-ui/react";
import {AddIcon} from "@chakra-ui/icons";
import {Player} from "../player.type";
import _ from "lodash";
import axios from "axios";
import {Monster} from "../../monster/monster.type";

const App = (props: {u: () => void}) => {

    const [data, setData] = useState<Player[]>([])
    const [values, setValue] = useState<Player[]>([])

    const search = (val: string) => {
        const temp = _.cloneDeep(data)
        // @ts-ignore
        setValue(_.cloneDeep(temp.filter(d => d.monster.name.toLowerCase().includes(val.toLowerCase()))))
    }

    const getMonster = () => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/monster/list')
            .then((d) => {
                d.data.forEach((m: Monster) => {
                    data.push({
                        character: {
                            name: m.monster.name,
                            ac: m.monster.ac,
                            hp: m.monster.hp,
                            maxHp: m.monster.hp,
                            tempHp: "",
                            dex: String(m.monster.stats.dex),
                            strSave: String(m.monster.saving.str),
                            conSave: String(m.monster.saving.con),
                            dexSave: String(m.monster.saving.dex),
                            intSave: String(m.monster.saving.int),
                            wisSave: String(m.monster.saving.wis),
                            chaSave: String(m.monster.saving.cha)
                        },
                        id: m._id,
                        initiative: 0,
                        isMaster: false,
                        isTurn: false,
                        isTurnSet: false,
                        statusEffects: [],
                        turn: 0,
                        hidden: false,
                        npc: true
                    })
                })
                setValue(data)
            })
            .catch(() => {
            })
    }

    const onAdd = (m: Player) => {
        const roll = Math.floor(Math.random() * 20)
        const dexMod = Math.floor((Number(m.character.dex) - 10) / 2)
        m.initiative = dexMod + roll

        axios.post(process.env.REACT_APP_API_PREFIX + '/api/initiative/player', {player: m})
            .then(() => props.u())
            .catch(() => {
            })
    }

    const onHide = (m: Player, val: boolean) => {
        m.hidden = val
    }

    useEffect(() => {
        if (data.length === 0) {
            getMonster()
        }
    }, [data])

    return (
        <React.Fragment>
            <Input placeholder='Suchen...' onChange={(val) => search(val.currentTarget.value)}/>
            <Table marginTop='1rem'>
                <Thead>
                    <Tr>
                        <Th>Name</Th>
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
