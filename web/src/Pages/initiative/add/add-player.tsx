import React, {useEffect, useState} from "react";
import {
    Badge,
    Center,
    HStack,
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
import "../initiative.css";
import {Player} from "../player.type";
import axios from "axios";
import {colorToMarker, filterByName, playableEntries} from "./add.utils";
import AddSkeletonRows from "./add-skeleton";

const App = (props: {u: () => void}) => {

    const [data, setData] = useState<Player[]>([])
    const [values, setValue] = useState<Player[]>([])
    const [loading, setLoading] = useState(true)

    const search = (val: string) => {
        setValue(structuredClone(filterByName(data, val)))
    }

    const getPlayer = () => {
        axios.get(process.env.REACT_APP_API_PREFIX + '/api/charlist')
            .then((d) => {
                const players = playableEntries(d.data)
                setValue(players)
                setData(players)
            })
            .catch(() => {
            })
            .finally(() => setLoading(false))
    }

    const onAdd = (p: Player) => {
        let _p = p
        if (_p.character.color) {
            _p.colorMarker = colorToMarker(_p.character.color)
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
                    {loading && <AddSkeletonRows cols={3}/>}
                    {
                        !loading && values.map((item, index) => (
                            <Tr key={index}>
                                <Td>
                                    <HStack spacing='0.4rem'>
                                        {item.primary && <Badge colorScheme='yellow'>PRIMÄR</Badge>}
                                        <Text isTruncated maxW='11rem'>{item.character.name}</Text>
                                    </HStack>
                                </Td>
                                <Td><NumberInput defaultValue={values[index]['initiative'] || 0} min={0}
                                                 onChange={(val) => {
                                                     // @ts-ignore
                                                     values[index]['initiative'] = val
                                                 }}>
                                    <NumberInputField/>
                                </NumberInput></Td>
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
