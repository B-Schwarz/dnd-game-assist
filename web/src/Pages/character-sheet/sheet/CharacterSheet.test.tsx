import React, {useState} from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import CharacterSheet from './CharacterSheet';
import {Color, DnDCharacter} from './dnd-character';

// Renders the sheet as a controlled component, mirroring how the page wires it:
// onCharacterChanged feeds the next character straight back in as props. The
// backstory attachment is a server-side concern, so its name/callbacks are
// passed through here just like the real page does.
const Harness = (props: {
    initial: DnDCharacter
    attachmentName?: string
    onUploadAttachment?: (file: File) => void
    onDownloadAttachment?: () => void
}) => {
    const [character, setCharacter] = useState<DnDCharacter>(props.initial);
    return <CharacterSheet character={character} onCharacterChanged={setCharacter}
                           attachmentName={props.attachmentName}
                           onUploadAttachment={props.onUploadAttachment}
                           onDownloadAttachment={props.onDownloadAttachment}/>;
};

describe('CharacterSheet', () => {
    // The language choice persists to localStorage; reset it so each test
    // starts in English regardless of order (the DE test sets it to 'de').
    beforeEach(() => {
        localStorage.removeItem('dnd-character-language');
    });

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

    it('defaults to English and persists the DE choice to localStorage', () => {
        localStorage.removeItem('dnd-character-language');
        render(<Harness initial={{}}/>);

        // default English label present, German one not yet
        expect(screen.getByText('Player Name')).toBeInTheDocument();
        expect(screen.queryByText('Name des Spielers')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: /EN \/ DE/i}));

        expect(localStorage.getItem('dnd-character-language')).toBe('de');
        expect(screen.getByText('Name des Spielers')).toBeInTheDocument();
    });

    it('shows the chosen marker colour on the picker', () => {
        const {container} = render(<Harness initial={{color: Color.RED}}/>);
        const select = container.querySelector('select') as HTMLSelectElement;
        expect(select.value).toBe(String(Color.RED));
    });

    it('renders and edits the two page-1 equipment columns', () => {
        render(<Harness initial={{equipment: 'Longsword', equipment2: 'Backpack'}}/>);
        expect(screen.getByDisplayValue('Longsword')).toBeInTheDocument();
        const eq2 = screen.getByDisplayValue('Backpack');
        fireEvent.change(eq2, {target: {value: 'Rope'}});
        expect(screen.getByDisplayValue('Rope')).toBeInTheDocument();
    });

    it('keeps the coins inputs in the equipment column but drops the "Coins" heading', () => {
        render(<Harness initial={{gp: '15'}}/>);
        expect(screen.getByDisplayValue('15')).toBeInTheDocument();
        expect(screen.getByText('GP')).toBeInTheDocument();     // per-coin label stays
        expect(screen.queryByText('Coins')).not.toBeInTheDocument(); // heading removed
    });

    it('disables the file download until an attachment name is provided', () => {
        render(<Harness initial={{}}/>);
        expect(screen.getByRole('button', {name: 'Download file'})).toBeDisabled();
        expect(screen.getByText('No file attached')).toBeInTheDocument();
    });

    it('shows the attachment name and enables its download when present', () => {
        const onDownloadAttachment = vi.fn();
        render(<Harness initial={{}} attachmentName='lore.txt' onDownloadAttachment={onDownloadAttachment}/>);
        expect(screen.getByText('lore.txt')).toBeInTheDocument();
        const dl = screen.getByRole('button', {name: 'Download file'});
        expect(dl).toBeEnabled();
        fireEvent.click(dl);
        expect(onDownloadAttachment).toHaveBeenCalledTimes(1);
    });

    it('forwards a selected backstory file to onUploadAttachment', () => {
        const onUploadAttachment = vi.fn();
        const {container} = render(<Harness initial={{}} onUploadAttachment={onUploadAttachment}/>);
        const input = container.querySelector('#dnd-attach-file') as HTMLInputElement;
        const file = new File(['hello world'], 'notes.txt', {type: 'text/plain'});
        fireEvent.change(input, {target: {files: [file]}});
        expect(onUploadAttachment).toHaveBeenCalledTimes(1);
        expect(onUploadAttachment.mock.calls[0][0]).toBe(file);
    });

    it('rejects an attachment larger than the 100 MB cap without uploading', () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const onUploadAttachment = vi.fn();
        const {container} = render(<Harness initial={{}} onUploadAttachment={onUploadAttachment}/>);
        const input = container.querySelector('#dnd-attach-file') as HTMLInputElement;
        const big = new File(['x'], 'huge.pdf', {type: 'application/pdf'});
        Object.defineProperty(big, 'size', {value: 100000001});
        fireEvent.change(input, {target: {files: [big]}});
        expect(alertSpy).toHaveBeenCalled();
        expect(onUploadAttachment).not.toHaveBeenCalled();
        alertSpy.mockRestore();
    });

    it('disables the image download when there is no appearance image', () => {
        render(<Harness initial={{}}/>);
        expect(screen.getByRole('button', {name: 'Download image'})).toBeDisabled();
    });

    it('enables the image download when an appearance image is present', () => {
        render(<Harness initial={{appearance: 'data:image/png;base64,iVBORw0KGgo='}}/>);
        expect(screen.getByRole('button', {name: 'Download image'})).toBeEnabled();
    });
});
