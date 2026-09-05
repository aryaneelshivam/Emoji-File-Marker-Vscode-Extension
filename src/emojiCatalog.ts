/**
 * The emoji catalog and the pure ordering rules for the picker. Deliberately free of any
 * `vscode` import so it can be unit tested directly.
 */

export interface EmojiDefinition {
    emoji: string;
    /** Unicode-ish name, shown first in the picker. */
    name: string;
    /**
     * Convention titles and search terms from the "Use Cases & Best Practices" section of
     * the README, so typing "urgent", "blocked" or "quick win" finds the right emoji.
     */
    keywords?: string[];
}

export interface EmojiSection {
    /** Separator heading in the picker. Kept in step with the README's "Available Emojis". */
    title: string;
    emojis: EmojiDefinition[];
}

/**
 * The curated emoji list, grouped exactly as the README's "Available Emojis" section
 * documents it. Both the section order and the order within each section are the order
 * the picker shows.
 */
export const EMOJI_SECTIONS: readonly EmojiSection[] = [
    {
        title: '📊 Status & Symbols',
        emojis: [
            { emoji: '✅', name: 'Check Mark', keywords: ['Complete', 'Done', 'Finished', 'Reviewed'] },
            { emoji: '❌', name: 'Cross Mark', keywords: ['Blocked', 'Cannot proceed', 'Failed'] },
            { emoji: '⚠️', name: 'Warning', keywords: ['Caution', 'Risk'] },
            { emoji: '🚨', name: 'Police Car Light', keywords: ['Alert', 'Incident'] },
            { emoji: '🔥', name: 'Fire', keywords: ['Urgent', 'Critical', 'Immediate attention'] },
            { emoji: '⭐', name: 'Star', keywords: ['Important', 'High priority'] },
            { emoji: '💎', name: 'Gem Stone', keywords: ['High Value', 'Key file'] },
            { emoji: '🚧', name: 'Construction', keywords: ['In Progress', 'WIP', 'Being worked on'] },
            { emoji: '⏳', name: 'Hourglass Not Done', keywords: ['Pending', 'Waiting'] },
            { emoji: '🔜', name: 'Soon Arrow', keywords: ['Next Up', 'Queued'] },
            { emoji: '📌', name: 'Pushpin', keywords: ['Important Reference', 'Key documentation'] },
            { emoji: '💡', name: 'Light Bulb', keywords: ['Idea', 'Proposal'] },
            { emoji: '💯', name: 'Hundred Points', keywords: ['Done well'] },
            { emoji: '🎯', name: 'Direct Hit', keywords: ['Goal', 'Target'] },
            { emoji: '🏆', name: 'Trophy', keywords: ['Milestone', 'Achievement'] },
            { emoji: '🔑', name: 'Key', keywords: ['Credentials', 'Access'] },
            { emoji: '🔒', name: 'Locked', keywords: ['Security', 'Protected'] },
            { emoji: '🔓', name: 'Unlocked', keywords: ['Public', 'Open access'] },
            { emoji: '⛔', name: 'No Entry', keywords: ['Do Not Modify', 'Generated', 'Off limits'] },
            { emoji: '🗑️', name: 'Wastebasket', keywords: ['To Delete', 'Dead code', 'Remove'] },
        ]
    },
    {
        title: '💻 Development & Tech',
        emojis: [
            { emoji: '💻', name: 'Laptop', keywords: ['Development'] },
            { emoji: '🐛', name: 'Bug', keywords: ['Bug Related', 'Bug fix', 'Issue'] },
            { emoji: '🚀', name: 'Rocket', keywords: ['Deployment', 'Release', 'Ship'] },
            { emoji: '⚡', name: 'High Voltage', keywords: ['Quick Win', 'Easy task', 'Fast', 'Lightning'] },
            { emoji: '🧪', name: 'Test Tube', keywords: ['Testing', 'Tests', 'Specs'] },
            { emoji: '🔌', name: 'Electric Plug', keywords: ['API', 'Integration', 'External connection'] },
            { emoji: '🌐', name: 'Globe with Meridians', keywords: ['Frontend', 'UI components', 'Web'] },
            { emoji: '💾', name: 'Floppy Disk', keywords: ['Data', 'Database', 'Storage'] },
            { emoji: '🖥️', name: 'Desktop Computer', keywords: ['Backend', 'Server'] },
            { emoji: '⌨️', name: 'Keyboard' },
            { emoji: '🖱️', name: 'Computer Mouse' },
            { emoji: '💿', name: 'Optical Disk' },
            { emoji: '🔬', name: 'Microscope', keywords: ['Research', 'Analysis'] },
            { emoji: '📦', name: 'Package', keywords: ['Dependency', 'Module', 'Build artifact'] },
            { emoji: '📱', name: 'Mobile Phone', keywords: ['Mobile', 'iOS', 'Android'] },
        ]
    },
    {
        title: '🛠️ Objects & Tools',
        emojis: [
            { emoji: '📝', name: 'Memo', keywords: ['Documentation', 'README', 'Guide', 'Notes'] },
            { emoji: '⚙️', name: 'Gear', keywords: ['Configuration', 'Config', 'Backend', 'Server-side'] },
            { emoji: '🎨', name: 'Artist Palette', keywords: ['Design', 'UI', 'UX', 'Styling'] },
            { emoji: '📄', name: 'Page Facing Up' },
            { emoji: '📋', name: 'Clipboard' },
            { emoji: '📁', name: 'File Folder' },
            { emoji: '📂', name: 'Open File Folder' },
            { emoji: '🗂️', name: 'Card Index Dividers' },
            { emoji: '📊', name: 'Bar Chart', keywords: ['Metrics', 'Report'] },
            { emoji: '📈', name: 'Chart Increasing', keywords: ['Growth', 'Improving'] },
            { emoji: '📉', name: 'Chart Decreasing', keywords: ['Decline', 'Regression'] },
            { emoji: '🔧', name: 'Wrench', keywords: ['Maintenance', 'Fix'] },
            { emoji: '🔨', name: 'Hammer', keywords: ['Build'] },
            { emoji: '🛠️', name: 'Hammer and Wrench', keywords: ['Tooling', 'Refactor'] },
            { emoji: '🗃️', name: 'Card File Box', keywords: ['Archived', 'Legacy', 'Superseded'] },
        ]
    },
    {
        title: '👥 People & Collaboration',
        emojis: [
            { emoji: '👤', name: 'Bust in Silhouette', keywords: ['Assigned to Me', 'Owner', 'Mine'] },
            { emoji: '👥', name: 'Busts in Silhouette', keywords: ['Team Review', 'Needs team input'] },
            { emoji: '💬', name: 'Speech Balloon', keywords: ['Needs Discussion', 'Meeting', 'Chat'] },
            { emoji: '😀', name: 'Grinning Face' },
            { emoji: '😃', name: 'Grinning Face with Big Eyes' },
            { emoji: '😄', name: 'Grinning Face with Smiling Eyes' },
            { emoji: '😊', name: 'Smiling Face with Smiling Eyes' },
            { emoji: '🙂', name: 'Slightly Smiling Face' },
            { emoji: '🤔', name: 'Thinking Face', keywords: ['Unclear', 'Question'] },
            { emoji: '😎', name: 'Smiling Face with Sunglasses' },
            { emoji: '🤓', name: 'Nerd Face' },
            { emoji: '🥳', name: 'Partying Face' },
            { emoji: '😴', name: 'Sleeping Face', keywords: ['Stale', 'Dormant'] },
            { emoji: '🤯', name: 'Exploding Head', keywords: ['Complex', 'Confusing'] },
            { emoji: '👍', name: 'Thumbs Up', keywords: ['Approved', 'LGTM', 'Signed off', 'Good', 'Yes'] },
            { emoji: '👎', name: 'Thumbs Down', keywords: ['Changes Requested', 'Rejected', 'Bad', 'No'] },
        ]
    },
    {
        title: '⏰ Time & Progress',
        emojis: [
            { emoji: '⏰', name: 'Alarm Clock', keywords: ['Deadline', 'Due', 'Time-sensitive'] },
            { emoji: '📅', name: 'Calendar', keywords: ['Scheduled', 'Planned', 'Roadmap'] },
            { emoji: '♻️', name: 'Recycling Symbol', keywords: ['Cleanup', 'Tech Debt', 'Needs rewrite'] },
            { emoji: '🔙', name: 'Back Arrow', keywords: ['Deprecated', 'Rollback', 'Old version'] },
        ]
    },
    {
        title: '🎨 Colors & Flags',
        emojis: [
            { emoji: '🏁', name: 'Chequered Flag', keywords: ['Entry Point', 'Main', 'Index'] },
            { emoji: '🚩', name: 'Red Flag', keywords: ['Flagged', 'Attention'] },
            { emoji: '🏴', name: 'Black Flag' },
            { emoji: '🔴', name: 'Red Circle' },
            { emoji: '🟠', name: 'Orange Circle' },
            { emoji: '🟡', name: 'Yellow Circle' },
            { emoji: '🟢', name: 'Green Circle' },
            { emoji: '🔵', name: 'Blue Circle' },
            { emoji: '🟣', name: 'Purple Circle' },
            { emoji: '🟤', name: 'Brown Circle' },
            { emoji: '⚫', name: 'Black Circle' },
            { emoji: '⚪', name: 'White Circle' },
            { emoji: '🟥', name: 'Red Square' },
            { emoji: '🟧', name: 'Orange Square' },
            { emoji: '🟨', name: 'Yellow Square' },
            { emoji: '🟩', name: 'Green Square' },
            { emoji: '🟦', name: 'Blue Square' },
            { emoji: '🟪', name: 'Purple Square' },
            { emoji: '🟫', name: 'Brown Square' },
            { emoji: '⬛', name: 'Black Square' },
            { emoji: '⬜', name: 'White Square' },
        ]
    },
    {
        title: '❤️ Hearts',
        emojis: [
            { emoji: '❤️', name: 'Red Heart' },
            { emoji: '🧡', name: 'Orange Heart' },
            { emoji: '💛', name: 'Yellow Heart' },
            { emoji: '💚', name: 'Green Heart' },
            { emoji: '💙', name: 'Blue Heart' },
            { emoji: '🩵', name: 'Light Blue Heart' },
            { emoji: '💜', name: 'Purple Heart' },
            { emoji: '🩷', name: 'Pink Heart' },
            { emoji: '🤎', name: 'Brown Heart' },
            { emoji: '🩶', name: 'Grey Heart', keywords: ['Gray'] },
            { emoji: '🖤', name: 'Black Heart' },
            { emoji: '🤍', name: 'White Heart' },
        ]
    },
    {
        title: '➡️ Arrows & Directions',
        emojis: [
            { emoji: '➡️', name: 'Right Arrow' },
            { emoji: '⬅️', name: 'Left Arrow' },
            { emoji: '⬆️', name: 'Up Arrow' },
            { emoji: '⬇️', name: 'Down Arrow' },
            { emoji: '↗️', name: 'Up-Right Arrow' },
            { emoji: '↘️', name: 'Down-Right Arrow' },
            { emoji: '🔄', name: 'Anticlockwise Arrows', keywords: ['Refactor', 'Sync'] },
            { emoji: '🔃', name: 'Clockwise Vertical Arrows' },
        ]
    },
    {
        title: '🌿 Nature & Weather',
        emojis: [
            { emoji: '🌟', name: 'Glowing Star' },
            { emoji: '🌈', name: 'Rainbow' },
            { emoji: '🌙', name: 'Crescent Moon' },
            { emoji: '☀️', name: 'Sun' },
            { emoji: '🐝', name: 'Honeybee' },
            { emoji: '🦋', name: 'Butterfly' },
            { emoji: '🌺', name: 'Hibiscus' },
            { emoji: '🌸', name: 'Cherry Blossom' },
            { emoji: '🌻', name: 'Sunflower' },
        ]
    },
];

