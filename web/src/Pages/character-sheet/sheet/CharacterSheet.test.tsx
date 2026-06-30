import React, {useState} from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import CharacterSheet from './CharacterSheet';
import {Color, DnDCharacter} from './dnd-character';

// Renders the sheet as a controlled component, mirroring how the page wires it:
// onCharacterChanged feeds the next character straight back in as props.
const Harness = (props: {initial: DnDCharacter}) => {
    const [character, setCharacter] = useState<DnDCharacter>(props.initial);
    return <CharacterSheet character={character} onCharacterChanged={setCharacter}/>;
};

describe('CharacterSheet', () => {
    it('renders ability modifiers derived from the scores', () => {
        render(<Harness initial={{str: '16', dex: '8'}}/>);
        // 16 -> +3, 8 -> -1 (both shown in readonly modifier inputs)
        expect(screen.getByDisplayValue('+3')).toBeInTheDocument();
        expect(screen.getByDisplayValue('-1')).toBeInTheDocument();
    });

    it('updates the modifier when an ability score changes', () => {
        render(<Harness initial={{str: '10'}}/>);
        const scoreInput = screen.getByDisplayValue('10');
        fireEvent.change(scoreInput, {target: {value: '20'}});
        expect(screen.getByDisplayValue('+5')).toBeInTheDocument();
    });

    it('fills the HP bar to the current/max ratio', () => {
        const {container} = render(<Harness initial={{hp: '5', maxHp: '20'}}/>);
        const fill = container.querySelector('.dnd-hpbar-fill') as HTMLElement;
        expect(fill).toBeInTheDocument();
        expect(fill.style.width).toBe('25%');
    });

    it('recalculates saves and skills from the proficiency bonus', () => {
        render(
            <Harness initial={{
                dex: '14',            // +2 modifier
                proficiencyBonus: '3',
                dexSaveChecked: 'normal',     // proficient save: +2 +3 = 5
                skillStealthChecked: 'expert', // expertise: +2 +2*3 = 8
            }}/>
        );
        fireEvent.click(screen.getByText(/Re-Calculate Modifiers/i));
        expect(screen.getByDisplayValue('5')).toBeInTheDocument();  // dex save
        expect(screen.getByDisplayValue('8')).toBeInTheDocument();  // stealth
    });

    it('exposes the EN/DE language toggle', () => {
        render(<Harness initial={{}}/>);
        // default is English; the toggle button shows both labels
        const toggle = screen.getByRole('button', {name: /EN \/ DE/i});
        expect(toggle).toBeInTheDocument();
    });

    it('shows the chosen marker colour on the picker', () => {
        const {container} = render(<Harness initial={{color: Color.RED}}/>);
        const select = container.querySelector('select') as HTMLSelectElement;
        expect(select.value).toBe(String(Color.RED));
    });
});
