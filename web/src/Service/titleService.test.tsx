import React from 'react';
import {render, waitFor} from '@testing-library/react';
import TitleService from './titleService';

test('sets the document title with the app suffix', async () => {
    render(<TitleService title="Initiative"/>);
    await waitFor(() => expect(document.title).toBe('Initiative | D&D Companion'));
});
