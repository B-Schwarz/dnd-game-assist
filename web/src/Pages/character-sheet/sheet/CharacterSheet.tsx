import React, {useEffect, useRef, useState} from 'react'
import {Color, DnDCharacter} from './dnd-character'
import './character-sheet.css'

interface Props {
    character: DnDCharacter
    onCharacterChanged: (character: DnDCharacter) => void
}

interface SkillDef {
    field: string
    en: string
    de: string
}

interface AbilityDef {
    key: string
    en: string
    de: string
    hint: string
    skills: SkillDef[]
}

const ABILITIES: AbilityDef[] = [
    {
        key: 'str', en: 'Strength', de: 'Stärke', hint: 'Str', skills: [
            {field: 'skillAthletics', en: 'Athletics', de: 'Athletik'}
        ]
    },
    {
        key: 'dex', en: 'Dexterity', de: 'Geschicklichkeit', hint: 'Dex', skills: [
            {field: 'skillAcrobatics', en: 'Acrobatics', de: 'Akrobatik'},
            {field: 'skillSlightOfHand', en: 'Sleight of Hand', de: 'Fingerfertigkeit'},
            {field: 'skillStealth', en: 'Stealth', de: 'Heimlichkeit'}
        ]
    },
    {key: 'con', en: 'Constitution', de: 'Konstitution', hint: 'Con', skills: []},
    {
        key: 'int', en: 'Intelligence', de: 'Intelligenz', hint: 'Int', skills: [
            {field: 'skillArcana', en: 'Arcana', de: 'Arkane Kunde'},
            {field: 'skillHistory', en: 'History', de: 'Geschichte'},
            {field: 'skillInvestigation', en: 'Investigation', de: 'Nachforschungen'},
            {field: 'skillNature', en: 'Nature', de: 'Naturkunde'},
            {field: 'skillReligion', en: 'Religion', de: 'Religion'}
        ]
    },
    {
        key: 'wis', en: 'Wisdom', de: 'Weisheit', hint: 'Wis', skills: [
            {field: 'skillAnimalHandling', en: 'Animal Handling', de: 'Mit Tieren umgehen'},
            {field: 'skillInsight', en: 'Insight', de: 'Motiv erkennen'},
            {field: 'skillMedicine', en: 'Medicine', de: 'Medizin'},
            {field: 'skillPerception', en: 'Perception', de: 'Wahrnehmung'},
            {field: 'skillSurvival', en: 'Survival', de: 'Überlebenskunst'}
        ]
    },
    {
        key: 'cha', en: 'Charisma', de: 'Charisma', hint: 'Cha', skills: [
            {field: 'skillDeception', en: 'Deception', de: 'Täuschung'},
            {field: 'skillIntimidation', en: 'Intimidation', de: 'Einschüchtern'},
            {field: 'skillPerformance', en: 'Performance', de: 'Auftreten'},
            {field: 'skillPersuasion', en: 'Persuasion', de: 'Überzeugen'}
        ]
    }
]

// hex value for each marker Color (NONE → empty so the picker stays neutral)
const COLOR_HEX: Record<number, string> = {
    [Color.NONE]: '',
    [Color.BLACK]: '#000000',
    [Color.GREY]: '#808080',
    [Color.PURPLE]: '#7b2fbe',
    [Color.RED]: '#c0392b',
    [Color.PINK]: '#e84393',
    [Color.ORANGE]: '#e67e22',
    [Color.YELLOW]: '#f1c40f',
    [Color.GREEN]: '#27ae60',
    [Color.BLUE]: '#2980b9',
    [Color.WHITE]: '#ffffff'
}

// readable text color (black/white) for a given background hex
const contrastInk = (hex: string): string => {
    if (!hex) return ''
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.6 ? '#000' : '#fff'
}

