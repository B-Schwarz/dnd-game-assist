import React, {useEffect, useState} from "react";
import {Center, Input, Table, Tbody, Td, Text, Th, Thead, Tr} from "@chakra-ui/react";
import {AddIcon} from "@chakra-ui/icons";
import "../initiative.css";
import _ from "lodash";
import axios from "axios";
import {EncounterMonster, EncounterType} from "../../encounter/encounter.type";
import {buildEncounterInstances} from "./add.utils";

const App = (props: {u: () => void}) => {

    const [data, setData] = useState<EncounterType[]>([]);
    const [values, setValue] = useState<EncounterType[]>([])

    const search = (val: string) => {
        // @ts-ignore — encounter rows carry a `name`, not a `character.name`
        setValue(_.cloneDeep(data.filter(d => (d.name || '').toLowerCase().includes(val.toLowerCase()))))
    }

    const getMonster = () => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/encounter/list')
            .then((d) => {
                setValue([])
                let encounter: EncounterType[] = []
                d.data.forEach((m: EncounterType) => {
                    let monsters: EncounterMonster[] = []

                    m.encounter.forEach((encounter: EncounterMonster) => {
                        axios.get(process.env.REACT_APP_API_PREFIX + '/api/monster/' + encounter.monster)
                            .then(res => res.data)
                            .then(mon => {
                                monsters.push({
                                    monster: encounter.monster,
                                    name: mon.monster.name,
                                    data: {
                                        character: {
                                            name: mon.monster.name,
                                            ac: mon.monster.ac,
                                            hp: mon.monster.hp,
                                            maxHp: mon.monster.hp,
                                            tempHp: "",
                                            dex: String(mon.monster.stats.dex),
                                            strSave: String(mon.monster.saving.str),
                                            conSave: String(mon.monster.saving.con),
                                            dexSave: String(mon.monster.saving.dex),
                                            intSave: String(mon.monster.saving.int),
                                            wisSave: String(mon.monster.saving.wis),
                                            chaSave: String(mon.monster.saving.cha),
                                            speed: String(mon.monster.speed)
                                        },
                                        id: mon._id,
                                        initiative: 0,
                                        isMaster: false,
                                        isTurnSet: false,
                                        statusEffects: [],
                                        turnId: 0,
                                        hidden: encounter.hidden,
                                        npc: true
                                    },
                                    hidden: encounter.hidden,
                                    amount: encounter.amount
                                })
                            })
                            .catch(() => {})
                    })

                    encounter.push({
                        encounter: monsters,
                        _id: m._id,
                        name: m.name
                    })
                })
                setValue(encounter)
                setData(encounter)
            })
            .catch(() => {
            })
    }

    const onAdd = (m: EncounterType) => {
        // One independently-rolled (deep-cloned) board entry per monster per
        // amount; see buildEncounterInstances.
        buildEncounterInstances(m).forEach((player) => {
            axios.post(process.env.REACT_APP_API_PREFIX + '/api/initiative/player', {player})
                .then(() => props.u())
                .catch(() => {
                })
        })
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
                        <Th>Hinzufügen</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {
                        values.map((item, index) => (
                            <Tr key={index}>
                                <Td><Text isTruncated maxW='11rem'>{item.name}</Text></Td>
                                <Td>
                                    <Center>
                                        <button className='init-btn init-btn--primary init-btn--icon'
                                                onClick={() => onAdd(item)} aria-label='Hinzufügen'><AddIcon/></button>
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
