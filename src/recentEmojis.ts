import * as vscode from 'vscode';
import { MAX_RECENT_EMOJIS, promoteRecent } from './emojiCatalog';

/**
 * Remembers which emojis the user picks, most recent first.
 *
 * Stored in global state rather than workspace state: which emojis someone reaches for is
 * a personal habit, so it should carry across every workspace they open.
 */
export class RecentEmojiStore {
    private static readonly STORAGE_KEY = 'emojiFileMarkers.recentEmojis';

    private readonly context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    getRecent(): string[] {
        const stored = this.context.globalState.get<unknown>(RecentEmojiStore.STORAGE_KEY, []);

        // Defensive: global state is persisted JSON and could be anything on disk.
        if (!Array.isArray(stored)) {
            return [];
        }

        return stored.filter((entry): entry is string => typeof entry === 'string');
    }

    async record(emoji: string): Promise<void> {
        const updated = promoteRecent(this.getRecent(), emoji, MAX_RECENT_EMOJIS);
        await this.context.globalState.update(RecentEmojiStore.STORAGE_KEY, updated);
    }
}
