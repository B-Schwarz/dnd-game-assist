import React from 'react';
import {render} from '@testing-library/react';

// The app fires authentication probes (axios.get('/api/me', ...)) on mount.
// Mock axios so the smoke test exercises the full route/import graph without
// making real network calls; an unauthenticated 401 sends the app to /login.
// NB: plain functions, not vi.fn — the Vitest config sets mockReset:true,
// which wipes vi.fn implementations before each test (making them return
// undefined and breaking the `.then`/`.catch` chains in the mounted effects).
// axios is consumed via a default import (`import axios from 'axios'`), so the
// ESM mock must expose the same object as `default`.
vi.mock('axios', () => {
    const api = {
        defaults: {},
        get: () => Promise.reject({response: {status: 401}}),
        post: () => Promise.resolve({data: {}}),
        put: () => Promise.resolve({data: {}}),
        delete: () => Promise.resolve({data: {}}),
    };
    return {default: api};
});

import App from './App';

test('renders the app without crashing', () => {
    const {container} = render(<App/>);
    expect(container).toBeInTheDocument();
});
