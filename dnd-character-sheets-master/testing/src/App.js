import './App.css';
import {DnDCharacterProfileSheet, DnDCharacterSpellSheet, DnDCharacterStatsSheet, DnDCharacter} from "dnd-character-sheets";
import 'dnd-character-sheets/dist/index.css'
import {useState} from "react";

function App() {

  const [character, setCharacter] = useState(loadDefaultCharacter())

  function loadDefaultCharacter () {
    let character = DnDCharacter()
    const lsData = localStorage.getItem('dnd-character-data')
    if (lsData) {
      try {
        character = JSON.parse(lsData)
      } catch {}
    }
    return character
  }

  function updateCharacter (character) {
    setCharacter(character)
    localStorage.setItem('dnd-character-data', JSON.stringify(character))
  }

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

  return (
    <div>
      {statsSheet}
      {profileSheet}
      {spellSheet}
    </div>
  );
}

export default App;
