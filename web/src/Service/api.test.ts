import axios from 'axios';
import {API_PREFIX} from './api';

describe('axios API configuration', () => {
    it('sends credentials (the session cookie) on every request', () => {
        expect(axios.defaults.withCredentials).toBe(true);
    });

    it('derives the API prefix from REACT_APP_API_PREFIX', () => {
        expect(API_PREFIX).toBe(process.env.REACT_APP_API_PREFIX || '');
    });
});
