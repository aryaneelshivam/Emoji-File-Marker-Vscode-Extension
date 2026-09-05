/**
 * Badge construction for file decorations. No `vscode` import, so it can be unit tested.
 *
 * VS Code allows a decoration badge of at most **two** characters, counted as grapheme
 * clusters rather than UTF-16 units — and it *throws* on a longer one, which would drop
 * the decoration entirely. Since most emoji are already a single multi-unit grapheme,
 * that leaves room for exactly one prefix character in front of one emoji.
 */

const MAX_BADGE_GRAPHEMES = 2;

/**
 * Default marker placed before an inherited emoji. A middle dot is deliberately quiet: it
 * reads as a subtle qualifier next to the emoji rather than competing with it.
 *
 * Must match the default of `emojiFileMarkers.inheritedMarkerPrefix` in package.json.
 */
export const DEFAULT_INHERITED_PREFIX = '\u00B7';

const segmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : undefined;

/** Split into grapheme clusters, falling back to code points where Intl.Segmenter is absent. */
export function graphemes(value: string): string[] {
    if (!segmenter) {
        return Array.from(value);
    }

    return [...segmenter.segment(value)].map(entry => entry.segment);
}

/** The first grapheme of `value`, or '' when it is empty. */
export function firstGrapheme(value: string): string {
    return graphemes(value)[0] ?? '';
}

/**
 * Build the badge for an inherited marker: one prefix character followed by the emoji.
 *
 * The prefix is trimmed to a single grapheme, and dropped altogether if the emoji alone
 * already fills the two-grapheme budget — losing the prefix is far better than emitting an
 * over-long badge, which VS Code rejects outright.
 */
export function buildInheritedBadge(emoji: string, prefix: string): string {
    const emojiLength = graphemes(emoji).length;

    if (emojiLength >= MAX_BADGE_GRAPHEMES) {
        return emoji;
    }

    const marker = firstGrapheme(prefix);
    if (marker === '') {
        return emoji;
    }

    return marker + emoji;
}
