import * as vscode from 'vscode';
import {
    EMOJI_CATALOG,
    EMOJI_SECTIONS,
    EmojiDefinition,
    RECENT_SECTION_TITLE,
    describeEmoji,
    getRecentEmojis
} from './emojiCatalog';
import { RecentEmojiStore } from './recentEmojis';

interface EmojiItem extends vscode.QuickPickItem {
    /** Absent on separator rows. */
    emoji?: string;
}

function toItem(definition: EmojiDefinition): EmojiItem {
    return {
        emoji: definition.emoji,
        label: definition.emoji,
        description: describeEmoji(definition)
    };
}

function separator(label: string): EmojiItem {
    return { label, kind: vscode.QuickPickItemKind.Separator };
}

/**
 * Shows an emoji picker and returns the selected emoji.
 *
 * The list opens with a "Recently Used" section holding the last 12 emojis picked (most
 * recent first), then every catalog section under its own separator. Recently used emojis
 * stay in their category section as well, so an emoji is always where you expect it.
 */
export async function showEmojiPicker(recentStore?: RecentEmojiStore): Promise<string | undefined> {
    const recent = getRecentEmojis(EMOJI_CATALOG, recentStore?.getRecent() ?? []);

    const items: EmojiItem[] = [];

    if (recent.length > 0) {
        items.push(separator(RECENT_SECTION_TITLE));
        items.push(...recent.map(toItem));
    }

    for (const section of EMOJI_SECTIONS) {
        items.push(separator(section.title));
        items.push(...section.emojis.map(toItem));
    }

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select an emoji — search by name or by convention (urgent, blocked, in progress…)',
        matchOnDescription: true,
        title: 'Emoji File Marker'
    });

    if (!selected?.emoji) {
        return undefined;
    }

    await recentStore?.record(selected.emoji);

    return selected.emoji;
}
