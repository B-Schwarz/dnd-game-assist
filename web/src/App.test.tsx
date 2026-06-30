import React from 'react';
import {render} from '@testing-library/react';

// The app fires authentication probes (axios.get('/api/me', ...)) on mount.
// Mock axios so the smoke test exercises the full route/import graph without
// making real network calls; an unauthenticated 401 sends the app to /login.
// NB: plain functions, not jest.fn — CRA's Jest config sets resetMocks:true,
// which wipes jest.fn implementations before each test (making them return
// undefined and breaking the `.then`/`.catch` chains in the mounted effects).
jest.mock('axios', () => ({
    defaults: {},
    get: () => Promise.reject({response: {status: 401}}),
    post: () => Promise.resolve({data: {}}),
    put: () => Promise.resolve({data: {}}),
    delete: () => Promise.resolve({data: {}}),
}));

import App from './App';

test('renders the app without crashing', () => {
    const {container} = render(<App/>);
    expect(container).toBeInTheDocument();
});
