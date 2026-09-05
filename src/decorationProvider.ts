import * as vscode from 'vscode';
import { StorageManager } from './storageManager';

/** Marks a badge as inherited from a parent folder rather than set on the item itself. */
const INHERITED_PREFIX = '\u00B7';

/**
 * Provides file decorations (emoji badges) for marked files
 */
export class EmojiDecorationProvider implements vscode.FileDecorationProvider {
    private readonly storageManager: StorageManager;
    private changeEmitter = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();

    public readonly onDidChangeFileDecorations = this.changeEmitter.event;

    constructor(storageManager: StorageManager) {
        this.storageManager = storageManager;

        // Listen to storage changes and emit decoration change events
        this.storageManager.onDidChange((uris) => {
            this.changeEmitter.fire(uris);
        });
    }

    /**
     * Provide file decoration for a given URI
     */
    provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
        const marker = this.storageManager.resolveEmoji(uri);

        if (!marker) {
            return undefined;
        }

        if (marker.source === 'self') {
            return {
                badge: marker.emoji,
                tooltip: `Marked with ${marker.emoji}`,
                propagate: false
            };
        }

        return {
            badge: INHERITED_PREFIX + marker.emoji,
            tooltip: `Inherited ${marker.emoji} from parent folder`,
            propagate: false
        };
    }
}
