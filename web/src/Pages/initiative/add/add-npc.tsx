import React, {useEffect, useState} from "react";
import {Center, Input, Switch, Table, Tbody, Td, Text, Th, Thead, Tr} from "@chakra-ui/react"
import {AddIcon} from "@chakra-ui/icons";
import "../initiative.css";
import _ from "lodash";
import {Player} from "../player.type";
import axios from "axios";
import {abilityModifier, applyHidden, colorToMarker, filterByName, npcEntries, rollD20} from "./add.utils";

const App = (props: {u: () => void}) => {

    const [data, setData] = useState<Player[]>([])
    const [values, setValue] = useState<Player[]>([])

    const search = (val: string) => {
        setValue(_.cloneDeep(filterByName(data, val)))
    }

    const getPlayer = () => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/charlist/npc')
            .then((d) => {
                const npcs = npcEntries(d.data)
                setValue(npcs)
                setData(npcs)
            })
            .catch(() => {
            })
    }

    const onAdd = (p: Player) => {
        const dexMod = abilityModifier(p.character.dex) || 0
        p.initiative = dexMod + rollD20()
        if (p.character.color) {
            p.colorMarker = colorToMarker(p.character.color)
        }
        axios.post(process.env.REACT_APP_API_PREFIX + '/api/initiative/player', {player: p})
            .then(() => props.u())
            .catch(() => {
            })
    }

    const onHide = (p: Player, val: boolean) => {
        applyHidden(p, val)
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
