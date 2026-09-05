import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { test, describe } from 'node:test';
import {
    EMOJI_CATALOG,
    EMOJI_SECTIONS,
    EmojiDefinition,
    MAX_RECENT_EMOJIS,
    describeEmoji,
    getRecentEmojis,
    promoteRecent
} from '../emojiCatalog';

function readme(): string {
    return fs.readFileSync(path.join(__dirname, '..', '..', 'README.md'), 'utf8');
}

const catalog: EmojiDefinition[] = [
    { emoji: '✅', name: 'Check Mark', keywords: ['Complete'] },
    { emoji: '🔥', name: 'Fire', keywords: ['Urgent', 'Critical'] },
    { emoji: '⭐', name: 'Star' },
    { emoji: '🐛', name: 'Bug' }
];

describe('getRecentEmojis', () => {
    test('returns the recently used emojis, most recent first', () => {
        const recent = getRecentEmojis(catalog, ['⭐', '🔥']);
        assert.deepStrictEqual(recent.map(d => d.emoji), ['⭐', '🔥']);
    });

    test('ignores entries that are no longer in the catalog', () => {
        const recent = getRecentEmojis(catalog, ['🦖', '🔥']);
        assert.deepStrictEqual(recent.map(d => d.emoji), ['🔥']);
    });

    test('tolerates duplicates in the stored history', () => {
        const recent = getRecentEmojis(catalog, ['🔥', '🔥', '⭐']);
        assert.deepStrictEqual(recent.map(d => d.emoji), ['🔥', '⭐']);
    });

    test('caps the section at the maximum', () => {
        const recent = getRecentEmojis(catalog, ['🔥', '⭐', '🐛', '✅'], 2);
        assert.deepStrictEqual(recent.map(d => d.emoji), ['🔥', '⭐']);
    });

    test('is empty with no history', () => {
        assert.deepStrictEqual(getRecentEmojis(catalog, []), []);
    });

    test('does not remove recent emojis from their catalog section', () => {
        // The recent section is additive: every catalog emoji stays where it belongs.
        const recent = getRecentEmojis(catalog, ['🔥']);

        assert.deepStrictEqual(recent.map(d => d.emoji), ['🔥']);
        assert.deepStrictEqual(catalog.map(d => d.emoji), ['✅', '🔥', '⭐', '🐛']);
    });
});

describe('promoteRecent', () => {
    test('puts the newest pick at the front', () => {
        assert.deepStrictEqual(promoteRecent(['⭐', '🐛'], '🔥'), ['🔥', '⭐', '🐛']);
    });

    test('moves an already-known emoji to the front instead of duplicating it', () => {
        assert.deepStrictEqual(promoteRecent(['⭐', '🐛', '🔥'], '🐛'), ['🐛', '⭐', '🔥']);
    });

    test('trims the history to the maximum', () => {
        assert.deepStrictEqual(promoteRecent(['a', 'b', 'c', 'd'], 'e', 3), ['e', 'a', 'b']);
    });

    test('re-picking the most recent emoji is a no-op', () => {
        assert.deepStrictEqual(promoteRecent(['🔥', '⭐'], '🔥'), ['🔥', '⭐']);
    });
});

describe('describeEmoji', () => {
    test('joins the name with its convention keywords', () => {
        assert.strictEqual(
            describeEmoji({ emoji: '🔥', name: 'Fire', keywords: ['Urgent', 'Critical'] }),
            'Fire · Urgent · Critical'
        );
    });

    test('falls back to just the name', () => {
        assert.strictEqual(describeEmoji({ emoji: '⭐', name: 'Star' }), 'Star');
    });
});

describe('EMOJI_SECTIONS', () => {
    test('every section has a title and at least one emoji', () => {
        for (const section of EMOJI_SECTIONS) {
            assert.ok(section.title.length > 0, 'a section is missing a title');
            assert.ok(section.emojis.length > 0, `${section.title} is empty`);
        }
    });

    test('section titles are unique', () => {
        const titles = EMOJI_SECTIONS.map(s => s.title);
        assert.strictEqual(new Set(titles).size, titles.length);
    });

    test('flattens to the catalog in section order', () => {
        assert.deepStrictEqual(
            EMOJI_CATALOG.map(d => d.emoji),
            EMOJI_SECTIONS.flatMap(s => s.emojis).map(d => d.emoji)
        );
    });

    test('no emoji appears in more than one section', () => {
        const emojis = EMOJI_CATALOG.map(d => d.emoji);
        const duplicates = emojis.filter((emoji, index) => emojis.indexOf(emoji) !== index);

        assert.deepStrictEqual(duplicates, []);
    });

    test('every entry has a name', () => {
        for (const definition of EMOJI_CATALOG) {
            assert.ok(definition.name.length > 0, `${definition.emoji} is missing a name`);
        }
    });

    test('covers every convention documented in the README', () => {
        // Parsed rather than hardcoded, so a convention added to the README's
        // "Use Cases & Best Practices" list must also be searchable in the picker.
        const body = readme().split('## Use Cases & Best Practices')[1].split('## Keyboard Shortcuts')[0];
        const conventions = [...body.matchAll(/^- (\S+) \*\*(.+?)\*\*/gm)];

        assert.ok(conventions.length > 20, 'expected the README to document many conventions');

        for (const [, emoji, title] of conventions) {
            const definition = EMOJI_CATALOG.find(d => d.emoji === emoji);
            assert.ok(definition, `${emoji} ("${title}") is missing from the catalog`);

            // Any word of the convention title should reach the emoji by search.
            const words = title.split(/[/ ]+/);
            const searchable = words.some(word => definition.keywords?.some(
                keyword => keyword.toLowerCase().includes(word.toLowerCase())
            ));
            assert.ok(searchable, `${emoji} should be searchable by "${title}", has: ${definition.keywords}`);
        }
    });

    test('matches the "Available Emojis" section of the README', () => {
        // The picker's sections are documented in the README; this fails if they drift.
        const body = readme().split('## Available Emojis')[1].split('## Use Cases')[0];

        const documented = [...body.matchAll(/^### (.+?)(?: \(\d+\))?\n(.+)$/gm)]
            .map(([, title, emojis]) => ({ title, emojis: emojis.trim().split(/\s+/) }));

        assert.deepStrictEqual(
            documented.map(s => s.title),
            EMOJI_SECTIONS.map(s => s.title)
        );

        for (const [index, section] of EMOJI_SECTIONS.entries()) {
            assert.deepStrictEqual(
                documented[index].emojis,
                section.emojis.map(d => d.emoji),
                `${section.title} differs between README.md and the catalog`
            );
        }
    });

    test('remembers a sane number of recent emojis', () => {
        assert.ok(MAX_RECENT_EMOJIS > 0 && MAX_RECENT_EMOJIS <= EMOJI_CATALOG.length);
    });
});
