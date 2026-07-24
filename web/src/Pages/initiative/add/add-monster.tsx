import React, {useEffect, useState} from "react";
import {Center, Input, Switch, Table, Tbody, Td, Text, Th, Thead, Tr} from "@chakra-ui/react";
import {AddIcon} from "@chakra-ui/icons";
import "../initiative.css";
import {Player} from "../player.type";
import axios from "axios";
import {Monster} from "../../monster/monster.type";
import {abilityModifier, applyHidden, filterByName, monsterBoardEntry, rollD20} from "./add.utils";
import AddSkeletonRows from "./add-skeleton";

const App = (props: {u: () => void}) => {

    const [data, setData] = useState<Player[]>([])
    const [values, setValue] = useState<Player[]>([])
    const [loading, setLoading] = useState(true)

    const search = (val: string) => {
        setValue(structuredClone(filterByName(data, val)))
    }

    const getMonster = () => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/monster/list/lean')
            .then((d) => {
                setValue([])
                let monsters: Player[] = []
                d.data.forEach((m: Monster) => {
                    monsters.push(monsterBoardEntry(m.monster, m._id, false))
                })
                setValue(monsters)
                setData(monsters)
            })
            .catch(() => {
            })
            .finally(() => setLoading(false))
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
                    {loading && <AddSkeletonRows cols={3}/>}
                    {
                        !loading && values.map((item, index) => (
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
