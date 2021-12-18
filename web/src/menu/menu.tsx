import React from "react";
import {Box, Button} from "@chakra-ui/react";
import {SelectedEnum} from "./selected.enum";
import {Divider} from "@chakra-ui/layout";
import {useNavigate} from "react-router-dom";
import {SettingsIcon} from "@chakra-ui/icons";

const Menu = (props: { selected: SelectedEnum; }) => {

    const btn = [
        {
            name: 'Character',
            selected: SelectedEnum.CHARACTER
        }, {
            name: 'Initiative',
            selected: SelectedEnum.INITIATIVE
        }, {
            name: 'Settings',
            icon: <SettingsIcon/>,
            color: 'teal',
            selected: SelectedEnum.SETTINGS
        }]

    const navigate = useNavigate()

    return (
        <>
            <Box padding='0.2rem'>
                {
                    btn.map((b) => (
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
