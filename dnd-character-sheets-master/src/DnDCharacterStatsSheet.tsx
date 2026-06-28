import React from 'react'

import DnDCharacter from './DnDCharacter'

import Statbox from './Components/StatBox'
import StatRow from './Components/StatRow'
import Skill from './Components/Skill'
import StatBox2 from './Components/StatBox2'
import DeathSave from './Components/DeathSave'
import AttackTable from './Components/AttackTable'
import {Color} from './Components/color.enum'

import './dndstyles.css'

interface IDnDCharacterStatsSheetProps {
  character?: DnDCharacter
  defaultCharacter?: DnDCharacter
  onCharacterChanged?: (
    character: DnDCharacter,
    changedField: string,
    newValue: any
  ) => void
  german: boolean
}

interface IDnDCharacterStatsSheetState {
  character: DnDCharacter,
  color: number,
  init: boolean
}

const initialState: IDnDCharacterStatsSheetState = {
  character: {},
  color: Color.NONE,
  init: false
}

class DnDCharacterStatsSheet extends React.Component<
  IDnDCharacterStatsSheetProps,
  IDnDCharacterStatsSheetState
> {
  constructor(props: IDnDCharacterStatsSheetProps) {
    super(props)
    if (props.defaultCharacter) {
      initialState.character = props.defaultCharacter
    }
    if (props.character) {
      initialState.character = props.character
      initialState.color = props.character.color ?? Color.NONE
    }
    this.state = initialState
  }

  updateCharacter(name: string, value: any) {
    const oldCharacter = this.getCharacter()
    const newCharacter: DnDCharacter = {}
    Object.assign(newCharacter, oldCharacter)

    if (name !== 'REFRESH') {
      newCharacter[name] = value
    }

    if (this.props.character) {
      // NOT CONTROLLED
      this.setState({character: newCharacter})
    }

    if (typeof this.props.onCharacterChanged === 'function') {
      this.props.onCharacterChanged(newCharacter, name, value)
    }
  }

  getCharacter() {
    // NOT CONTROLLED
    let character = this.state.character
    if (this.props.character) {
      // CONTROLLED
      character = this.props.character
    }
    return character
  }


  render() {

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
          char.skillNature = String(
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

        this.updateCharacter('REFRESH', 0)
      }
    }

    const changeColor = (color: Color) => {
      this.setState({color: Color[color as unknown as keyof typeof Color]})
      this.updateCharacter('color', Color[color as unknown as keyof typeof Color])
    }

    const character = this.getCharacter()

    if (character.color && !this.state.init) {
      this.setState({color: character.color, init: true})
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
                  onChange={(e) => this.updateCharacter('name', e.target.value)}
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
                {this.props.german ? 'Charaktername' : 'Character Name'}
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
                        this.updateCharacter('classLevel', e.target.value)
                      }
                    />
                    <label>{this.props.german ? 'Klasse' : 'Class'}</label>
                  </div>
                  <div className='col-md-3 col-6 pl-0 pr-0'>
                    <input
                      type='text'
                      value={character.subclass ? character.subclass : ''}
                      onChange={(e) =>
                        this.updateCharacter('subclass', e.target.value)
                      }
                    />
                    <label>{this.props.german ? 'Unterklasse' : 'Subclass'}</label>
                  </div>
                  <div className='col-md-3 col-6 pl-0 pr-0'>
                    <input
                      type='text'
                      value={character.level ? character.level : ''}
                      onChange={(e) =>
                        this.updateCharacter('level', e.target.value)
                      }
                    />
                    <label>{this.props.german ? 'Stufe' : 'Level'}</label>
                  </div>
                  <div className='col-md-3 col-6 pl-0 pr-0'>
                    <input
                      type='text'
                      value={character.background ? character.background : ''}
                      onChange={(e) =>
                        this.updateCharacter('background', e.target.value)
                      }
                    />
                    <label>
                      {this.props.german ? 'Hintergrund' : 'Background'}
                    </label>
                  </div>
                </div>
                <div className='row pl-3 pr-3'>
                  <div className='col-md-4 col-6 pl-0 pr-0'>
                    <input
                      type='text'
                      value={character.race ? character.race : ''}
                      onChange={(e) =>
                        this.updateCharacter('race', e.target.value)
                      }
                    />
                    <label>{this.props.german ? 'Spezies' : 'Species'}</label>
                  </div>
                  <div className='col-md-4 col-6 pl-0 pr-0'>
                    <input
                      type='text'
                      value={character.xp ? character.xp : ''}
                      onChange={(e) =>
                        this.updateCharacter('xp', e.target.value)
                      }
                    />
                    <label>
                      {this.props.german
                        ? 'Erfahrungspunkte'
                        : 'Experience Points'}
                    </label>
                  </div>
                  <div className='col-md-4 col-6 pl-0 pr-0'>
                    <label className='color-select'>
                      <select value={this.state.color} onChange={evt => changeColor(Color[evt.target.value as keyof typeof Color])}>
                        <option value={Color.NONE}>Keine</option>
                        <option value={Color.BLACK}>Schwarz</option>
                        <option value={Color.GREY}>Grau</option>
                        <option value={Color.PURPLE}>Lila</option>
                        <option value={Color.RED}>Rot</option>
                        <option value={Color.PINK}>Pink</option>
                        <option value={Color.ORANGE}>Orange</option>
                        <option value={Color.YELLOW}>Gelb</option>
                        <option value={Color.GREEN}>Grün</option>
                        <option value={Color.BLUE}>Blau</option>
                        <option value={Color.WHITE}>Weiß</option>
                      </select>
                    </label>
                    <label>
                      {this.props.german ? 'Farbe' : 'Color'}
                    </label>
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
                      label={this.props.german ? 'Stärke' : 'Strength'}
                      name='str'
                      value={character.str}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                    <Statbox
                      label={
                        this.props.german ? 'Geschicklichkeit' : 'Dexterity'
                      }
                      name='dex'
                      value={character.dex}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                    <Statbox
                      label={
                        this.props.german ? 'Konstitution' : 'Constitution'
                      }
                      name='con'
                      value={character.con}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                    <Statbox
                      label={this.props.german ? 'Intelligenz' : 'Intelligence'}
                      name='int'
                      value={character.int}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                    <Statbox
                      label={this.props.german ? 'Weisheit' : 'Wisdom'}
                      name='wis'
                      value={character.wis}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                    <Statbox
                      label='Charisma'
                      name='cha'
                      value={character.cha}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                    <button className={"btn btn-light btn-sm"} onClick={() => calculateTalents(character)}>
                      {this.props.german ? 'Neu Berechnen' : 'Re-Calculate'}
                    </button>
                  </div>
                </div>
                <div className='col-8'>
                  <StatRow
                    label={this.props.german ? 'Heroische Inspiration' : 'Heroic Inspiration'}
                    name='inspiration'
                    value={character.inspiration}
                    onChange={(name: string, value: any) => {
                      this.updateCharacter(name, value)
                    }}
                  />
                  <StatRow
                    classes='rounded'
                    label={
                      this.props.german ? 'Übungsbonus' : 'Proficiency Bonus'
                    }
                    name='proficiencyBonus'
                    value={character.proficiencyBonus}
                    onChange={(name: string, value: any) => {
                      this.updateCharacter(name, value)
                    }}
                  />
                  <div className='d-and-d-box'>
                    <div style={{textAlign: 'left'}}>
                      <Skill
                        label={this.props.german ? 'Stärke' : 'Strength'}
                        name='strSave'
                        value={character.strSave}
                        checked={character.strSaveChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={
                          this.props.german ? 'Geschicklichkeit' : 'Dexterity'
                        }
                        name='dexSave'
                        value={character.dexSave}
                        checked={character.dexSaveChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={
                          this.props.german ? 'Konstitution' : 'Constitution'
                        }
                        name='conSave'
                        value={character.conSave}
                        checked={character.conSaveChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={
                          this.props.german ? 'Intelligenz' : 'Intelligence'
                        }
                        name='intSave'
                        value={character.intSave}
                        checked={character.intSaveChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={this.props.german ? 'Weisheit' : 'Wisdom'}
                        name='wisSave'
                        value={character.wisSave}
                        checked={character.wisSaveChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label='Charisma'
                        name='chaSave'
                        value={character.chaSave}
                        checked={character.chaSaveChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                    </div>
                    <label
                      className='d-and-d-title'
                      style={{marginTop: '10px'}}
                    >
                      {this.props.german ? 'Rettungswürfe' : 'Saving Throws'}
                    </label>
                  </div>
                  <div className='d-and-d-box'>
                    <div style={{textAlign: 'left'}}>
                      <Skill
                        label={this.props.german ? 'Akrobatik' : 'Acrobatics'}
                        hint={this.props.german ? '(Ges)' : '(Dex)'}
                        name='skillAcrobatics'
                        value={character.skillAcrobatics}
                        checked={character.skillAcrobaticsChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={
                          this.props.german
                            ? 'Mit Tieren umgehen'
                            : 'Animal Handling'
                        }
                        hint={this.props.german ? '(Wei)' : '(Wis)'}
                        name='skillAnimalHandling'
                        value={character.skillAnimalHandling}
                        checked={character.skillAnimalHandlingChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={this.props.german ? 'Arkane Kunde' : 'Arcana'}
                        hint='(Int)'
                        name='skillArcana'
                        value={character.skillArcana}
                        checked={character.skillArcanaChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={this.props.german ? 'Athletik' : 'Athletics'}
                        hint='(Str)'
                        name='skillAthletics'
                        value={character.skillAthletics}
                        checked={character.skillAthleticsChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={this.props.german ? 'Täschung' : 'Deception'}
                        hint='(Cha)'
                        name='skillDeception'
                        value={character.skillDeception}
                        checked={character.skillDeceptionChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={this.props.german ? 'Geschichte' : 'History'}
                        hint='(Int)'
                        name='skillHistory'
                        value={character.skillHistory}
                        checked={character.skillHistoryChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={this.props.german ? 'Motiv erkennen' : 'Insight'}
                        hint={this.props.german ? '(Wei)' : '(Wis)'}
                        name='skillInsight'
                        value={character.skillInsight}
                        checked={character.skillInsightChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={
                          this.props.german ? 'Einschüchtern' : 'Intimidation'
                        }
                        hint='(Cha)'
                        name='skillIntimidation'
                        value={character.skillIntimidation}
                        checked={character.skillIntimidationChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={
                          this.props.german
                            ? 'Nachforschungen'
                            : 'Investigation'
                        }
                        hint='(Int)'
                        name='skillInvestigation'
                        value={character.skillInvestigation}
                        checked={character.skillInvestigationChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={this.props.german ? 'Medizin' : 'Medicine'}
                        hint={this.props.german ? '(Wei)' : '(Wis)'}
                        name='skillMedicine'
                        value={character.skillMedicine}
                        checked={character.skillMedicineChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={this.props.german ? 'Naturkunde' : 'Nature'}
                        hint='(Int)'
                        name='skillNature'
                        value={character.skillNature}
                        checked={character.skillNatureChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={this.props.german ? 'Wahrnemung' : 'Perception'}
                        hint={this.props.german ? '(Wei)' : '(Wis)'}
                        name='skillPerception'
                        value={character.skillPerception}
                        checked={character.skillPerceptionChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={this.props.german ? 'Auftreten' : 'Performance'}
                        hint='(Cha)'
                        name='skillPerformance'
                        value={character.skillPerformance}
                        checked={character.skillPerformanceChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={this.props.german ? 'Überzeugen' : 'Persuasion'}
                        hint='(Cha)'
                        name='skillPersuasion'
                        value={character.skillPersuasion}
                        checked={character.skillPersuasionChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label='Religion'
                        hint='(Int)'
                        name='skillReligion'
                        value={character.skillReligion}
                        checked={character.skillReligionChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={
                          this.props.german
                            ? 'Fingerfertigkeit'
                            : 'Sleight of Hand'
                        }
                        hint={this.props.german ? '(Ges)' : '(Dex)'}
                        name='skillSlightOfHand'
                        value={character.skillSlightOfHand}
                        checked={character.skillSlightOfHandChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={this.props.german ? 'Heimlichkeit' : 'Stealth'}
                        hint={this.props.german ? '(Ges)' : '(Dex)'}
                        name='skillStealth'
                        value={character.skillStealth}
                        checked={character.skillStealthChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <Skill
                        label={
                          this.props.german ? 'Überlebenskunst' : 'Survival'
                        }
                        hint={this.props.german ? '(Wei)' : '(Wis)'}
                        name='skillSurvival'
                        value={character.skillSurvival}
                        checked={character.skillSurvivalChecked}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                    </div>
                    <label
                      className='d-and-d-title'
                      style={{marginTop: '10px'}}
                    >
                      {this.props.german ? 'Fertigkeiten' : 'Skills'}
                    </label>
                  </div>
                </div>
              </div>
              <div className='mt-2'>
                <StatRow
                  classes='rounded rounded-sides'
                  label={
                    this.props.german
                      ? 'Passive Aufmerksamkeit'
                      : 'Passive Perception'
                  }
                  name='passivePerception'
                  value={character.passivePerception}
                  onChange={(name: string, value: any) => {
                    this.updateCharacter(name, value)
                  }}
                />
              </div>
              <div className='d-and-d-box mt-4'>
                <div style={{textAlign: 'left', marginBottom: '8px'}}>
                  <label style={{textTransform: 'uppercase', fontSize: '11px', width: '100%'}}>
                    {this.props.german ? 'Rüstungstraining' : 'Armor Training'}
                  </label>
                  <label style={{marginRight: '10px'}}>
                    <input
                      type='checkbox'
                      checked={!!character.armorTrainingLight}
                      onChange={(e) =>
                        this.updateCharacter('armorTrainingLight', e.target.checked)
                      }
                    />{' '}
                    {this.props.german ? 'Leicht' : 'Light'}
                  </label>
                  <label style={{marginRight: '10px'}}>
                    <input
                      type='checkbox'
                      checked={!!character.armorTrainingMedium}
                      onChange={(e) =>
                        this.updateCharacter('armorTrainingMedium', e.target.checked)
                      }
                    />{' '}
                    {this.props.german ? 'Mittel' : 'Medium'}
                  </label>
                  <label style={{marginRight: '10px'}}>
                    <input
                      type='checkbox'
                      checked={!!character.armorTrainingHeavy}
                      onChange={(e) =>
                        this.updateCharacter('armorTrainingHeavy', e.target.checked)
                      }
                    />{' '}
                    {this.props.german ? 'Schwer' : 'Heavy'}
                  </label>
                  <label>
                    <input
                      type='checkbox'
                      checked={!!character.armorTrainingShields}
                      onChange={(e) =>
                        this.updateCharacter('armorTrainingShields', e.target.checked)
                      }
                    />{' '}
                    {this.props.german ? 'Schilde' : 'Shields'}
                  </label>
                </div>
                <textarea
                  placeholder={this.props.german ? 'Waffen' : 'Weapons'}
                  value={character.weaponProficiencies ? character.weaponProficiencies : ''}
                  onChange={(e) =>
                    this.updateCharacter('weaponProficiencies', e.target.value)
                  }
                  rows={4}
                />
                <textarea
                  placeholder={this.props.german ? 'Werkzeuge' : 'Tools'}
                  value={character.toolProficiencies ? character.toolProficiencies : ''}
                  onChange={(e) =>
                    this.updateCharacter('toolProficiencies', e.target.value)
                  }
                  rows={4}
                />
                <label className='d-and-d-title' style={{marginTop: '10px'}}>
                  {this.props.german
                    ? 'Ausrüstungstraining & Übungen'
                    : 'Equipment Training & Proficiencies'}
                </label>
              </div>
            </div>

            <div className='col-md-4'>
              <div className='d-and-d-box gray'>
                <div className='row'>
                  <div className='col-3 pr-1'>
                    <StatBox2
                      classes='shield'
                      labelTop={this.props.german ? 'Rüstungs-' : 'Armour'}
                      label={this.props.german ? 'klasse' : 'Class'}
                      name='ac'
                      value={character.ac}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                    <label style={{fontSize: '10px', display: 'block', textAlign: 'center'}}>
                      <input
                        type='checkbox'
                        checked={!!character.shield}
                        onChange={(e) =>
                          this.updateCharacter('shield', e.target.checked)
                        }
                      />{' '}
                      {this.props.german ? 'Schild' : 'Shield'}
                    </label>
                  </div>
                  <div className='col-3 pr-1 pl-1'>
                    <StatBox2
                      label='Initiative'
                      name='init'
                      value={character.init}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                  </div>
                  <div className='col-3 pr-1 pl-1'>
                    <StatBox2
                      labelTop={this.props.german ? 'Bewegungs-' : ''}
                      label={this.props.german ? 'rate' : 'Speed'}
                      name='speed'
                      value={character.speed}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                  </div>
                  <div className='col-3 pl-1'>
                    <StatBox2
                      label={this.props.german ? 'Größe' : 'Size'}
                      name='size'
                      value={character.size}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
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
                      {this.props.german
                        ? 'Maximale Trefferpunkte'
                        : 'Hit Point Maximum'}
                    </label>
                    <input
                      type='text'
                      style={{width: 'calc(100% - 95px)'}}
                      className='d-and-d-linput'
                      value={character.maxHp ? character.maxHp : ''}
                      onChange={(e) =>
                        this.updateCharacter('maxHp', e.target.value)
                      }
                    />
                  </div>
                  <input
                    type='text'
                    className='d-and-d-cinput'
                    value={character.hp ? character.hp : ''}
                    onChange={(e) => this.updateCharacter('hp', e.target.value)}
                  />
                  <label className='d-and-d-title' style={{marginTop: '5px'}}>
                    {this.props.german
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
                      this.updateCharacter('tempHp', e.target.value)
                    }
                  />
                  <label className='d-and-d-title' style={{marginTop: '5px'}}>
                    {this.props.german
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
                        <label style={{width: '40px'}}>
                          {this.props.german ? 'Max' : 'Max'}
                        </label>
                        <input
                          type='text'
                          style={{width: 'calc(100% - 40px)'}}
                          className='d-and-d-linput'
                          value={
                            character.hitDiceMax ? character.hitDiceMax : ''
                          }
                          onChange={(e) =>
                            this.updateCharacter('hitDiceMax', e.target.value)
                          }
                        />
                      </div>
                      <input
                        type='text'
                        className='d-and-d-cinput'
                        value={character.hitDice ? character.hitDice : ''}
                        onChange={(e) =>
                          this.updateCharacter('hitDice', e.target.value)
                        }
                      />
                      <label
                        className='d-and-d-title'
                        style={{marginTop: '5px'}}
                      >
                        {this.props.german
                          ? 'Trefferwürfel (Verbraucht)'
                          : 'Hit Dice (Spent)'}
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
                        label={this.props.german ? 'Erfolge' : 'Successes'}
                        name='deathsaveSuccesses'
                        value={character.deathsaveSuccesses}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <DeathSave
                        classes='d-and-d-save-failure'
                        label={this.props.german ? 'Fehlschläge' : 'Failures'}
                        name='deathsaveFailures'
                        value={character.deathsaveFailures}
                        onChange={(name: string, value: any) => {
                          this.updateCharacter(name, value)
                        }}
                      />
                      <label
                        className='d-and-d-title'
                        style={{marginTop: '6px'}}
                      >
                        {this.props.german ? 'Todes Würfe' : 'Death Saves'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className='d-and-d-box mt-3'>
                <AttackTable
                  rows={6}
                  name='attacks'
                  value={character.attacks}
                  onChange={(name: string, value: any) => {
                    this.updateCharacter(name, value)
                  }}
                  german={this.props.german}
                />
                <label className='d-and-d-title' style={{marginTop: '10px'}}>
                  {this.props.german
                    ? 'Waffen & Schadenszauber'
                    : 'Weapons & Damage Cantrips'}
                </label>
              </div>
            </div>

            <div className='col-md-4'>
              <div className='d-and-d-box'>
                <textarea
                  style={{paddingBottom: '5px'}}
                  value={
                    character.classFeatures ? character.classFeatures : ''
                  }
                  onChange={(e) =>
                    this.updateCharacter('classFeatures', e.target.value)
                  }
                  rows={18}
                />
                <label className='d-and-d-title' style={{marginTop: '10px'}}>
                  {this.props.german ? 'Klassenmerkmale' : 'Class Features'}
                </label>
              </div>
              <div className='d-and-d-box mt-3'>
                <textarea
                  style={{paddingBottom: '5px'}}
                  value={
                    character.speciesTraits ? character.speciesTraits : ''
                  }
                  onChange={(e) =>
                    this.updateCharacter('speciesTraits', e.target.value)
                  }
                  rows={9}
                />
                <label className='d-and-d-title' style={{marginTop: '10px'}}>
                  {this.props.german ? 'Speziesmerkmale' : 'Species Traits'}
                </label>
              </div>
              <div className='d-and-d-box mt-3'>
                <textarea
                  style={{paddingBottom: '5px'}}
                  value={character.feats ? character.feats : ''}
                  onChange={(e) =>
                    this.updateCharacter('feats', e.target.value)
                  }
                  rows={9}
                />
                <label className='d-and-d-title' style={{marginTop: '10px'}}>
                  {this.props.german ? 'Talente' : 'Feats'}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default DnDCharacterStatsSheet;
