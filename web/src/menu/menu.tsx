import React, {useEffect, useState} from "react";
import {Box, Button} from "@chakra-ui/react";
import {SelectedEnum} from "./selected.enum";
import {Divider} from "@chakra-ui/layout";
import {useNavigate} from "react-router-dom";
import {SettingsIcon, WarningTwoIcon} from "@chakra-ui/icons";
import axios from "axios";

const Menu = (props: { selected: SelectedEnum; }) => {

    const btn = [
        {
            name: 'Character',
            selected: SelectedEnum.CHARACTER
        }, {
            name: 'Initiative',
            selected: SelectedEnum.INITIATIVE
        }, {
            name: 'Monster',
            selected: SelectedEnum.MONSTER
        }, {
            name: 'Settings',
            icon: <SettingsIcon/>,
            color: 'teal',
            selected: SelectedEnum.SETTINGS
        }]

    const adminBtn = {
        name: 'Admin',
        icon: <WarningTwoIcon/>,
        color: 'red',
        selected: SelectedEnum.ADMIN
    }

    const [buttons, setButtons] = useState(btn)

    useEffect(() => {
        axios.get('/api/me/admin')
            .then(() => {
                setButtons(buttons => buttons.filter(b => b.name === adminBtn.name).length === 0 ? [...buttons, adminBtn] : buttons)
            }).catch(() => {})
    }, [])

    const navigate = useNavigate()

    return (
        <>
            <Box padding='0.2rem'>
                {
                    buttons.map((b) => (
                        <Button key={b.selected} colorScheme={b.color || 'gray'} leftIcon={b.icon || <></>}
                                variant={props.selected === b.selected ? 'solid' : 'ghost'}
                                onClick={() => {
                                    navigate(`/${b.name.toLowerCase()}`)
                                }}>
                            {b.name}
                        </Button>
                    ))
                }
            </Box>
            <Divider marginBottom='1rem'/>
        </>
    )

}

export default Menu
