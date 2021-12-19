import React from "react";
import WithAuth from "../login/withAuth";
import {Divider} from "@chakra-ui/layout";
import InitiaveEntry from "./initiave-entry";
import {StatusEffectsEnum} from "./status-effects.enum";
import {Accordion, Center, Heading} from "@chakra-ui/react";
import {DnDCharacter} from "dnd-character-sheets";

const App = () => {

    const tempChar = new DnDCharacter()
    tempChar.name = 'Craigman'
    tempChar.ac = '16'
    tempChar.hp = '30'
    tempChar.maxHp = '30'
    tempChar.tempHp = '3'
    tempChar.deathsaveSuccesses = 0
    tempChar.deathsaveFailures = 0

    const tempCharTwo = new DnDCharacter()
    tempCharTwo.name = 'Jeremy'
    tempCharTwo.ac = '14'
    tempCharTwo.hp = '21'
    tempCharTwo.maxHp = '32'
    tempCharTwo.deathsaveSuccesses = 0
    tempCharTwo.deathsaveFailures = 0

    const tempCharThree = new DnDCharacter()
    tempCharThree.name = 'Sneaky Assasin'
    tempCharThree.ac = '15'
    tempCharThree.hp = '30'
    tempCharThree.maxHp = '30'
    tempCharThree.deathsaveSuccesses = 0
    tempCharThree.deathsaveFailures = 0

    const isPlayer = false

    return (
        <>
            <Center>
                <Heading>Master</Heading>
            </Center>
            <Divider marginBottom='2rem'/>
            <Center>
                <Accordion allowToggle width='80%'>
                    <InitiaveEntry char={tempChar} initiative={13} isMaster={!isPlayer}/>
                    <InitiaveEntry char={tempCharTwo} initiative={11} isMaster={!isPlayer} statusEffects={[StatusEffectsEnum.DOWNED]}/>
                    <InitiaveEntry char={tempCharThree} initiative={10} isMaster={!isPlayer} statusEffects={[StatusEffectsEnum.POISONED, StatusEffectsEnum.BLIND]} hidden/>
                </Accordion>
            </Center>
            <Center>
                <Heading>Player</Heading>
            </Center>
            <Divider marginBottom='2rem'/>
            <Center>
                <Accordion allowToggle width='80%'>
                    <InitiaveEntry char={tempChar} initiative={13} isMaster={isPlayer}/>
                    <InitiaveEntry char={tempCharTwo} initiative={11} isMaster={isPlayer} statusEffects={[StatusEffectsEnum.DOWNED]}/>
                    <InitiaveEntry char={tempCharThree} initiative={10} isMaster={isPlayer} statusEffects={[StatusEffectsEnum.POISONED, StatusEffectsEnum.BLIND]} hidden/>
                </Accordion>
            </Center>
        </>
    )
}

export default WithAuth(App)
