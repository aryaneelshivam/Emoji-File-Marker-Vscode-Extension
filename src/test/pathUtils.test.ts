import * as assert from 'assert';
import * as path from 'path';
import { test, describe } from 'node:test';
import { getAncestorPaths, resolveMarker } from '../pathUtils';

const win32 = { dirname: path.win32.dirname, normalize: path.win32.normalize, sep: path.win32.sep };
const posix = { dirname: path.posix.dirname, normalize: path.posix.normalize, sep: path.posix.sep };

/** Build a lookup over a marker table, using the given path flavour's semantics. */
function lookupFrom(markers: Record<string, string>) {
    return (candidatePath: string) => markers[candidatePath];
}

describe('getAncestorPaths', () => {
    test('walks parent folders nearest-first on posix', () => {
        assert.deepStrictEqual(
            getAncestorPaths('/home/me/project/src/index.ts', { pathApi: posix }),
            ['/home/me/project/src', '/home/me/project', '/home/me', '/home', '/']
        );
    });

    test('terminates at the posix root', () => {
        assert.deepStrictEqual(getAncestorPaths('/', { pathApi: posix }), []);
        assert.deepStrictEqual(getAncestorPaths('/a', { pathApi: posix }), ['/']);
    });

    test('terminates at a Windows drive root instead of looping forever', () => {
        // path.win32.dirname('C:\\') === 'C:\\', so a naive loop that compares against the
        // original path never ends here.
        assert.deepStrictEqual(getAncestorPaths('C:\\', { pathApi: win32 }), []);
        assert.deepStrictEqual(
            getAncestorPaths('C:\\project\\src\\index.ts', { pathApi: win32 }),
            ['C:\\project\\src', 'C:\\project', 'C:\\']
        );
    });

    test('terminates at a Windows UNC share root', () => {
        assert.deepStrictEqual(
            getAncestorPaths('\\\\server\\share\\a\\b.ts', { pathApi: win32 }),
            ['\\\\server\\share\\a', '\\\\server\\share\\']
        );
    });

    test('tolerates trailing separators', () => {
        assert.deepStrictEqual(
            getAncestorPaths('/home/me/project/', { pathApi: posix }),
            ['/home/me', '/home', '/']
        );
        assert.deepStrictEqual(
            getAncestorPaths('C:\\project\\src\\', { pathApi: win32 }),
            ['C:\\project', 'C:\\']
        );
    });

    test('stops at the workspace root boundary, inclusive', () => {
        assert.deepStrictEqual(
            getAncestorPaths('/home/me/project/src/deep/index.ts', {
                pathApi: posix,
                boundary: '/home/me/project'
            }),
            ['/home/me/project/src/deep', '/home/me/project/src', '/home/me/project']
        );
    });

    test('a boundary with a trailing separator still matches', () => {
        assert.deepStrictEqual(
            getAncestorPaths('/ws/a/b.ts', { pathApi: posix, boundary: '/ws/' }),
            ['/ws/a', '/ws']
        );
    });

    test('the boundary directory itself has no ancestors', () => {
        assert.deepStrictEqual(
            getAncestorPaths('/home/me/project', { pathApi: posix, boundary: '/home/me/project' }),
            []
        );
    });

    test('a boundary that is not an ancestor does not prevent termination', () => {
        assert.deepStrictEqual(
            getAncestorPaths('C:\\other\\file.ts', { pathApi: win32, boundary: 'D:\\ws' }),
            ['C:\\other', 'C:\\']
        );
    });
});

describe('resolveMarker', () => {
    test('inherits from a parent folder', () => {
        const marker = resolveMarker(
            '/ws/src/index.ts',
            lookupFrom({ '/ws/src': '🔥' }),
            { pathApi: posix }
        );

        assert.deepStrictEqual(marker, { emoji: '🔥', ownerPath: '/ws/src', source: 'inherited' });
    });

    test('inherits from a distant ancestor', () => {
        const marker = resolveMarker(
            '/ws/a/b/c/index.ts',
            lookupFrom({ '/ws': '📦' }),
            { pathApi: posix }
        );

        assert.deepStrictEqual(marker, { emoji: '📦', ownerPath: '/ws', source: 'inherited' });
    });

    test('a marker on the item itself wins over a parent folder marker', () => {
        const marker = resolveMarker(
            '/ws/src/index.ts',
            lookupFrom({ '/ws/src/index.ts': '⭐', '/ws/src': '🔥', '/ws': '📦' }),
            { pathApi: posix }
        );

        assert.deepStrictEqual(marker, { emoji: '⭐', ownerPath: '/ws/src/index.ts', source: 'self' });
    });

    test('the nearest marked ancestor wins over more distant ones', () => {
        const marker = resolveMarker(
            '/ws/src/deep/index.ts',
            lookupFrom({ '/ws/src': '🔥', '/ws': '📦' }),
            { pathApi: posix }
        );

        assert.deepStrictEqual(marker, { emoji: '🔥', ownerPath: '/ws/src', source: 'inherited' });
    });

    test('does not inherit from outside the workspace boundary', () => {
        const marker = resolveMarker(
            '/home/me/ws/src/index.ts',
            lookupFrom({ '/home/me': '🚫' }),
            { pathApi: posix, boundary: '/home/me/ws' }
        );

        assert.strictEqual(marker, undefined);
    });

    test('returns undefined when nothing is marked, without looping at a Windows root', () => {
        const marker = resolveMarker('C:\\ws\\src\\index.ts', lookupFrom({}), { pathApi: win32 });
        assert.strictEqual(marker, undefined);
    });

    test('a marker on a Windows drive root is inherited', () => {
        const marker = resolveMarker(
            'C:\\ws\\index.ts',
            lookupFrom({ 'C:\\': '💾' }),
            { pathApi: win32 }
        );

        assert.deepStrictEqual(marker, { emoji: '💾', ownerPath: 'C:\\', source: 'inherited' });
    });
});
