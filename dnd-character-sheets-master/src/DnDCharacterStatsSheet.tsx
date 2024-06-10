import React, {useState, useEffect} from 'react'

// eslint-disable-next-line no-unused-vars
import DnDCharacter from './DnDCharacter'

import Statbox from './Components/StatBox'
import StatRow from './Components/StatRow'
import Skill from './Components/Skill'
import StatBox2 from './Components/StatBox2'
import DeathSave from './Components/DeathSave'
import AttackTable from './Components/AttackTable'
import Currency from './Components/Currency'


import './dndstyles.css'


// class DnDCharacterStatsSheet extends React.Component<
//   IDnDCharacterStatsSheetProps,
//   IDnDCharacterStatsSheetState
// > {
const App = (props: {
  character?: DnDCharacter,
  defaultCharacter?: DnDCharacter,
  onCharacterChanged?: (character: DnDCharacter, changedField: string, newValue: any) => void,
  german: boolean
}): React.JSX.Element => {


  const [character, setCharacter] = useState<DnDCharacter>(new DnDCharacter())

  useEffect(() => {
    if (props.character) {
      setCharacter(props.character)
    }
  }, []);

  const updateCharacter = (name: string, value: any) => {
    const oldCharacter = character
    const newCharacter: DnDCharacter = {}
    Object.assign(newCharacter, oldCharacter)

    if (name !== 'REFRESH') {
      newCharacter[name] = value
    }

    if (props.character) {
      // NOT CONTROLLED
      setCharacter(newCharacter)
    }

    if (typeof props.onCharacterChanged === 'function') {
      props.onCharacterChanged(newCharacter, name, value)
    }
  }



  const calculateTalents = (char: DnDCharacter) => {
    if (char) {
      const tempStr: string = String(Math.floor((Number(char.str) - 10) / 2))
      const tempDex: string = String(Math.floor((Number(char.dex) - 10) / 2))
      const tempCon: string = String(Math.floor((Number(char.con) - 10) / 2))
      const tempInt: string = String(Math.floor((Number(char.int) - 10) / 2))
      const tempWis: string = String(Math.floor((Number(char.wis) - 10) / 2))
      const tempCha: string = String(Math.floor((Number(char.cha) - 10) / 2))

      char.skillAcrobatics = tempDex
      if (char.skillAcrobaticsChecked === 'expert') {
        char.skillAcrobatics = String(
          Number(tempDex) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillAcrobaticsChecked === 'normal') {
        char.skillAcrobatics = String(
          Number(tempDex) + Number(char.proficiencyBonus)
        )
      }

      char.skillAnimalHandling = tempWis
      if (char.skillAnimalHandlingChecked === 'expert') {
        char.skillAnimalHandling = String(
          Number(tempWis) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillAnimalHandlingChecked === 'normal') {
        char.skillAnimalHandling = String(
          Number(tempWis) + Number(char.proficiencyBonus)
        )
      }

      char.skillArcana = tempInt
      if (char.skillArcanaChecked === 'expert') {
        char.skillArcana = String(
          Number(tempInt) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillArcanaChecked === 'normal') {
        char.skillArcana = String(
          Number(tempInt) + Number(char.proficiencyBonus)
        )
      }

      char.skillAthletics = tempStr
      if (char.skillAthleticsChecked === 'expert') {
        char.skillAthletics = String(
          Number(tempStr) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillAthleticsChecked === 'normal') {
        char.skillAthletics = String(
          Number(tempStr) + Number(char.proficiencyBonus)
        )
      }

      char.skillDeception = tempCha
      if (char.skillDeceptionChecked === 'expert') {
        char.skillDeception = String(
          Number(tempCha) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillDeceptionChecked === 'normal') {
        char.skillDeception = String(
          Number(tempCha) + Number(char.proficiencyBonus)
        )
      }

      char.skillHistory = tempInt
      if (char.skillHistoryChecked === 'expert') {
        char.skillHistory = String(
          Number(tempInt) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillHistoryChecked === 'normal') {
        char.skillHistory = String(
          Number(tempInt) + Number(char.proficiencyBonus)
        )
      }

      char.skillInsight = tempWis
      if (char.skillInsightChecked === 'expert') {
        char.skillInsight = String(
          Number(tempWis) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillInsightChecked === 'normal') {
        char.skillInsight = String(
          Number(tempWis) + Number(char.proficiencyBonus)
        )
      }

      char.skillIntimidation = tempCha
      if (char.skillIntimidationChecked === 'expert') {
        char.skillIntimidation = String(
          Number(tempCha) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillIntimidationChecked === 'normal') {
        char.skillIntimidation = String(
          Number(tempCha) + Number(char.proficiencyBonus)
        )
      }

      char.skillInvestigation = tempInt
      if (char.skillInvestigationChecked === 'expert') {
        char.skillInvestigation = String(
          Number(tempInt) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillInvestigationChecked === 'normal') {
        char.skillInvestigation = String(
          Number(tempInt) + Number(char.proficiencyBonus)
        )
      }

      char.skillMedicine = tempWis
      if (char.skillMedicineChecked === 'expert') {
        char.skillMedicine = String(
          Number(tempWis) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillMedicineChecked === 'normal') {
        char.skillMedicine = String(
          Number(tempWis) + Number(char.proficiencyBonus)
        )
      }

      char.skillNature = tempInt
      if (char.skillNatureChecked === 'expert') {
        char.skillMedicine = String(
          Number(tempInt) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillNatureChecked === 'normal') {
        char.skillNature = String(
          Number(tempInt) + Number(char.proficiencyBonus)
        )
      }

      char.skillPerception = tempWis
      if (char.skillPerceptionChecked === 'expert') {
        char.skillPerception = String(
          Number(tempWis) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillPerceptionChecked === 'normal') {
        char.skillPerception = String(
          Number(tempWis) + Number(char.proficiencyBonus)
        )
      }

      char.skillPerformance = tempCha
      if (char.skillPerformanceChecked === 'expert') {
        char.skillPerformance = String(
          Number(tempCha) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillPerformanceChecked === 'normal') {
        char.skillPerformance = String(
          Number(tempCha) + Number(char.proficiencyBonus)
        )
      }

      char.skillPersuasion = tempCha
      if (char.skillPersuasionChecked === 'expert') {
        char.skillPersuasion = String(
          Number(tempCha) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillPersuasionChecked === 'normal') {
        char.skillPersuasion = String(
          Number(tempCha) + Number(char.proficiencyBonus)
        )
      }

      char.skillReligion = tempInt
      if (char.skillReligionChecked === 'expert') {
        char.skillReligion = String(
          Number(tempInt) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillReligionChecked === 'normal') {
        char.skillReligion = String(
          Number(tempInt) + Number(char.proficiencyBonus)
        )
      }

      char.skillSlightOfHand = tempDex
      if (char.skillSlightOfHandChecked === 'expert') {
        char.skillSlightOfHand = String(
          Number(tempDex) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillSlightOfHandChecked === 'normal') {
        char.skillSlightOfHand = String(
          Number(tempDex) + Number(char.proficiencyBonus)
        )
      }

      char.skillStealth = tempDex
      if (char.skillStealthChecked === 'expert') {
        char.skillStealth = String(
          Number(tempDex) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillStealthChecked === 'normal') {
        char.skillStealth = String(
          Number(tempDex) + Number(char.proficiencyBonus)
        )
      }

      char.skillSurvival = tempWis
      if (char.skillSurvivalChecked === 'expert') {
        char.skillSurvival = String(
          Number(tempWis) +
          Number(char.proficiencyBonus) +
          Number(char.proficiencyBonus)
        )
      } else if (char.skillSurvivalChecked === 'normal') {
        char.skillSurvival = String(
          Number(tempWis) + Number(char.proficiencyBonus)
        )
      }

      char.strSave = tempStr
      if (char.strSaveChecked === 'expert') {
        char.strSave = String(Number(tempStr) + Number(char.proficiencyBonus) + Number(char.proficiencyBonus))
      } else if (char.strSaveChecked === 'normal') {
        char.strSave = String(Number(tempStr) + Number(char.proficiencyBonus))
      }

      char.dexSave = tempDex
      if (char.dexSaveChecked === 'expert') {
        char.dexSave = String(Number(tempDex) + Number(char.proficiencyBonus) + Number(char.proficiencyBonus))
      } else if (char.dexSaveChecked === 'normal') {
        char.dexSave = String(Number(tempDex) + Number(char.proficiencyBonus))
      }

      char.conSave = tempCon
      if (char.conSaveChecked === 'expert') {
        char.conSave = String(Number(tempCon) + Number(char.proficiencyBonus) + Number(char.proficiencyBonus))
      } else if (char.conSaveChecked === 'normal') {
        char.conSave = String(Number(tempCon) + Number(char.proficiencyBonus))
      }

      char.intSave = tempInt
      if (char.intSaveChecked === 'expert') {
        char.intSave = String(Number(tempInt) + Number(char.proficiencyBonus) + Number(char.proficiencyBonus))
      } else if (char.intSaveChecked === 'normal') {
        char.intSave = String(Number(tempInt) + Number(char.proficiencyBonus))
      }

      char.wisSave = tempWis
      if (char.wisSaveChecked === 'expert') {
        char.wisSave = String(Number(tempWis) + Number(char.proficiencyBonus) + Number(char.proficiencyBonus))
      } else if (char.wisSaveChecked === 'normal') {
        char.wisSave = String(Number(tempWis) + Number(char.proficiencyBonus))
      }

      char.chaSave = tempCha
      if (char.chaSaveChecked === 'expert') {
        char.chaSave = String(Number(tempCha) + Number(char.proficiencyBonus) + Number(char.proficiencyBonus))
      } else if (char.chaSaveChecked === 'normal') {
        char.chaSave = String(Number(tempCha) + Number(char.proficiencyBonus))
      }

      updateCharacter('REFRESH', 0)
    }
  }

  return (
    <div className='d-and-d-character-sheet container-xl mt-5 mb-5'>
      <div>
        <div className='row mb-4'>
          <div className='col-md-3 pr-2 pl-2'>
            <div className='d-and-d-page-title'>D&D</div>
            <div className='d-and-d-attribute-collection char-name pr-3 pl-3'>
              <input
                type='text'
                value={character.name ? character.name : ''}
                onChange={(e) => updateCharacter('name', e.target.value)}
              />
            </div>
            <label
              style={{
                width: '100%',
                textAlign: 'right',
                textTransform: 'uppercase',
                fontSize: '11px'
              }}
            >
              Character Name
            </label>
          </div>
          <div className='col-md-9 pr-2 pl-2'>
            <div className='d-and-d-attribute-collection pr-3 pl-3'>
              <div className='row pl-3 pr-3'>
                <div className='col-md-3 col-6 pl-0 pr-0'>
                  <input
                    type='text'
                    value={character.classLevel ? character.classLevel : ''}
                    onChange={(e) =>
                      updateCharacter('classLevel', e.target.value)
                    }
                  />
                  <label>
                    {props.german ? 'Klasse & Stufe' : 'Class & Level'}
                  </label>
                </div>
                <div className='col-md-3 col-6 pl-0 pr-0'>
                  <input
                    type='text'
                    value={character.background ? character.background : ''}
                    onChange={(e) =>
                      updateCharacter('background', e.target.value)
                    }
                  />
                  <label>
                    {props.german ? 'Hintergrund' : 'Background'}
                  </label>
                </div>
                <div className='col-md-3 col-6 pl-0 pr-0'>
                  <input
                    type='text'
                    value={character.playerName ? character.playerName : ''}
                    onChange={(e) =>
                      updateCharacter('playerName', e.target.value)
                    }
                  />
                  <label>
                    {props.german ? 'Name des Spielers' : 'Player Name'}
                  </label>
                </div>
                <div className='col-md-3 col-6 pl-0 pr-0'>
                  <input
                    type='text'
                    value={character.faction ? character.faction : ''}
                    onChange={(e) =>
                      updateCharacter('faction', e.target.value)
                    }
                  />
                  <label>Faction</label>
                </div>
              </div>
              <div className='row pl-3 pr-3'>
                <div className='col-md-3 col-6 pl-0 pr-0'>
                  <input
                    type='text'
                    value={character.race ? character.race : ''}
                    onChange={(e) =>
                      updateCharacter('race', e.target.value)
                    }
                  />
                  <label>{props.german ? 'Volk' : 'Ancestry'}</label>
                </div>
                <div className='col-md-3 col-6 pl-0 pr-0'>
                  <input
                    type='text'
                    value={character.alignment ? character.alignment : ''}
                    onChange={(e) =>
                      updateCharacter('alignment', e.target.value)
                    }
                  />
                  <label>
                    {props.german ? 'Gesinnung' : 'Alignment'}
                  </label>
                </div>
                <div className='col-md-3 col-6 pl-0 pr-0'>
                  <input
                    type='text'
                    value={character.xp ? character.xp : ''}
                    onChange={(e) =>
                      updateCharacter('xp', e.target.value)
                    }
                  />
                  <label>
                    {props.german
                      ? 'Erfahrungspunkte'
                      : 'Experience Points'}
                  </label>
                </div>
                <div className='col-md-3 col-6 pl-0 pr-0'>
                  <input
                    type='text'
                    value={character.dciNo ? character.dciNo : ''}
                    onChange={(e) =>
                      updateCharacter('dciNo', e.target.value)
                    }
                  />
                  <label>DCI Number</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-4'>
            <div className='row'>
              <div className='col-4 pr-1'>
                <div className='d-and-d-box gray'>
                  <Statbox
                    label={props.german ? 'Stärke' : 'Strength'}
                    name='str'
                    value={character.str}
                    onChange={(name: string, value: any) => {
                      updateCharacter(name, value)
                    }}
                  />
                  <Statbox
                    label={
                      props.german ? 'Geschicklichkeit' : 'Dexterity'
                    }
                    name='dex'
                    value={character.dex}
                    onChange={(name: string, value: any) => {
                      updateCharacter(name, value)
                    }}
                  />
                  <Statbox
                    label={
                      props.german ? 'Konstitution' : 'Constitution'
                    }
                    name='con'
                    value={character.con}
                    onChange={(name: string, value: any) => {
                      updateCharacter(name, value)
                    }}
                  />
                  <Statbox
                    label={props.german ? 'Intelligenz' : 'Intelligence'}
                    name='int'
                    value={character.int}
                    onChange={(name: string, value: any) => {
                      updateCharacter(name, value)
                    }}
                  />
                  <Statbox
                    label={props.german ? 'Weisheit' : 'Wisdom'}
                    name='wis'
                    value={character.wis}
                    onChange={(name: string, value: any) => {
                      updateCharacter(name, value)
                    }}
                  />
                  <Statbox
                    label='Charisma'
                    name='cha'
                    value={character.cha}
                    onChange={(name: string, value: any) => {
                      updateCharacter(name, value)
                    }}
                  />
                  <button className={"btn btn-light btn-sm"} onClick={() => calculateTalents(character)}>
                    {props.german ? 'Neu Berechnen' : 'Re-Calculate'}
                  </button>
                </div>
              </div>
              <div className='col-8'>
                <StatRow
                  label='Inspiration'
                  name='inspiration'
                  value={character.inspiration}
                  onChange={(name: string, value: any) => {
                    updateCharacter(name, value)
                  }}
                />
                <StatRow
                  classes='rounded'
                  label={
                    props.german ? 'Übungsbonus' : 'Proficiency Bonus'
                  }
                  name='proficiencyBonus'
                  value={character.proficiencyBonus}
                  onChange={(name: string, value: any) => {
                    updateCharacter(name, value)
                  }}
                />
                <div className='d-and-d-box'>
                  <div style={{textAlign: 'left'}}>
                    <Skill
                      label={props.german ? 'Stärke' : 'Strength'}
                      name='strSave'
                      value={character.strSave}
                      checked={character.strSaveChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={
                        props.german ? 'Geschicklichkeit' : 'Dexterity'
                      }
                      name='dexSave'
                      value={character.dexSave}
                      checked={character.dexSaveChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={
                        props.german ? 'Konstitution' : 'Constitution'
                      }
                      name='conSave'
                      value={character.conSave}
                      checked={character.conSaveChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={
                        props.german ? 'Intelligenz' : 'Intelligence'
                      }
                      name='intSave'
                      value={character.intSave}
                      checked={character.intSaveChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={props.german ? 'Weisheit' : 'Wisdom'}
                      name='wisSave'
                      value={character.wisSave}
                      checked={character.wisSaveChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label='Charisma'
                      name='chaSave'
                      value={character.chaSave}
                      checked={character.chaSaveChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                  </div>
                  <label
                    className='d-and-d-title'
                    style={{marginTop: '10px'}}
                  >
                    {props.german ? 'Rettungswürfe' : 'Saving Throws'}
                  </label>
                </div>
                <div className='d-and-d-box'>
                  <div style={{textAlign: 'left'}}>
                    <Skill
                      label={props.german ? 'Akrobatik' : 'Acrobatics'}
                      hint={props.german ? '(Ges)' : '(Dex)'}
                      name='skillAcrobatics'
                      value={character.skillAcrobatics}
                      checked={character.skillAcrobaticsChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={
                        props.german
                          ? 'Mit Tieren umgehen'
                          : 'Animal Handling'
                      }
                      hint={props.german ? '(Wei)' : '(Wis)'}
                      name='skillAnimalHandling'
                      value={character.skillAnimalHandling}
                      checked={character.skillAnimalHandlingChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={props.german ? 'Arkane Kunde' : 'Arcana'}
                      hint='(Int)'
                      name='skillArcana'
                      value={character.skillArcana}
                      checked={character.skillArcanaChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={props.german ? 'Athletik' : 'Athletics'}
                      hint='(Str)'
                      name='skillAthletics'
                      value={character.skillAthletics}
                      checked={character.skillAthleticsChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={props.german ? 'Täschung' : 'Deception'}
                      hint='(Cha)'
                      name='skillDeception'
                      value={character.skillDeception}
                      checked={character.skillDeceptionChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={props.german ? 'Geschichte' : 'History'}
                      hint='(Int)'
                      name='skillHistory'
                      value={character.skillHistory}
                      checked={character.skillHistoryChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={props.german ? 'Motiv erkennen' : 'Insight'}
                      hint={props.german ? '(Wei)' : '(Wis)'}
                      name='skillInsight'
                      value={character.skillInsight}
                      checked={character.skillInsightChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={
                        props.german ? 'Einschüchtern' : 'Intimidation'
                      }
                      hint='(Cha)'
                      name='skillIntimidation'
                      value={character.skillIntimidation}
                      checked={character.skillIntimidationChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={
                        props.german
                          ? 'Nachforschungen'
                          : 'Investigation'
                      }
                      hint='(Int)'
                      name='skillInvestigation'
                      value={character.skillInvestigation}
                      checked={character.skillInvestigationChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={props.german ? 'Medizin' : 'Medicine'}
                      hint={props.german ? '(Wei)' : '(Wis)'}
                      name='skillMedicine'
                      value={character.skillMedicine}
                      checked={character.skillMedicineChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={props.german ? 'Naturkunde' : 'Nature'}
                      hint='(Int)'
                      name='skillNature'
                      value={character.skillNature}
                      checked={character.skillNatureChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={props.german ? 'Wahrnemung' : 'Perception'}
                      hint={props.german ? '(Wei)' : '(Wis)'}
                      name='skillPerception'
                      value={character.skillPerception}
                      checked={character.skillPerceptionChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={props.german ? 'Auftreten' : 'Performance'}
                      hint='(Cha)'
                      name='skillPerformance'
                      value={character.skillPerformance}
                      checked={character.skillPerformanceChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={props.german ? 'Überzeugen' : 'Persuasion'}
                      hint='(Cha)'
                      name='skillPersuasion'
                      value={character.skillPersuasion}
                      checked={character.skillPersuasionChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label='Religion'
                      hint='(Int)'
                      name='skillReligion'
                      value={character.skillReligion}
                      checked={character.skillReligionChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={
                        props.german
                          ? 'Fingerfertigkeit'
                          : 'Sleight of Hand'
                      }
                      hint={props.german ? '(Ges)' : '(Dex)'}
                      name='skillSlightOfHand'
                      value={character.skillSlightOfHand}
                      checked={character.skillSlightOfHandChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={props.german ? 'Heimlichkeit' : 'Stealth'}
                      hint={props.german ? '(Ges)' : '(Dex)'}
                      name='skillStealth'
                      value={character.skillStealth}
                      checked={character.skillStealthChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <Skill
                      label={
                        props.german ? 'Überlebenskunst' : 'Survival'
                      }
                      hint={props.german ? '(Wei)' : '(Wis)'}
                      name='skillSurvival'
                      value={character.skillSurvival}
                      checked={character.skillSurvivalChecked}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                  </div>
                  <label
                    className='d-and-d-title'
                    style={{marginTop: '10px'}}
                  >
                    {props.german ? 'Fertigkeiten' : 'Skills'}
                  </label>
                </div>
              </div>
            </div>
            <div className='mt-2'>
              <StatRow
                classes='rounded rounded-sides'
                label={
                  props.german
                    ? 'Passive Aufmerksamkeit'
                    : 'Passive Perception'
                }
                name='passivePerception'
                value={character.passivePerception}
                onChange={(name: string, value: any) => {
                  updateCharacter(name, value)
                }}
              />
            </div>
            <div className='d-and-d-box mt-4'>
                <textarea
                  value={
                    character.otherProficiencies
                      ? character.otherProficiencies
                      : ''
                  }
                  onChange={(e) =>
                    updateCharacter('otherProficiencies', e.target.value)
                  }
                  rows={12}
                />
              <label className='d-and-d-title' style={{marginTop: '10px'}}>
                {props.german
                  ? 'Weitere Übung und Sprachen'
                  : 'Other Proficiencies & Languages'}
              </label>
            </div>
          </div>

          <div className='col-md-4'>
            <div className='d-and-d-box gray'>
              <div className='row'>
                <div className='col-4 pr-2'>
                  <StatBox2
                    classes='shield'
                    labelTop={props.german ? 'Rüstungs-' : 'Armour'}
                    label={props.german ? 'klasse' : 'Class'}
                    name='ac'
                    value={character.ac}
                    onChange={(name: string, value: any) => {
                      updateCharacter(name, value)
                    }}
                  />
                </div>
                <div className='col-4 pr-2 pl-2'>
                  <StatBox2
                    label='Initiative'
                    name='init'
                    value={character.init}
                    onChange={(name: string, value: any) => {
                      updateCharacter(name, value)
                    }}
                  />
                </div>
                <div className='col-4 pl-2'>
                  <StatBox2
                    labelTop={props.german ? 'Bewegungs-' : ''}
                    label={props.german ? 'rate' : 'Speed'}
                    name='speed'
                    value={character.speed}
                    onChange={(name: string, value: any) => {
                      updateCharacter(name, value)
                    }}
                  />
                </div>
              </div>

              <div
                className='d-and-d-box white'
                style={{
                  borderRadius: '8px 8px 0 0',
                  marginBottom: '5px',
                  paddingBottom: '5px'
                }}
              >
                <div className='d-and-d-gray-text'>
                  <label style={{width: '95px'}}>
                    {props.german
                      ? 'Maximale Trefferpunkte'
                      : 'Hit Point Maximum'}
                  </label>
                  <input
                    type='text'
                    style={{width: 'calc(100% - 95px)'}}
                    className='d-and-d-linput'
                    value={character.maxHp ? character.maxHp : ''}
                    onChange={(e) =>
                      updateCharacter('maxHp', e.target.value)
                    }
                  />
                </div>
                <input
                  type='text'
                  className='d-and-d-cinput'
                  value={character.hp ? character.hp : ''}
                  onChange={(e) => updateCharacter('hp', e.target.value)}
                />
                <label className='d-and-d-title' style={{marginTop: '5px'}}>
                  {props.german
                    ? 'Aktuelle Trefferpunkte'
                    : 'Current Hit Points'}
                </label>
              </div>
              <div
                className='d-and-d-box white mb-2'
                style={{borderRadius: '0 0 8px 8px', paddingBottom: '5px'}}
              >
                <input
                  type='text'
                  className='d-and-d-cinput'
                  value={character.tempHp ? character.tempHp : ''}
                  onChange={(e) =>
                    updateCharacter('tempHp', e.target.value)
                  }
                />
                <label className='d-and-d-title' style={{marginTop: '5px'}}>
                  {props.german
                    ? 'Temporäre Trefferpunkte'
                    : 'Temporary Hit Points'}
                </label>
              </div>

              <div className='row mt-1'>
                <div className='col-6 pr-1'>
                  <div
                    className='d-and-d-box white mb-0'
                    style={{paddingBottom: '5px'}}
                  >
                    <div className='d-and-d-gray-text'>
                      <label style={{width: '25px'}}>
                        {props.german ? 'Gesamt' : 'Total'}
                      </label>
                      <input
                        type='text'
                        style={{width: 'calc(100% - 25px)'}}
                        className='d-and-d-linput'
                        value={
                          character.hitDiceMax ? character.hitDiceMax : ''
                        }
                        onChange={(e) =>
                          updateCharacter('hitDiceMax', e.target.value)
                        }
                      />
                    </div>
                    <input
                      type='text'
                      className='d-and-d-cinput'
                      value={character.hitDice ? character.hitDice : ''}
                      onChange={(e) =>
                        updateCharacter('hitDice', e.target.value)
                      }
                    />
                    <label
                      className='d-and-d-title'
                      style={{marginTop: '5px'}}
                    >
                      {props.german ? 'Trefferwürfel' : 'Hit Dice'}
                    </label>
                  </div>
                </div>
                <div className='col-6 pl-1'>
                  <div
                    className='d-and-d-box white mb-0'
                    style={{paddingBottom: '5px'}}
                  >
                    <DeathSave
                      classes='d-and-d-save-success'
                      label={props.german ? 'Erfolge' : 'Successes'}
                      name='deathsaveSuccesses'
                      value={character.deathsaveSuccesses}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <DeathSave
                      classes='d-and-d-save-failure'
                      label={props.german ? 'Fehlschläge' : 'Failures'}
                      name='deathsaveFailures'
                      value={character.deathsaveFailures}
                      onChange={(name: string, value: any) => {
                        updateCharacter(name, value)
                      }}
                    />
                    <label
                      className='d-and-d-title'
                      style={{marginTop: '6px'}}
                    >
                      {props.german ? 'Todes Würfe' : 'Death Saves'}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className='d-and-d-box mt-3'>
              <AttackTable
                rows={3}
                name='attacks'
                value={character.attacks}
                onChange={(name: string, value: any) => {
                  updateCharacter(name, value)
                }}
                german={props.german}
              />
              <textarea
                value={character.attacksText ? character.attacksText : ''}
                onChange={(e) =>
                  updateCharacter('attacksText', e.target.value)
                }
                rows={6}
              />
              <label className='d-and-d-title' style={{marginTop: '10px'}}>
                {props.german
                  ? 'Angriffe & Zauber'
                  : 'Attacks & Spellcasting'}
              </label>
            </div>

            <div className='d-and-d-box mt-4'>
              <div className='row'>
                <div className='' style={{width: '100px'}}>
                  <Currency
                    label={props.german ? 'KM' : 'CP'}
                    name='cp'
                    value={character.cp}
                    onChange={(name: string, value: any) => {
                      updateCharacter(name, value)
                    }}
                  />
                  <Currency
                    label={props.german ? 'SM' : 'SP'}
                    name='sp'
                    value={character.sp}
                    onChange={(name: string, value: any) => {
                      updateCharacter(name, value)
                    }}
                  />
                  <Currency
                    label={props.german ? 'EM' : 'EP'}
                    name='ep'
                    value={character.ep}
                    onChange={(name: string, value: any) => {
                      updateCharacter(name, value)
                    }}
                  />
                  <Currency
                    label={props.german ? 'GM' : 'GP'}
                    name='gp'
                    value={character.gp}
                    onChange={(name: string, value: any) => {
                      updateCharacter(name, value)
                    }}
                  />
                  <Currency
                    label={props.german ? 'PM' : 'PP'}
                    name='pp'
                    value={character.pp}
                    onChange={(name: string, value: any) => {
                      updateCharacter(name, value)
                    }}
                  />
                </div>
                <div className='col'>
                    <textarea
                      className='d-and-d-equipment-indent'
                      value={character.equipment ? character.equipment : ''}
                      onChange={(e) =>
                        updateCharacter('equipment', e.target.value)
                      }
                      rows={10}
                    />
                </div>
                <div className='col-md-12'>
                    <textarea
                      value={character.equipment2 ? character.equipment2 : ''}
                      onChange={(e) =>
                        updateCharacter('equipment2', e.target.value)
                      }
                      rows={4}
                    />
                </div>
              </div>
              <label className='d-and-d-title' style={{marginTop: '10px'}}>
                {props.german ? 'Ausrüstung' : 'Equipment'}
              </label>
            </div>
          </div>

          <div className='col-md-4'>
            <div
              className='d-and-d-box gray'
              style={{marginBottom: '17px'}}
            >
              <div
                className='d-and-d-box white'
                style={{
                  borderRadius: '8px 8px 0 0',
                  marginBottom: '5px',
                  paddingTop: '1px',
                  paddingBottom: '5px'
                }}
              >
                  <textarea
                    value={
                      character.personalityTraits
                        ? character.personalityTraits
                        : ''
                    }
                    onChange={(e) =>
                      updateCharacter('personalityTraits', e.target.value)
                    }
                    rows={3}
                  />
                <label className='d-and-d-title'>
                  {props.german
                    ? 'Persönlichkeitsmerkmale'
                    : 'Personality Traits'}
                </label>
              </div>
              <div
                className='d-and-d-box white'
                style={{
                  borderRadius: '0 0 0 0',
                  marginBottom: '5px',
                  paddingTop: '1px',
                  paddingBottom: '5px'
                }}
              >
                  <textarea
                    value={character.ideals ? character.ideals : ''}
                    onChange={(e) =>
                      updateCharacter('ideals', e.target.value)
                    }
                    rows={3}
                  />
                <label className='d-and-d-title'>
                  {props.german ? 'Ideale' : 'Ideals'}
                </label>
              </div>
              <div
                className='d-and-d-box white'
                style={{
                  borderRadius: '0 0 0 0',
                  marginBottom: '5px',
                  paddingTop: '1px',
                  paddingBottom: '5px'
                }}
              >
                  <textarea
                    value={character.bonds ? character.bonds : ''}
                    onChange={(e) =>
                      updateCharacter('bonds', e.target.value)
                    }
                    rows={2}
                  />
                <label className='d-and-d-title'>
                  {props.german ? 'Bindungen' : 'Bonds'}
                </label>
              </div>
              <div
                className='d-and-d-box white'
                style={{
                  borderRadius: '0 0 8px 8px',
                  marginBottom: '0px',
                  paddingTop: '1px',
                  paddingBottom: '4px'
                }}
              >
                  <textarea
                    value={character.flaws ? character.flaws : ''}
                    onChange={(e) =>
                      updateCharacter('flaws', e.target.value)
                    }
                    rows={2}
                  />
                <label className='d-and-d-title'>
                  {props.german ? 'Makel' : 'Flaws'}
                </label>
              </div>
            </div>
            <div className='d-and-d-box mt-3'>
                <textarea
                  style={{paddingBottom: '5px'}}
                  value={
                    character.featuresTraits ? character.featuresTraits : ''
                  }
                  onChange={(e) =>
                    updateCharacter('featuresTraits', e.target.value)
                  }
                  rows={27}
                />
              <label className='d-and-d-title' style={{marginTop: '10px'}}>
                {props.german ? 'Merkmale' : 'Features & Traits'}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;
