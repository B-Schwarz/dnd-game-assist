// jest-dom adds custom matchers for asserting on DOM nodes (works with Vitest's
// expect too), e.g. expect(element).toHaveTextContent(/react/i).
import '@testing-library/jest-dom';

// jsdom under Vitest/Node does not provide a working localStorage, and never
// implements matchMedia. Shim them so components that read them work: the
// character sheet persists its EN/DE language choice to localStorage, and
// Chakra's color-mode/useMediaQuery hooks call matchMedia. A fresh in-memory
// store per test file mirrors Jest's jsdom (one environment per file).
class MemoryStorage implements Storage {
    private store = new Map<string, string>();

    get length() {
        return this.store.size;
    }

    clear() {
        this.store.clear();
    }

    getItem(key: string) {
        return this.store.has(key) ? this.store.get(key)! : null;
    }

    key(index: number) {
        return Array.from(this.store.keys())[index] ?? null;
    }

    removeItem(key: string) {
        this.store.delete(key);
    }

    setItem(key: string, value: string) {
        this.store.set(key, String(value));
    }
}

if (!globalThis.localStorage) {
    Object.defineProperty(globalThis, 'localStorage', {
        value: new MemoryStorage(),
        configurable: true,
    });
}

if (!window.matchMedia) {
    window.matchMedia = (query: string): MediaQueryList => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    });
}
