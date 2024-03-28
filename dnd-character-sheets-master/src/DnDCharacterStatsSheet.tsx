import React from 'react'

// eslint-disable-next-line no-unused-vars
import DnDCharacter from './DnDCharacter'

import Statbox from './Components/StatBox'
import StatRow from './Components/StatRow'
import Skill from './Components/Skill'
import StatBox2 from './Components/StatBox2'
import DeathSave from './Components/DeathSave'
import AttackTable from './Components/AttackTable'
import Currency from './Components/Currency'

import { TfiReload } from 'react-icons/tfi'

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
  character: DnDCharacter
}

const initialState: IDnDCharacterStatsSheetState = {
  character: {}
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
    this.state = initialState
  }

  updateCharacter(name: string, value: any) {
    const oldCharacter = this.getCharacter()
    const newCharacter: DnDCharacter = {}
    Object.assign(newCharacter, oldCharacter)
    newCharacter[name] = value

    if (!this.props.character) {
      // NOT CONTROLLED
      this.setState({ character: newCharacter })
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

  calculateTalents() {
    const character = this.props.character

    if (character) {
      character.skillAcrobatics = character.dex
      if (character.skillAcrobaticsExpert) {
        character.skillAcrobatics = String(
          Number(character.dex) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillAcrobaticsChecked) {
        character.skillAcrobatics = String(
          Number(character.dex) + Number(character.proficiencyBonus)
        )
      }

      character.skillAnimalHandling = character.wis
      if (character.skillAnimalHandlingExpert) {
        character.skillAnimalHandling = String(
          Number(character.wis) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillAnimalHandlingChecked) {
        character.skillAnimalHandling = String(
          Number(character.wis) + Number(character.proficiencyBonus)
        )
      }

      character.skillArcana = character.int
      if (character.skillArcanaExpert) {
        character.skillArcana = String(
          Number(character.int) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillArcanaChecked) {
        character.skillArcana = String(
          Number(character.int) + Number(character.proficiencyBonus)
        )
      }

      character.skillAthletics = character.str
      if (character.skillAthleticsExpert) {
        character.skillAthletics = String(
          Number(character.str) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillAthleticsChecked) {
        character.skillAthletics = String(
          Number(character.str) + Number(character.proficiencyBonus)
        )
      }

      character.skillDeception = character.cha
      if (character.skillDeceptionExpert) {
        character.skillDeception = String(
          Number(character.cha) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillDeceptionChecked) {
        character.skillDeception = String(
          Number(character.cha) + Number(character.proficiencyBonus)
        )
      }

      character.skillHistory = character.int
      if (character.skillHistoryExpert) {
        character.skillHistory = String(
          Number(character.int) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillHistoryChecked) {
        character.skillHistory = String(
          Number(character.int) + Number(character.proficiencyBonus)
        )
      }

      character.skillInsight = character.wis
      if (character.skillInsightExpert) {
        character.skillInsight = String(
          Number(character.wis) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillInsightChecked) {
        character.skillInsight = String(
          Number(character.wis) + Number(character.proficiencyBonus)
        )
      }

      character.skillIntimidation = character.cha
      if (character.skillIntimidationExpert) {
        character.skillIntimidation = String(
          Number(character.cha) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillIntimidationChecked) {
        character.skillIntimidation = String(
          Number(character.cha) + Number(character.proficiencyBonus)
        )
      }

      character.skillInvestigation = character.int
      if (character.skillInvestigationExpert) {
        character.skillInvestigation = String(
          Number(character.int) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillInvestigationChecked) {
        character.skillInvestigation = String(
          Number(character.int) + Number(character.proficiencyBonus)
        )
      }

      character.skillMedicine = character.wis
      if (character.skillMedicineExpert) {
        character.skillMedicine = String(
          Number(character.wis) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillMedicineChecked) {
        character.skillMedicine = String(
          Number(character.wis) + Number(character.proficiencyBonus)
        )
      }

      character.skillNature = character.int
      if (character.skillNatureExpert) {
        character.skillMedicine = String(
          Number(character.int) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillNatureChecked) {
        character.skillNature = String(
          Number(character.int) + Number(character.proficiencyBonus)
        )
      }

      character.skillPerception = character.wis
      if (character.skillPerceptionExpert) {
        character.skillPerception = String(
          Number(character.wis) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillPerceptionChecked) {
        character.skillPerception = String(
          Number(character.wis) + Number(character.proficiencyBonus)
        )
      }

      character.skillPerformance = character.cha
      if (character.skillPerformanceExpert) {
        character.skillPerformance = String(
          Number(character.cha) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillPerformanceChecked) {
        character.skillPerformance = String(
          Number(character.cha) + Number(character.proficiencyBonus)
        )
      }

      character.skillPersuasion = character.cha
      if (character.skillPersuasionExpert) {
        character.skillPersuasion = String(
          Number(character.cha) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillPersuasionChecked) {
        character.skillPersuasion = String(
          Number(character.cha) + Number(character.proficiencyBonus)
        )
      }

      character.skillReligion = character.int
      if (character.skillReligionExpert) {
        character.skillReligion = String(
          Number(character.int) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillReligionChecked) {
        character.skillReligion = String(
          Number(character.int) + Number(character.proficiencyBonus)
        )
      }

      character.skillSlightOfHand = character.dex
      if (character.skillSlightOfHandExpert) {
        character.skillSlightOfHand = String(
          Number(character.dex) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillSlightOfHandChecked) {
        character.skillSlightOfHand = String(
          Number(character.dex) + Number(character.proficiencyBonus)
        )
      }

      character.skillStealth = character.dex
      if (character.skillStealthExpert) {
        character.skillStealth = String(
          Number(character.dex) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillStealthChecked) {
        character.skillStealth = String(
          Number(character.dex) + Number(character.proficiencyBonus)
        )
      }

      character.skillSurvival = character.wis
      if (character.skillSurvivalExpert) {
        character.skillSurvival = String(
          Number(character.wis) +
            Number(character.proficiencyBonus) +
            Number(character.proficiencyBonus)
        )
      } else if (character.skillSurvivalChecked) {
        character.skillSurvival = String(
          Number(character.wis) + Number(character.proficiencyBonus)
        )
      }
    }
  }

  render() {
    const character = this.getCharacter()

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
                        this.updateCharacter('classLevel', e.target.value)
                      }
                    />
                    <label>
                      {this.props.german ? 'Klasse & Stufe' : 'Class & Level'}
                    </label>
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
                  <div className='col-md-3 col-6 pl-0 pr-0'>
                    <input
                      type='text'
                      value={character.playerName ? character.playerName : ''}
                      onChange={(e) =>
                        this.updateCharacter('playerName', e.target.value)
                      }
                    />
                    <label>
                      {this.props.german ? 'Name des Spielers' : 'Player Name'}
                    </label>
                  </div>
                  <div className='col-md-3 col-6 pl-0 pr-0'>
                    <input
                      type='text'
                      value={character.faction ? character.faction : ''}
                      onChange={(e) =>
                        this.updateCharacter('faction', e.target.value)
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
                        this.updateCharacter('race', e.target.value)
                      }
                    />
                    <label>{this.props.german ? 'Volk' : 'Ancestry'}</label>
                  </div>
                  <div className='col-md-3 col-6 pl-0 pr-0'>
                    <input
                      type='text'
                      value={character.alignment ? character.alignment : ''}
                      onChange={(e) =>
                        this.updateCharacter('alignment', e.target.value)
                      }
                    />
                    <label>
                      {this.props.german ? 'Gesinnung' : 'Alignment'}
                    </label>
                  </div>
                  <div className='col-md-3 col-6 pl-0 pr-0'>
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
                  <div className='col-md-3 col-6 pl-0 pr-0'>
                    <input
                      type='text'
                      value={character.dciNo ? character.dciNo : ''}
                      onChange={(e) =>
                        this.updateCharacter('dciNo', e.target.value)
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
                  </div>
                </div>
                <div className='col-8'>
                  <StatRow
                    label='Inspiration'
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
                    <div style={{ textAlign: 'left' }}>
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
                      style={{ marginTop: '10px' }}
                    >
                      {this.props.german ? 'Rettungswürfe' : 'Saving Throws'}
                    </label>
                  </div>
                  <div className='d-and-d-box'>
                    <div style={{ textAlign: 'left' }}>
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
                      style={{ marginTop: '10px' }}
                    >
                      {this.props.german ? 'Fertigkeiten' : 'Skills'}
                    </label>
                    <button onClick={this.calculateTalents}>
                      <TfiReload />
                    </button>
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
                <textarea
                  value={
                    character.otherProficiencies
                      ? character.otherProficiencies
                      : ''
                  }
                  onChange={(e) =>
                    this.updateCharacter('otherProficiencies', e.target.value)
                  }
                  rows={12}
                />
                <label className='d-and-d-title' style={{ marginTop: '10px' }}>
                  {this.props.german
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
                      labelTop={this.props.german ? 'Rüstungs-' : 'Armour'}
                      label={this.props.german ? 'klasse' : 'Class'}
                      name='ac'
                      value={character.ac}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                  </div>
                  <div className='col-4 pr-2 pl-2'>
                    <StatBox2
                      label='Initiative'
                      name='init'
                      value={character.init}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                  </div>
                  <div className='col-4 pl-2'>
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
                    <label style={{ width: '95px' }}>
                      {this.props.german
                        ? 'Trefferpunkte Maximum'
                        : 'Hit Point Maximum'}
                    </label>
                    <input
                      type='text'
                      style={{ width: 'calc(100% - 95px)' }}
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
                  <label className='d-and-d-title' style={{ marginTop: '5px' }}>
                    {this.props.german
                      ? 'Aktuelle Trefferpunkte'
                      : 'Current Hit Points'}
                  </label>
                </div>
                <div
                  className='d-and-d-box white mb-2'
                  style={{ borderRadius: '0 0 8px 8px', paddingBottom: '5px' }}
                >
                  <input
                    type='text'
                    className='d-and-d-cinput'
                    value={character.tempHp ? character.tempHp : ''}
                    onChange={(e) =>
                      this.updateCharacter('tempHp', e.target.value)
                    }
                  />
                  <label className='d-and-d-title' style={{ marginTop: '5px' }}>
                    {this.props.german
                      ? 'Temporäre Trefferpunkte'
                      : 'Temporary Hit Points'}
                  </label>
                </div>

                <div className='row mt-1'>
                  <div className='col-6 pr-1'>
                    <div
                      className='d-and-d-box white mb-0'
                      style={{ paddingBottom: '5px' }}
                    >
                      <div className='d-and-d-gray-text'>
                        <label style={{ width: '25px' }}>
                          {this.props.german ? 'Gesamt' : 'Total'}
                        </label>
                        <input
                          type='text'
                          style={{ width: 'calc(100% - 25px)' }}
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
                        style={{ marginTop: '5px' }}
                      >
                        {this.props.german ? 'Trefferwürfel' : 'Hit Dice'}
                      </label>
                    </div>
                  </div>
                  <div className='col-6 pl-1'>
                    <div
                      className='d-and-d-box white mb-0'
                      style={{ paddingBottom: '5px' }}
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
                        style={{ marginTop: '6px' }}
                      >
                        {this.props.german ? 'Todes Würfe' : 'Death Saves'}
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
                    this.updateCharacter(name, value)
                  }}
                  german={this.props.german}
                />
                <textarea
                  value={character.attacksText ? character.attacksText : ''}
                  onChange={(e) =>
                    this.updateCharacter('attacksText', e.target.value)
                  }
                  rows={6}
                />
                <label className='d-and-d-title' style={{ marginTop: '10px' }}>
                  {this.props.german
                    ? 'Angriffe & Zauber'
                    : 'Attacks & Spellcasting'}
                </label>
              </div>

              <div className='d-and-d-box mt-4'>
                <div className='row'>
                  <div className='' style={{ width: '100px' }}>
                    <Currency
                      label={this.props.german ? 'KM' : 'CP'}
                      name='cp'
                      value={character.cp}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                    <Currency
                      label={this.props.german ? 'SM' : 'SP'}
                      name='sp'
                      value={character.sp}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                    <Currency
                      label={this.props.german ? 'EM' : 'EP'}
                      name='ep'
                      value={character.ep}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                    <Currency
                      label={this.props.german ? 'GM' : 'GP'}
                      name='gp'
                      value={character.gp}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                    <Currency
                      label={this.props.german ? 'PM' : 'PP'}
                      name='pp'
                      value={character.pp}
                      onChange={(name: string, value: any) => {
                        this.updateCharacter(name, value)
                      }}
                    />
                  </div>
                  <div className='col'>
                    <textarea
                      className='d-and-d-equipment-indent'
                      value={character.equipment ? character.equipment : ''}
                      onChange={(e) =>
                        this.updateCharacter('equipment', e.target.value)
                      }
                      rows={10}
                    />
                  </div>
                  <div className='col-md-12'>
                    <textarea
                      value={character.equipment2 ? character.equipment2 : ''}
                      onChange={(e) =>
                        this.updateCharacter('equipment2', e.target.value)
                      }
                      rows={4}
                    />
                  </div>
                </div>
                <label className='d-and-d-title' style={{ marginTop: '10px' }}>
                  {this.props.german ? 'Ausrüstung' : 'Equipment'}
                </label>
              </div>
            </div>

            <div className='col-md-4'>
              <div
                className='d-and-d-box gray'
                style={{ marginBottom: '17px' }}
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
                      this.updateCharacter('personalityTraits', e.target.value)
                    }
                    rows={3}
                  />
                  <label className='d-and-d-title'>
                    {this.props.german
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
                      this.updateCharacter('ideals', e.target.value)
                    }
                    rows={3}
                  />
                  <label className='d-and-d-title'>
                    {this.props.german ? 'Ideale' : 'Ideals'}
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
                      this.updateCharacter('bonds', e.target.value)
                    }
                    rows={2}
                  />
                  <label className='d-and-d-title'>
                    {this.props.german ? 'Bindungen' : 'Bonds'}
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
                      this.updateCharacter('flaws', e.target.value)
                    }
                    rows={2}
                  />
                  <label className='d-and-d-title'>
                    {this.props.german ? 'Makel' : 'Flaws'}
                  </label>
                </div>
              </div>
              <div className='d-and-d-box mt-3'>
                <textarea
                  style={{ paddingBottom: '5px' }}
                  value={
                    character.featuresTraits ? character.featuresTraits : ''
                  }
                  onChange={(e) =>
                    this.updateCharacter('featuresTraits', e.target.value)
                  }
                  rows={27}
                />
                <label className='d-and-d-title' style={{ marginTop: '10px' }}>
                  {this.props.german ? 'Merkmale' : 'Features & Traits'}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default DnDCharacterStatsSheet
