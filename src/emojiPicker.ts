import * as vscode from 'vscode';
import {
    EMOJI_CATALOG,
    EMOJI_SECTIONS,
    EmojiDefinition,
    RECENT_SECTION_TITLE,
    describeEmoji,
    getRecentEmojis
} from './emojiCatalog';
import { searchEmojis } from './emojiSearch';
import { RecentEmojiStore } from './recentEmojis';

interface EmojiItem extends vscode.QuickPickItem {
    /** Absent on separator rows. */
    emoji?: string;
}

function toItem(definition: EmojiDefinition): EmojiItem {
    return {
        emoji: definition.emoji,
        label: definition.emoji,
        description: describeEmoji(definition),
        // Results are ranked here, so they must survive the built-in filter untouched.
        alwaysShow: true
    };
}

function separator(label: string): EmojiItem {
    return { label, kind: vscode.QuickPickItemKind.Separator };
}

/** The unfiltered list: recently used first, then every category under its own heading. */
function buildBrowseItems(recent: EmojiDefinition[]): EmojiItem[] {
    const items: EmojiItem[] = [];

    if (recent.length > 0) {
        items.push(separator(RECENT_SECTION_TITLE));
        items.push(...recent.map(toItem));
    }

    for (const section of EMOJI_SECTIONS) {
        items.push(separator(section.title));
        items.push(...section.emojis.map(toItem));
    }

    return items;
}

/**
 * Shows an emoji picker and returns the selected emoji.
 *
 * With an empty search box the picker browses by section, led by the last 12 emojis
 * picked. Typing switches to a ranked flat list from {@link searchEmojis} — the built-in
 * matcher is turned off so it cannot reorder those results.
 */
export async function showEmojiPicker(recentStore?: RecentEmojiStore): Promise<string | undefined> {
    const recent = getRecentEmojis(EMOJI_CATALOG, recentStore?.getRecent() ?? []);
    const browseItems = buildBrowseItems(recent);

    const picker = vscode.window.createQuickPick<EmojiItem>();
    picker.title = 'Emoji File Marker';
    picker.placeholder = 'Select an emoji — search by name or by convention (urgent, blocked, in progress…)';
    // Ranking is ours; leaving these on would let the fuzzy scorer re-sort the results.
    picker.matchOnDescription = false;
    picker.matchOnDetail = false;
    picker.items = browseItems;

    const selected = await new Promise<EmojiItem | undefined>((resolve) => {
        picker.onDidChangeValue((value) => {
            const query = value.trim();
            picker.items = query === ''
                ? browseItems
                : searchEmojis(EMOJI_CATALOG, query).map(toItem);
        });

        picker.onDidAccept(() => {
            resolve(picker.selectedItems[0]);
            picker.hide();
        });

        picker.onDidHide(() => resolve(undefined));

        picker.show();
    });

    picker.dispose();

    if (!selected?.emoji) {
        return undefined;
    }

    await recentStore?.record(selected.emoji);

    return selected.emoji;
}
