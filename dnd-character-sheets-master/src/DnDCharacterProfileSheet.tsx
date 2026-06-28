/* eslint-disable prettier/prettier */
import React from 'react'

// eslint-disable-next-line no-unused-vars
import DnDCharacter from './DnDCharacter'

import Image from './Components/Image'
import Currency from './Components/Currency'

import './dndstyles.css'

interface IDnDCharacterProfileSheetProps {
  character?: DnDCharacter
  defaultCharacter?: DnDCharacter
  onCharacterChanged?: (
    character: DnDCharacter,
    changedField: string,
    newValue: any
  ) => void
  german: boolean
}

interface IDnDCharacterProfileSheetState {
  character: DnDCharacter
}

const initialState: IDnDCharacterProfileSheetState = {
  character: {}
}

class DnDCharacterProfileSheet extends React.Component<
  IDnDCharacterProfileSheetProps,
  IDnDCharacterProfileSheetState
> {
  constructor(props: IDnDCharacterProfileSheetProps) {
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

  render() {
    const character = this.getCharacter()

    return (
      <div className='d-and-d-character-sheet container-xl mt-5 mb-5'>
        <div>
          <div className='row'>
            <div className='col-md-6'>
              <div className='d-and-d-box square'>
                <Image
                  name='appearance'
                  value={character.appearance}
                  onChange={(name: string, value: any) => {
                    this.updateCharacter(name, value)
                  }}
                />
                <label className='d-and-d-title' style={{ marginTop: '10px' }}>
                  {this.props.german ? 'Aussehen' : 'Appearance'}
                </label>
              </div>

              <div className='d-and-d-box mt-3'>
                <textarea
                  style={{ paddingBottom: '5px' }}
                  value={character.backstory ? character.backstory : ''}
                  onChange={(e) =>
                    this.updateCharacter('backstory', e.target.value)
                  }
                  rows={18}
                />
                <div className='d-and-d-gray-text' style={{ paddingBottom: '1px' }}>
                  <label style={{ width: '70px' }}>
                    {this.props.german ? 'Gesinnung' : 'Alignment'}
                  </label>
                  <input
                    type='text'
                    style={{ width: 'calc(100% - 70px)' }}
                    className='d-and-d-linput'
                    value={character.alignment ? character.alignment : ''}
                    onChange={(e) =>
                      this.updateCharacter('alignment', e.target.value)
                    }
                  />
                </div>
                <label className='d-and-d-title' style={{ marginTop: '10px' }}>
                  {this.props.german
                    ? 'Hintergrund & Persönlichkeit'
                    : 'Backstory & Personality'}
                </label>
              </div>

              <div className='d-and-d-box mt-3'>
                <textarea
                  style={{ paddingBottom: '5px' }}
                  value={character.languages ? character.languages : ''}
                  onChange={(e) =>
                    this.updateCharacter('languages', e.target.value)
                  }
                  rows={6}
                />
                <label className='d-and-d-title' style={{ marginTop: '10px' }}>
                  {this.props.german ? 'Sprachen' : 'Languages'}
                </label>
              </div>
            </div>

            <div className='col-md-6'>
              <div className='d-and-d-box'>
                <textarea
                  style={{ paddingBottom: '5px' }}
                  value={character.equipment ? character.equipment : ''}
                  onChange={(e) =>
                    this.updateCharacter('equipment', e.target.value)
                  }
                  rows={20}
                />
                <div className='d-and-d-gray-text' style={{ paddingBottom: '1px' }}>
                  <label style={{ width: '100%', textAlign: 'left' }}>
                    {this.props.german
                      ? 'Magische Gegenstände (Einstimmung)'
                      : 'Magic Item Attunement'}
                  </label>
                </div>
                <input
                  type='text'
                  className='d-and-d-linput'
                  style={{ width: '100%' }}
                  value={character.attunement1 ? character.attunement1 : ''}
                  onChange={(e) =>
                    this.updateCharacter('attunement1', e.target.value)
                  }
                />
                <input
                  type='text'
                  className='d-and-d-linput'
                  style={{ width: '100%' }}
                  value={character.attunement2 ? character.attunement2 : ''}
                  onChange={(e) =>
                    this.updateCharacter('attunement2', e.target.value)
                  }
                />
                <input
                  type='text'
                  className='d-and-d-linput'
                  style={{ width: '100%' }}
                  value={character.attunement3 ? character.attunement3 : ''}
                  onChange={(e) =>
                    this.updateCharacter('attunement3', e.target.value)
                  }
                />
                <label className='d-and-d-title' style={{ marginTop: '10px' }}>
                  {this.props.german ? 'Ausrüstung' : 'Equipment'}
                </label>
              </div>

              <div className='d-and-d-box mt-3'>
                <div className='row'>
                  <div className='' style={{ width: '120px' }}>
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
                </div>
                <label className='d-and-d-title' style={{ marginTop: '10px' }}>
                  {this.props.german ? 'Münzen' : 'Coins'}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default DnDCharacterProfileSheet
