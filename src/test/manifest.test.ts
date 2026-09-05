import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { test, describe } from 'node:test';

interface MenuEntry { command: string; when?: string; group?: string }

const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8')
);
const menus: Record<string, MenuEntry[]> = manifest.contributes.menus;
const commandIds: string[] = manifest.contributes.commands.map((c: { command: string }) => c.command);

/** Commands that operate on the file or folder in context. */
const RESOURCE_COMMANDS = ['emojiFileMarkers.addEmoji', 'emojiFileMarkers.removeEmoji'];

describe('command palette contributions', () => {
    test('every command is listed', () => {
        assert.deepStrictEqual(
            menus.commandPalette.map(entry => entry.command).sort(),
            [...commandIds].sort()
        );
    });

    test('every palette entry is guarded by a when clause', () => {
        // Without one, a command shows in the palette with nothing selected and fails
        // at invocation time instead of being hidden.
        for (const entry of menus.commandPalette) {
            assert.ok(entry.when, `${entry.command} has no when clause`);
        }
    });

    test('resource commands require a file or folder in context', () => {
        for (const command of RESOURCE_COMMANDS) {
            const entry = menus.commandPalette.find(e => e.command === command);
            assert.ok(entry, `${command} is missing from the command palette menu`);
            assert.strictEqual(entry.when, 'resourceScheme == file');
        }
    });

    test('clearing all markers only needs an open workspace', () => {
        const entry = menus.commandPalette.find(e => e.command === 'emojiFileMarkers.clearAll');
        assert.ok(entry);
        assert.strictEqual(entry.when, 'workspaceFolderCount != 0');
    });

    test('the palette and the explorer menu agree on the resource guard', () => {
        for (const command of RESOURCE_COMMANDS) {
            const palette = menus.commandPalette.find(e => e.command === command);
            const explorer = menus['explorer/context'].find(e => e.command === command);

            assert.ok(explorer, `${command} is missing from the explorer context menu`);
            assert.strictEqual(palette!.when, explorer.when, `${command} guards differ`);
        }
    });

    test('every contributed command is registered in the extension', () => {
        const source = fs.readFileSync(
            path.join(__dirname, '..', '..', 'src', 'extension.ts'), 'utf8'
        );

        for (const command of commandIds) {
            assert.ok(source.includes(`'${command}'`), `${command} is never registered`);
        }
    });
});
