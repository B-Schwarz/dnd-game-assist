import React, {useEffect, useState} from "react";
import {Center, Input, Switch, Table, Tbody, Td, Text, Th, Thead, Tr} from "@chakra-ui/react";
import {AddIcon} from "@chakra-ui/icons";
import "../initiative.css";
import {Player} from "../player.type";
import _ from "lodash";
import axios from "axios";
import {Monster} from "../../monster/monster.type";
import {abilityModifier, applyHidden, filterByName, rollD20} from "./add.utils";

const App = (props: {u: () => void}) => {

    const [data, setData] = useState<Player[]>([])
    const [values, setValue] = useState<Player[]>([])

    const search = (val: string) => {
        setValue(_.cloneDeep(filterByName(data, val)))
    }

    const getMonster = () => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/monster/list')
            .then((d) => {
                setValue([])
                let monsters: Player[] = []
                d.data.forEach((m: Monster) => {
                    monsters.push({
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
                            chaSave: String(m.monster.saving.cha),
                            speed: String(m.monster.speed)
                        },
                        id: m._id,
                        initiative: 0,
                        isMaster: false,
                        isTurnSet: false,
                        statusEffects: [],
                        turnId: 0,
                        hidden: false,
                        npc: true,
                        monster: true
                    })
                })
                setValue(monsters)
                setData(monsters)
            })
            .catch(() => {
            })
    }

    const onAdd = (m: Player) => {
        m.initiative = abilityModifier(m.character.dex) + rollD20()

        axios.post(process.env.REACT_APP_API_PREFIX + '/api/initiative/player', {player: m})
            .then(() => props.u())
            .catch(() => {
            })
    }

    const onHide = (m: Player, val: boolean) => {
        applyHidden(m, val)
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
