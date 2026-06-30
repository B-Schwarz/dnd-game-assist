import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';

// vi.mock factories are hoisted above the imports, so anything they reference
// must be hoisted too — vi.hoisted runs before the mocks are registered.
// `me` is mutable so each test can choose the /api/me response; it stays a plain
// function (not vi.fn) so mockReset:true doesn't wipe it.
const h = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    me: {fn: (() => Promise.reject({response: {status: 401}})) as () => Promise<any>},
}));

// axios is consumed via a default import, so expose the mock as `default`.
vi.mock('axios', () => ({
    default: {get: (..._args: any[]) => h.me.fn()},
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => h.mockNavigate,
}));

import WithAuth from './withAuth';

const Protected = WithAuth(() => <div>secret content</div>);

beforeEach(() => {
    h.mockNavigate.mockClear();
});

describe('withAuth', () => {
    it('redirects to /login when /api/me returns 401', async () => {
        h.me.fn = () => Promise.reject({response: {status: 401}});
        render(<Protected/>);
        await waitFor(() => expect(h.mockNavigate).toHaveBeenCalledWith('/login'));
    });

    it('renders the wrapped component and does not redirect when authenticated', async () => {
        h.me.fn = () => Promise.resolve({status: 200});
        render(<Protected/>);
        expect(await screen.findByText('secret content')).toBeInTheDocument();
        await waitFor(() => {
        });
        expect(h.mockNavigate).not.toHaveBeenCalled();
    });
});
