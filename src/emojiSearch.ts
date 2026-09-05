/**
 * Ranking for the emoji picker's search box. No `vscode` import, so it is unit tested
 * directly.
 *
 * The built-in Quick Pick matcher scores a fuzzy subsequence anywhere in the text, which
 * buries exact hits: typing "yes" matched the *inside* of "Grinning Face with Big Eyes"
 * and "Yellow Square" ahead of 👍, whose "Yes" keyword sits at the end of a long
 * description. Ranking here instead lets an exact keyword win outright.
 */

import { EmojiDefinition } from './emojiCatalog';

/** Score bands, widely spaced so a better kind of match always beats a worse one. */
const EXACT = 1000;
const PREFIX = 850;
const WORD_PREFIX = 700;
const SUBSTRING = 300;
const SUBSEQUENCE = 100;
const NO_MATCH = 0;

/** Split on anything that isn't a letter or digit, so "Bug fix" and "UI/UX" both split. */
const WORD_SEPARATOR = /[^\p{L}\p{N}]+/u;

function isSubsequence(query: string, target: string): boolean {
    let index = 0;

    for (const char of target) {
        if (char === query[index]) {
            index++;
            if (index === query.length) {
                return true;
            }
        }
    }

    return query.length === 0;
}

/** How well a single piece of text answers the query. */
function scoreTarget(target: string, query: string): number {
    if (target === query) {
        return EXACT;
    }

    if (target.startsWith(query)) {
        return PREFIX;
    }

    if (target.split(WORD_SEPARATOR).some(word => word.startsWith(query))) {
        return WORD_PREFIX;
    }

    if (target.includes(query)) {
        return SUBSTRING;
    }

    return isSubsequence(query, target) ? SUBSEQUENCE : NO_MATCH;
}

export interface EmojiMatch {
    definition: EmojiDefinition;
    score: number;
    /** Length of the text that matched — shorter is more specific, used to break ties. */
    targetLength: number;
}

/**
 * Best-scoring match for one emoji: its own character, its name, and each of its
 * convention keywords are all searchable.
 */
export function matchEmoji(definition: EmojiDefinition, query: string): EmojiMatch | undefined {
    const needle = query.trim().toLowerCase();
    if (needle === '') {
        return undefined;
    }

    if (definition.emoji === query.trim()) {
        return { definition, score: EXACT, targetLength: 0 };
    }

    let best = NO_MATCH;
    let bestLength = Number.MAX_SAFE_INTEGER;

    for (const target of [definition.name, ...(definition.keywords ?? [])]) {
        const score = scoreTarget(target.toLowerCase(), needle);

        if (score > best || (score === best && score > NO_MATCH && target.length < bestLength)) {
            best = score;
            bestLength = target.length;
        }
    }

    return best === NO_MATCH ? undefined : { definition, score: best, targetLength: bestLength };
}

/**
 * Emojis matching `query`, best first. Ties fall back to the more specific (shorter)
 * match and then to catalog order, so results are stable.
 */
export function searchEmojis(
    catalog: readonly EmojiDefinition[],
    query: string
): EmojiDefinition[] {
    const matches: (EmojiMatch & { order: number })[] = [];

    catalog.forEach((definition, order) => {
        const match = matchEmoji(definition, query);
        if (match) {
            matches.push({ ...match, order });
        }
    });

    matches.sort((a, b) =>
        b.score - a.score ||
        a.targetLength - b.targetLength ||
        a.order - b.order
    );

    return matches.map(match => match.definition);
}
