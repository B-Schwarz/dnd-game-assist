import React, {useEffect, useState} from "react";
import WithAuth from "../login/withAuth";
import {Monster} from "./monster.type";
import MonsterEntry from "./monster-entry";
import {Accordion, HStack, IconButton, Input, Stack, VStack} from "@chakra-ui/react";
import _ from "lodash";
import axios from "axios";
import {AddIcon} from "@chakra-ui/icons";

const App = () => {

    const [monster, setMonster] = useState<Monster[]>([])
    const [value, setValue] = useState<Monster[]>([])
    const [isAdminOrMaster, setIsAdminOrMaster] = useState(false)

    useEffect(() => {
        update()
        axios.get('http://localhost:4000/api/me/admin/master')
            .then(() => setIsAdminOrMaster(true))
            .catch(() => {})
    }, [])

    useEffect(() => {
        setValue(monster)
    }, [monster, isAdminOrMaster])

    const update = () => {
        axios.get('http://localhost:4000/api/monster/list')
            .then((data) => {
                const temp: Monster[] = _.cloneDeep(data.data)
                setMonster([])
                // @ts-ignore
                setMonster(temp.sort(function (a, b) {
                    if (a.monster.name < b.monster.name) {
                        return -1
                    }
                    if (a.monster.name > b.monster.name) {
                        return 1
                    }
                    return 0
                }))
            })
    }

    const search = (val: string) => {
        const temp = _.cloneDeep(monster)
        setValue(_.cloneDeep(temp.filter(d => d.monster.name.toLowerCase().includes(val.toLowerCase()))))
    }

    const createMonster = () => {
        axios.get('http://localhost:4000/api/monster/new')
            .then(() => update())
            .catch(() => {})
    }

    return (
        <React.Fragment>
            <VStack w='80%' margin='auto'>
                <HStack w='100%'>
                    <Input placeholder='Suchen...' onChange={(evt) => search(evt.currentTarget.value)}/>
                    {isAdminOrMaster && <IconButton aria-label={'add new monster'} colorScheme='green' icon={<AddIcon/>}
                                 onClick={createMonster}/>}
                </HStack>
                <Accordion allowToggle w='100%' h='80vh' overflowY='scroll'>
                    {value.map((m, i) => (
                        <MonsterEntry m={m} u={update} e={isAdminOrMaster} key={i}/>
                    ))}
                </Accordion>
            </VStack>
        </React.Fragment>
    )
}

export default WithAuth(App)
