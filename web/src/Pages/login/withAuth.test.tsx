import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';

// Controllable /api/me response. Named `mock*` so Jest's hoisted factory may
// reference it; a plain function so resetMocks:true doesn't wipe it.
let mockMe: () => Promise<any> = () => Promise.reject({response: {status: 401}});
jest.mock('axios', () => ({
    get: (...args: any[]) => mockMe(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

import WithAuth from './withAuth';

const Protected = WithAuth(() => <div>secret content</div>);

beforeEach(() => {
    mockNavigate.mockClear();
});

describe('withAuth', () => {
    it('redirects to /login when /api/me returns 401', async () => {
        mockMe = () => Promise.reject({response: {status: 401}});
        render(<Protected/>);
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
    });

    it('renders the wrapped component and does not redirect when authenticated', async () => {
        mockMe = () => Promise.resolve({status: 200});
        render(<Protected/>);
        expect(await screen.findByText('secret content')).toBeInTheDocument();
        await waitFor(() => {
        });
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