const CharacterSheet = (props: Props) => {
    const character = props.character as any

    const [german, setGerman] = useState<boolean>(
        () => localStorage.getItem('dnd-character-language') === 'de'
    )

    const t = (en: string, de: string) => (german ? de : en)

    const toggleLang = () => {
        const next = !german
        setGerman(next)
        localStorage.setItem('dnd-character-language', next ? 'de' : 'en')
    }

    const set = (field: string, value: any) => {
        props.onCharacterChanged({...character, [field]: value})
    }

    const modOf = (score: any): string => {
        if (score === undefined || score === '' || isNaN(Number(score))) return ''
        const m = Math.floor((Number(score) - 10) / 2)
        return m >= 0 ? '+' + m : String(m)
    }

    // ----- proficiency pips (saves + skills) -----
    const profClass = (checked?: string) => {
        let c = 'pip'
        if (checked === 'normal') c += ' normal'
        if (checked === 'expert') c += ' expert'
        return c
    }

    const cycleProf = (field: string) => {
        const cur = character[field + 'Checked']
        const next = cur === 'normal' ? 'expert' : cur === 'expert' ? 'none' : 'normal'
        set(field + 'Checked', next)
    }

    const Prof = (field: string, label: React.ReactNode, hint?: string) => (
        <div className='dnd-prof' key={field}>
            <div className={profClass(character[field + 'Checked'])} onClick={() => cycleProf(field)}/>
            <input className='val' type='text' value={character[field] || ''}
                   onChange={(e) => set(field, e.target.value)}/>
            <span className='name'>{label}{hint ? <span className='hint'> ({hint})</span> : null}</span>
        </div>
    )

    const recalc = () => {
        const pb = Number(character.proficiencyBonus) || 0
        const c: any = {...character}
        const prof = (base: number, checked?: string) =>
            checked === 'expert' ? base + 2 * pb : checked === 'normal' ? base + pb : base

        ABILITIES.forEach((a) => {
            const score = character[a.key]
            const base = (score === undefined || score === '' || isNaN(Number(score)))
                ? 0 : Math.floor((Number(score) - 10) / 2)
            c[a.key + 'Save'] = String(prof(base, character[a.key + 'SaveChecked']))
            a.skills.forEach((s) => {
                c[s.field] = String(prof(base, character[s.field + 'Checked']))
            })
        })
        props.onCharacterChanged(c)
    }

    // ----- generic inputs -----
    const Txt = (field: string, label: React.ReactNode, extraClass = '') => (
        <div className='dnd-field'>
            <input className={extraClass} type='text' value={character[field] || ''}
                   onChange={(e) => set(field, e.target.value)}/>
            <label>{label}</label>
        </div>
    )

    const StatBox = (field: string, label: React.ReactNode, cls = '') => (
        <div className={'dnd-statbox' + (cls ? ' ' + cls : '')}>
            <label>{label}</label>
            <input type='text' value={character[field] || ''} onChange={(e) => set(field, e.target.value)}/>
        </div>
    )

    const Toggle = (field: string, label: React.ReactNode) => (
        <div className='dnd-toggle' onClick={() => set(field, !character[field])}>
            <div className={'pip diamond' + (character[field] ? ' on' : '')}/>
            <span>{label}</span>
        </div>
    )

    // ----- death saves / slot pips -----
    const Pips = (field: string, count: number, max: number, cls: string) => {
        const pips = []
        for (let i = 1; i <= max; i++) {
            pips.push(
                <div key={i} className={cls + (count >= i ? ' on' : '')}
                     onClick={() => set(field, count === i ? i - 1 : i)}/>
            )
        }
        return pips
    }

    // ----- arrays (attacks / spells) -----
    const setRow = (field: string, index: number, key: string, value: any) => {
        const arr = Array.isArray(character[field]) ? [...character[field]] : []
        while (arr.length <= index) arr.push({})
        arr[index] = {...arr[index], [key]: value}
        set(field, arr)
    }

    const rowVal = (field: string, index: number, key: string) => {
        const arr = character[field]
        return (Array.isArray(arr) && arr[index] && arr[index][key]) || ''
    }

    const rowFlag = (field: string, index: number, key: string) => {
        const arr = character[field]
        return Array.isArray(arr) && arr[index] && !!arr[index][key]
    }

    // ----- appearance image upload -----
    const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0]
        if (!file) return
        if (file.size > 2000000) {
            window.alert(t('Image too large (max 2 MB).', 'Bild zu groß (max 2 MB).'))
            return
        }
        const reader = new FileReader()
        reader.onload = (ev) => {
            if (ev.target && typeof ev.target.result === 'string') set('appearance', ev.target.result)
        }
        reader.readAsDataURL(file)
    }

    const renderAbility = (a: AbilityDef) => (
        <div className='dnd-card dnd-ability' key={a.key}>
            <div className='dnd-title'>{german ? a.de : a.en}</div>
            <div className='abilitycircle'>
                <input className='mod' readOnly tabIndex={-1} value={modOf(character[a.key])}/>
                <span className='modlabel'>{t('Modifier', 'Modifik.')}</span>
                <div className='scorebox'>
                    <input type='text' value={character[a.key] || ''}
                           onChange={(e) => set(a.key, e.target.value)}/>
                </div>
            </div>
            <span className='scorelabel'>{t('Score', 'Wert')}</span>
            {Prof(a.key + 'Save', t('Saving Throw', 'Rettungswurf'))}
            {a.skills.map((s) => Prof(s.field, german ? s.de : s.en))}
        </div>
    )

    const attackRows = Math.max(6, (character.attacks?.length || 0) + 1)

    // The prepared-spells table keeps natural row height and is filled with as
    // many blank rows as fit its (page-height-driven) card, recomputed on resize.
    const spellCardRef = useRef<HTMLDivElement>(null)
    const [spellFillRows, setSpellFillRows] = useState(24)

    useEffect(() => {
        const card = spellCardRef.current
        if (!card || typeof ResizeObserver === 'undefined') return

        const compute = () => {
            const table = card.querySelector('table')
            const tbody = table?.querySelector('tbody')
            const row = tbody?.querySelector('tr')
            if (!table || !tbody || !row) return
            const rowH = row.getBoundingClientRect().height
            if (!rowH) return
            const cardStyle = getComputedStyle(card)
            const contentBottom = card.getBoundingClientRect().bottom - parseFloat(cardStyle.paddingBottom)
            const avail = contentBottom - tbody.getBoundingClientRect().top
            const fit = Math.max(1, Math.floor(avail / rowH))
            setSpellFillRows((prev) => (prev === fit ? prev : fit))
        }

        compute()
        const ro = new ResizeObserver(compute)
        ro.observe(card)
        return () => ro.disconnect()
    }, [])

    const spellRows = Math.max(spellFillRows, (character.spells?.length || 0) + 1)

    // current-HP percentage for the vitals HP bar
    const hpPct = (() => {
        const cur = Number(character.hp)
        const max = Number(character.maxHp)
        if (!max || isNaN(cur) || isNaN(max)) return 0
        return Math.max(0, Math.min(100, (cur / max) * 100))
    })()

    return (
        <div className='dnd-sheet'>
            {/* toolbar: player name (left, outside the sheet) + language + color picker */}
            <div className='dnd-toolbar'>
                <div className='dnd-playername'>
                    <label>{t('Player Name', 'Name des Spielers')}</label>
                    <input type='text' value={character.playerName || ''}
                           onChange={(e) => set('playerName', e.target.value)}/>
                </div>
                <div className='dnd-toolbar-right'>
                    <button className='dnd-lang' onClick={toggleLang} type='button'>
                        <span className={german ? '' : 'on'}>EN</span> / <span className={german ? 'on' : ''}>DE</span>
                    </button>
                    <label style={{fontSize: 11, color: '#6b6b6b'}}>{t('Color', 'Farbe')}:</label>
                    <select value={character.color ?? Color.NONE}
                            style={{
                                background: COLOR_HEX[character.color ?? Color.NONE] || undefined,
                                color: contrastInk(COLOR_HEX[character.color ?? Color.NONE]) || undefined
                            }}
                            onChange={(e) => set('color', Number(e.target.value))}>
                        <option value={Color.NONE}>{t('None', 'Keine')}</option>
                        <option value={Color.BLACK}>{t('Black', 'Schwarz')}</option>
                        <option value={Color.GREY}>{t('Grey', 'Grau')}</option>
                        <option value={Color.PURPLE}>{t('Purple', 'Lila')}</option>
                        <option value={Color.RED}>{t('Red', 'Rot')}</option>
                        <option value={Color.PINK}>{t('Pink', 'Pink')}</option>
                        <option value={Color.ORANGE}>{t('Orange', 'Orange')}</option>
                        <option value={Color.YELLOW}>{t('Yellow', 'Gelb')}</option>
                        <option value={Color.GREEN}>{t('Green', 'Grün')}</option>
                        <option value={Color.BLUE}>{t('Blue', 'Blau')}</option>
                        <option value={Color.WHITE}>{t('White', 'Weiß')}</option>
                    </select>
                </div>
            </div>

            {/* ===================== PAGE 1 ===================== */}
            <div className='dnd-page'>
                <div className='dnd-header'>
                    {/* identity */}
                    <div className='dnd-card dnd-name-card'>
                        <div className='dnd-name-main'>
                            <input className='dnd-name-input' type='text' value={character.name || ''}
                                   onChange={(e) => set('name', e.target.value)}
                                   placeholder={t('Character Name', 'Charaktername')}/>
                            <label className='dnd-sublabel'>{t('Character Name', 'Charaktername')}</label>
                            <div className='grid2'>
                                {Txt('background', t('Background', 'Hintergrund'))}
                                {Txt('classLevel', t('Class', 'Klasse'))}
                                {Txt('subclass', t('Subclass', 'Unterklasse'))}
                                {Txt('race', t('Species', 'Spezies'))}
                            </div>
                        </div>
                        <div className='dnd-name-side'>
                            <label className='dnd-sublabel'>{t('Level', 'Stufe')}</label>
                            <input className='dnd-level' type='text' value={character.level || ''}
                                   onChange={(e) => set('level', e.target.value)}/>
                        </div>
                    </div>

                    {/* armor class — shield shaped, caption on top */}
                    <div className='dnd-card dnd-shield'>
                        <div className='dnd-title' style={{borderBottom: 'none', marginBottom: 0}}>{t('Armor Class', 'Rüstungsklasse')}</div>
                        <input className='dnd-ac' type='text' value={character.ac || ''}
                               onChange={(e) => set('ac', e.target.value)}/>
                        <div className='dnd-togglerow' style={{justifyContent: 'center'}}>
                            {Toggle('shield', t('Shield', 'Schild'))}
                        </div>
                    </div>

                    {/* hit points + hit dice + death saves — one box, captions on top */}
                    <div className='dnd-card dnd-vitals'>
                        <div className='dnd-vitals-row'>
                        <div className='dnd-vital hp'>
                            <div className='dnd-title'>{t('Hit Points', 'Trefferpunkte')}</div>
                            <div className='dnd-hp-grid'>
                                <div>
                                    <input type='text' value={character.hp || ''}
                                           onChange={(e) => set('hp', e.target.value)}/>
                                    <label className='dnd-sublabel'>{t('Current', 'Aktuell')}</label>
                                </div>
                                <div>
                                    <input type='text' value={character.tempHp || ''}
                                           onChange={(e) => set('tempHp', e.target.value)}/>
                                    <label className='dnd-sublabel'>{t('Temp', 'Temporär')}</label>
                                </div>
                                <div>
                                    <input type='text' value={character.maxHp || ''}
                                           onChange={(e) => set('maxHp', e.target.value)}/>
                                    <label className='dnd-sublabel'>{t('Max', 'Max')}</label>
                                </div>
                            </div>
                        </div>
                        <div className='dnd-vital dice'>
                            <div className='dnd-title'>{t('Hit Dice', 'Trefferwürfel')}</div>
                            <div className='dnd-hp-grid' style={{gridTemplateColumns: '1fr 1fr'}}>
                                <div>
                                    <input type='text' value={character.hitDice || ''}
                                           onChange={(e) => set('hitDice', e.target.value)}/>
                                    <label className='dnd-sublabel'>{t('Spent', 'Verbr.')}</label>
                                </div>
                                <div>
                                    <input type='text' value={character.hitDiceMax || ''}
                                           onChange={(e) => set('hitDiceMax', e.target.value)}/>
                                    <label className='dnd-sublabel'>{t('Max', 'Max')}</label>
                                </div>
                            </div>
                        </div>
                        <div className='dnd-vital death'>
                            <div className='dnd-title'>{t('Death Saves', 'Todeswürfe')}</div>
                            <div className='dnd-death'>
                                <span>{t('Successes', 'Erfolge')}</span>
                                <div className='pips'>
                                    {Pips('deathsaveSuccesses', character.deathsaveSuccesses || 0, 3, 'pip diamond')}
                                </div>
                                <span>{t('Failures', 'Fehlschläge')}</span>
                                <div className='pips'>
                                    {Pips('deathsaveFailures', character.deathsaveFailures || 0, 3, 'pip diamond')}
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className='dnd-hpbar' title={`${character.hp || 0} / ${character.maxHp || 0}`}>
                            <div className='dnd-hpbar-fill' style={{width: hpPct + '%'}}/>
                        </div>
                    </div>
                </div>

                <div className='dnd-band'>Dungeons &amp; Dragons</div>

                <div className='dnd-body'>
                    {/* --- left column: abilities, prof bonus, inspiration, equipment training --- */}
                    <div className='dnd-col'>
                        <div className='dnd-abilities'>
                            <div className='dnd-abilcol'>
                                <div className='dnd-minibox'>
                                    <label>{t('Proficiency Bonus', 'Übungsbonus')}</label>
                                    <input className='v' type='text' value={character.proficiencyBonus || ''}
                                           onChange={(e) => set('proficiencyBonus', e.target.value)}/>
                                </div>
                                {ABILITIES.slice(0, 3).map(renderAbility)}
                                <div className='dnd-minibox'>
                                    <label>{t('Heroic Inspiration', 'Heroische Inspiration')}</label>
                                    <input className='v' type='text' value={character.inspiration || ''}
                                           onChange={(e) => set('inspiration', e.target.value)}/>
                                </div>
                                <button className='dnd-recalc' onClick={recalc} type='button'>
                                    {t('Re-Calculate Modifiers', 'Modifikatoren neu berechnen')}
                                </button>
                            </div>
                            <div className='dnd-abilcol'>
                                {ABILITIES.slice(3).map(renderAbility)}
                            </div>
                        </div>

                        <div className='dnd-card dnd-equip'>
                            <div className='dnd-title'>{t('Equipment Training & Proficiencies', 'Ausrüstungstraining & Übungen')}</div>
                            <label className='dnd-sublabel'>{t('Armor Training', 'Rüstungstraining')}</label>
                            <div className='dnd-togglerow'>
                                {Toggle('armorTrainingLight', t('Light', 'Leicht'))}
                                {Toggle('armorTrainingMedium', t('Medium', 'Mittel'))}
                                {Toggle('armorTrainingHeavy', t('Heavy', 'Schwer'))}
                                {Toggle('armorTrainingShields', t('Shields', 'Schilde'))}
                            </div>
                            <label className='dnd-sublabel' style={{marginTop: 6}}>{t('Weapons', 'Waffen')}</label>
                            <textarea rows={2} value={character.weaponProficiencies || ''}
                                      onChange={(e) => set('weaponProficiencies', e.target.value)}/>
                            <label className='dnd-sublabel' style={{marginTop: 6}}>{t('Tools', 'Werkzeuge')}</label>
                            <textarea rows={2} value={character.toolProficiencies || ''}
                                      onChange={(e) => set('toolProficiencies', e.target.value)}/>
                        </div>
                    </div>

                    {/* --- middle column: stat row, weapons, class features --- */}
                    <div className='dnd-col'>
                        <div className='dnd-statrow'>
                            {StatBox('init', t('Initiative', 'Initiative'), 'banner')}
                            {StatBox('speed', t('Speed', 'Bewegung'), 'banner')}
                            {StatBox('size', t('Size', 'Größe'), 'banner')}
                            {StatBox('passivePerception', t('Passive Perception', 'Passive Wahrn.'), 'banner')}
                        </div>

                        <div className='dnd-card'>
                            <div className='dnd-title'>{t('Weapons & Damage Cantrips', 'Waffen & Schadenszauber')}</div>
                            <table className='dnd-table dnd-table--ruled'>
                                <thead>
                                <tr>
                                    <th style={{width: '34%'}}>{t('Name', 'Name')}</th>
                                    <th style={{width: '18%'}}>{t('Atk/DC', 'Bonus/SG')}</th>
                                    <th style={{width: '28%'}}>{t('Damage & Type', 'Schaden & Art')}</th>
                                    <th style={{width: '20%'}}>{t('Notes', 'Notizen')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {Array.from({length: attackRows}).map((_, i) => (
                                    <tr key={i}>
                                        <td><input type='text' value={rowVal('attacks', i, 'name')}
                                                   onChange={(e) => setRow('attacks', i, 'name', e.target.value)}/></td>
                                        <td><input className='center' type='text' value={rowVal('attacks', i, 'bonus')}
                                                   onChange={(e) => setRow('attacks', i, 'bonus', e.target.value)}/></td>
                                        <td><input type='text' value={rowVal('attacks', i, 'damage')}
                                                   onChange={(e) => setRow('attacks', i, 'damage', e.target.value)}/></td>
                                        <td><input type='text' value={rowVal('attacks', i, 'notes')}
                                                   onChange={(e) => setRow('attacks', i, 'notes', e.target.value)}/></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className='dnd-card'>
                            <div className='dnd-title'>{t('Class Features', 'Klassenmerkmale')}</div>
                            <div className='dnd-twocol'>
                                <textarea rows={21} value={character.classFeatures || ''}
                                          onChange={(e) => set('classFeatures', e.target.value)}/>
                                <textarea rows={21} value={character.classFeatures2 || ''}
                                          onChange={(e) => set('classFeatures2', e.target.value)}/>
                            </div>
                        </div>

                        {/* --- species traits + feats at the bottom --- */}
                        <div className='dnd-traits'>
                            <div className='dnd-card'>
                                <div className='dnd-title'>{t('Species Traits', 'Speziesmerkmale')}</div>
                                <textarea rows={7} value={character.speciesTraits || ''}
                                          onChange={(e) => set('speciesTraits', e.target.value)}/>
                            </div>
                            <div className='dnd-card'>
                                <div className='dnd-title'>{t('Feats', 'Talente')}</div>
                                <textarea rows={7} value={character.feats || ''}
                                          onChange={(e) => set('feats', e.target.value)}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===================== PAGE 2 ===================== */}
            <div className='dnd-page'>
                <div className='dnd-split'>
                    {/* --- spells --- */}
                    <div className='dnd-col'>
                        <div className='dnd-card'>
                            <div className='dnd-spellhdr'>
                                {StatBox('spellcastingAbility', t('Ability', 'Attribut'))}
                                {StatBox('spellcastingModifier', t('Modifier', 'Modifikator'))}
                                {StatBox('spellSaveDC', t('Save DC', 'Rettungs-SG'))}
                                {StatBox('spellAttackBonus', t('Atk Bonus', 'Angr.-Bonus'))}
                            </div>

                            <div className='dnd-title'>{t('Spell Slots', 'Zauberplätze')}</div>
                            {/* 3 columns, each holding 3 spell levels — Total input + Expended diamond pips, like the PDF */}
                            <div className='dnd-slots'>
                                {[[1, 2, 3], [4, 5, 6], [7, 8, 9]].map((group, gi) => (
                                    <div className='dnd-slotcol' key={gi}>
                                        <div className='dnd-slot dnd-slot-head'>
                                            <div/>
                                            <div>{t('Total', 'Gesamt')}</div>
                                            <div>{t('Expended', 'Verbraucht')}</div>
                                        </div>
                                        {group.map((lvl) => {
                                            const totalField = `lvl${lvl}SpellSlotsTotal`
                                            const expField = `lvl${lvl}SpellSlotsExpended`
                                            const total = Number(character[totalField]) || 0
                                            return (
                                                <div className='dnd-slot' key={lvl}>
                                                    <div className='dnd-slot-lvl'>{t('Lvl', 'Grad')} {lvl}</div>
                                                    <input className='tot' type='text' value={character[totalField] || ''}
                                                           onChange={(e) => set(totalField, e.target.value)}/>
                                                    <div className='dnd-slot-pips'>
                                                        {Pips(expField, character[expField] || 0, total, 'pip diamond')}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='dnd-card dnd-spellcard' ref={spellCardRef}>
                            <div className='dnd-title'>{t('Cantrips & Prepared Spells', 'Zaubertricks & vorbereitete Zauber')}</div>
                            <table className='dnd-table dnd-table--ruled'>
                                <thead>
                                <tr>
                                    <th style={{width: '8%'}}>{t('Lvl', 'Grad')}</th>
                                    <th style={{width: '30%'}}>{t('Name', 'Name')}</th>
                                    <th style={{width: '15%'}}>{t('Time', 'Zeit')}</th>
                                    <th style={{width: '12%'}}>{t('Range', 'Reichw.')}</th>
                                    <th style={{width: '13%'}} title={t(
                                        'C = Concentration, R = Ritual, M = Material',
                                        'C = Konzentration, R = Ritual, M = Material'
                                    )}>C/R/M</th>
                                    <th style={{width: '22%'}}>{t('Notes', 'Notizen')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {Array.from({length: spellRows}).map((_, i) => (
                                    <tr key={i}>
                                        <td><input className='center' type='text' value={rowVal('spells', i, 'level')}
                                                   onChange={(e) => setRow('spells', i, 'level', e.target.value)}/></td>
                                        <td><input type='text' value={rowVal('spells', i, 'name')}
                                                   onChange={(e) => setRow('spells', i, 'name', e.target.value)}/></td>
                                        <td><input type='text' value={rowVal('spells', i, 'castingTime')}
                                                   onChange={(e) => setRow('spells', i, 'castingTime', e.target.value)}/></td>
                                        <td><input type='text' value={rowVal('spells', i, 'range')}
                                                   onChange={(e) => setRow('spells', i, 'range', e.target.value)}/></td>
                                        <td style={{whiteSpace: 'nowrap'}}>
                                            {([
                                                ['concentration', t('Concentration', 'Konzentration')],
                                                ['ritual', t('Ritual', 'Ritual')],
                                                ['material', t('Material', 'Material')]
                                            ] as const).map(([flag, label]) => (
                                                <input key={flag} type='checkbox' title={label} className={`crm crm-${flag}`}
                                                       checked={rowFlag('spells', i, flag)}
                                                       onChange={(e) => setRow('spells', i, flag, e.target.checked)}/>
                                            ))}
                                        </td>
                                        <td><input type='text' value={rowVal('spells', i, 'notes')}
                                                   onChange={(e) => setRow('spells', i, 'notes', e.target.value)}/></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* --- profile --- */}
                    <div className='dnd-col'>
                        <div className='dnd-card'>
                            <div className='dnd-title'>{t('Appearance', 'Aussehen')}</div>
                            <div className='dnd-image' style={{backgroundImage: character.appearance ? `url(${character.appearance})` : ''}}
                                 onClick={() => document.getElementById('dnd-appearance-file')?.click()}/>
                            <input id='dnd-appearance-file' type='file' accept='image/*' style={{display: 'none'}}
                                   onChange={uploadImage}/>
                        </div>

                        <div className='dnd-card'>
                            <div className='dnd-title'>{t('Backstory & Personality', 'Hintergrund & Persönlichkeit')}</div>
                            <textarea rows={10} value={character.backstory || ''}
                                      onChange={(e) => set('backstory', e.target.value)}/>
                        </div>

                        <div className='dnd-card'>
                            <div className='dnd-title'>{t('Languages', 'Sprachen')}</div>
                            <textarea rows={3} value={character.languages || ''}
                                      onChange={(e) => set('languages', e.target.value)}/>
                        </div>

                        <div className='dnd-card dnd-equipcard'>
                            <div className='dnd-title'>{t('Equipment', 'Ausrüstung')}</div>
                            <textarea rows={8} value={character.equipment || ''}
                                      onChange={(e) => set('equipment', e.target.value)}/>
                            <label className='dnd-sublabel' style={{marginTop: 6}}>{t('Magic Item Attunement', 'Magische Einstimmung')}</label>
                            {[1, 2, 3].map((n) => (
                                <div className='dnd-attune' key={n}>
                                    <div className={'pip diamond' + (character[`attunement${n}Checked`] ? ' on' : '')}
                                         onClick={() => set(`attunement${n}Checked`, !character[`attunement${n}Checked`])}/>
                                    <input type='text' value={character[`attunement${n}`] || ''}
                                           onChange={(e) => set(`attunement${n}`, e.target.value)}/>
                                </div>
                            ))}
                        </div>

                        <div className='dnd-card'>
                            <div className='dnd-title'>{t('Coins', 'Münzen')}</div>
                            <div className='dnd-coins'>
                                <div><label>{t('CP', 'KM')}</label><input className='center' type='text' value={character.cp || ''}
                                            onChange={(e) => set('cp', e.target.value)}/></div>
                                <div><label>{t('SP', 'SM')}</label><input className='center' type='text' value={character.sp || ''}
                                            onChange={(e) => set('sp', e.target.value)}/></div>
                                <div><label>{t('EP', 'EM')}</label><input className='center' type='text' value={character.ep || ''}
                                            onChange={(e) => set('ep', e.target.value)}/></div>
                                <div><label>{t('GP', 'GM')}</label><input className='center' type='text' value={character.gp || ''}
                                            onChange={(e) => set('gp', e.target.value)}/></div>
                                <div><label>{t('PP', 'PM')}</label><input className='center' type='text' value={character.pp || ''}
                                            onChange={(e) => set('pp', e.target.value)}/></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CharacterSheet
