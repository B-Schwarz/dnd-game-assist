import {validateName, validatePassword} from './login'

describe('login field validation', () => {
    it('validateName returns a German error for empty input', () => {
        expect(validateName('')).toBe('Ein Name muss angegeben werden')
        // @ts-expect-error – guard against undefined input too
        expect(validateName(undefined)).toBe('Ein Name muss angegeben werden')
    })

    it('validateName returns undefined for a non-empty name', () => {
        expect(validateName('admin')).toBeUndefined()
    })

    it('validatePassword returns a German error for empty input', () => {
        expect(validatePassword('')).toBe('Ein Passwort muss angegeben werden')
    })

    it('validatePassword returns undefined for a non-empty password', () => {
        expect(validatePassword('secret')).toBeUndefined()
    })
})
