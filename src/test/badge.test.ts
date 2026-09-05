import * as assert from 'assert';
import { test, describe } from 'node:test';
import * as fs from 'fs';
import * as path from 'path';
import { DEFAULT_INHERITED_PREFIX, buildInheritedBadge, firstGrapheme, graphemes } from '../badge';
import { EMOJI_CATALOG } from '../emojiCatalog';

describe('graphemes', () => {
    test('counts a surrogate-pair emoji as one', () => {
        assert.deepStrictEqual(graphemes('🔥'), ['🔥']);
    });

    test('counts an emoji with a variation selector as one', () => {
        assert.deepStrictEqual(graphemes('⚠️'), ['⚠️']);
        assert.deepStrictEqual(graphemes('❤️'), ['❤️']);
    });

    test('splits a prefix and an emoji into two', () => {
        assert.deepStrictEqual(graphemes('·🔥'), ['·', '🔥']);
    });
});

describe('firstGrapheme', () => {
    test('takes only the first character', () => {
        assert.strictEqual(firstGrapheme('·↳☇'), '·');
    });

    test('does not split an emoji in half', () => {
        assert.strictEqual(firstGrapheme('🔥🚀'), '🔥');
    });

    test('is empty for an empty string', () => {
        assert.strictEqual(firstGrapheme(''), '');
    });
});

describe('buildInheritedBadge', () => {
    test('prefixes the emoji', () => {
        assert.strictEqual(buildInheritedBadge('🔥', DEFAULT_INHERITED_PREFIX), '·🔥');
    });

    test('an empty prefix leaves the bare emoji', () => {
        assert.strictEqual(buildInheritedBadge('🔥', ''), '🔥');
    });

    test('a multi-character prefix is trimmed to one grapheme', () => {
        assert.strictEqual(buildInheritedBadge('🔥', '>>>'), '>🔥');
    });

    test('every catalog emoji stays within the two-grapheme badge budget', () => {
        // VS Code throws on a longer badge, which would drop the decoration entirely.
        for (const definition of EMOJI_CATALOG) {
            const badge = buildInheritedBadge(definition.emoji, DEFAULT_INHERITED_PREFIX);
            assert.ok(
                graphemes(badge).length <= 2,
                `${definition.name} produced a ${graphemes(badge).length}-grapheme badge: ${badge}`
            );
        }
    });

    test('drops the prefix rather than truncating a two-grapheme emoji', () => {
        // A hypothetical multi-grapheme emoji must survive intact, without its prefix.
        const familyEmoji = '👩‍👩‍👧'.normalize();
        const badge = buildInheritedBadge(familyEmoji, DEFAULT_INHERITED_PREFIX);
        assert.ok(badge.endsWith(familyEmoji) || badge === familyEmoji);
        assert.ok(graphemes(badge).length <= 2);
    });
});

describe('DEFAULT_INHERITED_PREFIX', () => {
    test('is a single grapheme', () => {
        assert.strictEqual(graphemes(DEFAULT_INHERITED_PREFIX).length, 1);
    });

    test('matches the default declared in package.json', () => {
        // The setting's default is declared twice by necessity; this fails if they drift.
        const manifest = JSON.parse(
            fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8')
        );
        const declared = manifest.contributes.configuration.properties[
            'emojiFileMarkers.inheritedMarkerPrefix'
        ].default;

        assert.strictEqual(declared, DEFAULT_INHERITED_PREFIX);
    });
});
