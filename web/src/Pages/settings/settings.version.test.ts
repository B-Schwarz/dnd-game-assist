import fs from 'fs';
import path from 'path';

// The displayed version must come from the build-injected env var, NOT from
// importing package.json (which would bundle the whole dependency list into the
// client). This pins that contract at the source level; the actually-rendered
// value is exercised by the e2e settings test. See CLAUDE.md.
const source = fs.readFileSync(path.join(__dirname, 'settings.tsx'), 'utf8');

describe('settings version source', () => {
    it('reads the version from process.env.REACT_APP_VERSION', () => {
        expect(source).toContain('process.env.REACT_APP_VERSION');
    });

    it('does not import package.json', () => {
        expect(source).not.toMatch(/package\.json/);
    });
});
