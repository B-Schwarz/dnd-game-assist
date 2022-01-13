import React, {useEffect, useState} from "react";
import WithAuth from "../login/withAuth";
import {Monster} from "./monster.type";
import MonsterEntry from "./monster-entry";
import {Accordion, HStack, IconButton, Input, VStack} from "@chakra-ui/react";
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
            .catch(() => {
            })
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
        if (val.length > 0) {
            const temp = _.cloneDeep(value)
            temp.forEach(d => d.hidden = !d.monster.name.toLowerCase().startsWith(val.toLowerCase()))
            setValue([])
            setValue(temp)
        } else {
            setValue([])
            setValue(monster)
        }
    }

    const createMonster = () => {
        axios.get('http://localhost:4000/api/monster/new')
            .then(() => update())
            .catch(() => {
            })
    }

    return (
        <React.Fragment>
            <VStack w='80%' margin='auto'>
                <HStack w='100%'>
                    <Input placeholder='Suchen...' onChange={async (evt) => {
                        await search(evt.currentTarget.value)
                    }}/>
                    {isAdminOrMaster && <IconButton aria-label={'add new monster'} colorScheme='green' icon={<AddIcon/>}
                                                    onClick={createMonster}/>}
                </HStack>
                <Accordion allowToggle w='100%' h='80vh' overflowY='scroll'>
                    {value.map((m: Monster, i: number) => {
                            if (!m.hidden)
                                 return (  <MonsterEntry m={m} u={update} e={isAdminOrMaster} key={i}/> )
                            else
                                return <React.Fragment key={i}/>
                    }
                    )}
                </Accordion>
            </VStack>
        </React.Fragment>
    )
}

export default WithAuth(App)
