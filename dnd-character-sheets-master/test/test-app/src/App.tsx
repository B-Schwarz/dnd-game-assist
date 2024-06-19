import React, {useState} from 'react';

import {
  DnDCharacterStatsSheet,
  DnDCharacterSpellSheet,
  DnDCharacterProfileSheet,
  DnDCharacter
} from "dnd-character-sheets";

import './App.css';
import 'dnd-character-sheets/index.css'

function App() {

  const [character, setCharacter] = useState<DnDCharacter>(loadDefaultCharacter())

  const statsSheet = (
        <DnDCharacterStatsSheet
            character={character}
            onCharacterChanged={updateCharacter}
            german={true}
            />
    )

    const profileSheet = (
        <DnDCharacterProfileSheet
            character={character}
            onCharacterChanged={updateCharacter}
            german={true}
        />
    )

    const spellSheet = (
        <DnDCharacterSpellSheet
            character={character}
            onCharacterChanged={updateCharacter}
            german={true}
        />
    )

  function updateCharacter(char: DnDCharacter) {
        setCharacter(char)
        localStorage.setItem('dnd-character-data', JSON.stringify(char))
    }

   function loadDefaultCharacter() {
        let character: DnDCharacter = {}
        const lsData = localStorage.getItem('dnd-character-data')
        if (lsData) {
            try {
                character = JSON.parse(lsData)
            } catch {
            }
        }
        return character
    }


  return (
    <div className="App">
      {statsSheet}
      {profileSheet}
      {spellSheet}
    </div>
  );
}

export default App;