/** Every emoji in the catalog, flattened in section order. */
export const EMOJI_CATALOG: readonly EmojiDefinition[] =
    EMOJI_SECTIONS.flatMap(section => section.emojis);

/** How many recently used emojis are remembered and surfaced at the top of the picker. */
export const MAX_RECENT_EMOJIS = 12;

/** Heading shown above the recently used emojis. */
export const RECENT_SECTION_TITLE = '🕒 Recently Used';

/**
 * The searchable text shown after the emoji: its name followed by the convention titles
 * it maps to, so the Quick Pick's own filtering matches either.
 */
export function describeEmoji(definition: EmojiDefinition): string {
    return [definition.name, ...(definition.keywords ?? [])].join(' · ');
}

/**
 * The recently used emojis, most recent first, capped at `max`.
 *
 * These are shown as an extra section at the top of the picker; they are *not* removed
 * from their category section, so every emoji stays findable where you expect it.
 */
export function getRecentEmojis(
    catalog: readonly EmojiDefinition[],
    recent: readonly string[],
    max: number = MAX_RECENT_EMOJIS
): EmojiDefinition[] {
    const byEmoji = new Map(catalog.map(definition => [definition.emoji, definition]));
    const seen = new Set<string>();
    const definitions: EmojiDefinition[] = [];

    for (const emoji of recent) {
        if (definitions.length >= max) {
            break;
        }

        const definition = byEmoji.get(emoji);
        if (definition && !seen.has(emoji)) {
            seen.add(emoji);
            definitions.push(definition);
        }
    }

    return definitions;
}

/**
 * Move `emoji` to the front of the most-recently-used list, removing any earlier entry
 * for it and trimming the list to `max`.
 */
export function promoteRecent(
    recent: readonly string[],
    emoji: string,
    max: number = MAX_RECENT_EMOJIS
): string[] {
    return [emoji, ...recent.filter(entry => entry !== emoji)].slice(0, Math.max(0, max));
}
