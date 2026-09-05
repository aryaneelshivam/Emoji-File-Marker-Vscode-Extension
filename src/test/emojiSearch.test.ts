import * as assert from 'assert';
import { test, describe } from 'node:test';
import { EMOJI_CATALOG } from '../emojiCatalog';
import { matchEmoji, searchEmojis } from '../emojiSearch';

/** The emoji ranked first for `query`, or undefined when nothing matches. */
function top(query: string): string | undefined {
    return searchEmojis(EMOJI_CATALOG, query)[0]?.emoji;
}

function rank(query: string, emoji: string): number {
    return searchEmojis(EMOJI_CATALOG, query).findIndex(d => d.emoji === emoji);
}

describe('searchEmojis ranking', () => {
    test('an exact keyword wins over an accidental substring elsewhere', () => {
        // "yes" is literally inside "Eyes" and a subsequence of "Yellow Square"; the
        // built-in matcher ranked both above 👍, whose "Yes" keyword is an exact hit.
        assert.strictEqual(top('yes'), '👍');
        assert.ok(rank('yes', '😃') > 0, 'Grinning Face with Big Eyes must not lead');
        assert.ok(rank('yes', '🟨') > 0, 'Yellow Square must not lead');
    });

    test('the opposite query still finds the faces', () => {
        assert.ok(['😃', '😄'].includes(top('eyes')!), `expected a face, got ${top('eyes')}`);
        assert.strictEqual(rank('eyes', '👍'), -1, '👍 does not match "eyes"');
    });

    test('"no" ranks the thumbs-down keyword first', () => {
        assert.strictEqual(top('no'), '👎');
    });

    test('exact names win', () => {
        assert.strictEqual(top('fire'), '🔥');
        assert.strictEqual(top('bug'), '🐛');
        assert.strictEqual(top('rocket'), '🚀');
    });

    test('an exact name beats a longer name containing it', () => {
        assert.strictEqual(top('star'), '⭐');
        assert.ok(rank('star', '🌟') > rank('star', '⭐'), 'Glowing Star ranks below Star');
    });

    test('multi-word conventions match exactly', () => {
        assert.strictEqual(top('quick win'), '⚡');
        assert.strictEqual(top('in progress'), '🚧');
        assert.strictEqual(top('team review'), '👥');
        assert.strictEqual(top('tech debt'), '♻️');
        assert.strictEqual(top('do not modify'), '⛔');
    });

    test('every documented convention leads its own query', () => {
        const conventions: [string, string][] = [
            ['urgent', '🔥'], ['critical', '🔥'], ['important', '⭐'], ['high value', '💎'],
            ['complete', '✅'], ['blocked', '❌'], ['pending', '⏳'], ['next up', '🔜'],
            ['documentation', '📝'], ['testing', '🧪'], ['deployment', '🚀'], ['security', '🔒'],
            ['assigned to me', '👤'], ['needs discussion', '💬'], ['entry point', '🏁'],
            ['frontend', '🌐'], ['deprecated', '🔙'], ['archived', '🗃️'], ['approved', '👍'],
            ['changes requested', '👎'], ['to delete', '🗑️'], ['dependency', '📦'],
            ['mobile', '📱'], ['deadline', '⏰'], ['scheduled', '📅'], ['good', '👍'], ['bad', '👎']
        ];

        for (const [query, expected] of conventions) {
            assert.strictEqual(top(query), expected, `"${query}" should rank ${expected} first`);
        }
    });

    test('a word prefix matches', () => {
        assert.strictEqual(top('urg'), '🔥');
        assert.strictEqual(top('deploy'), '🚀');
    });

    test('searching the emoji character finds it', () => {
        assert.strictEqual(top('🔥'), '🔥');
    });

    test('an empty query matches nothing', () => {
        assert.deepStrictEqual(searchEmojis(EMOJI_CATALOG, ''), []);
        assert.deepStrictEqual(searchEmojis(EMOJI_CATALOG, '   '), []);
    });

    test('a query nothing answers returns nothing', () => {
        assert.deepStrictEqual(searchEmojis(EMOJI_CATALOG, 'zzzzqqq'), []);
    });

    test('results are unique and stable', () => {
        const results = searchEmojis(EMOJI_CATALOG, 'e').map(d => d.emoji);
        assert.strictEqual(new Set(results).size, results.length);
        assert.deepStrictEqual(searchEmojis(EMOJI_CATALOG, 'e').map(d => d.emoji), results);
    });
});

describe('matchEmoji', () => {
    test('is case-insensitive', () => {
        assert.ok(matchEmoji({ emoji: '🔥', name: 'Fire' }, 'FIRE'));
        assert.ok(matchEmoji({ emoji: '🔥', name: 'Fire' }, 'fire'));
    });

    test('scores an exact keyword above a substring hit', () => {
        const exact = matchEmoji({ emoji: '👍', name: 'Thumbs Up', keywords: ['Yes'] }, 'yes')!;
        const inside = matchEmoji({ emoji: '😃', name: 'Grinning Face with Big Eyes' }, 'yes')!;

        assert.ok(exact.score > inside.score, `${exact.score} should beat ${inside.score}`);
    });

    test('returns undefined when nothing matches', () => {
        assert.strictEqual(matchEmoji({ emoji: '🔥', name: 'Fire' }, 'zzz'), undefined);
    });
});
