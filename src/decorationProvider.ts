import * as vscode from 'vscode';
import { StorageManager } from './storageManager';

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
        const emoji = this.storageManager.getEmoji(uri);

        if (emoji) {
            return {
                badge: emoji,
                tooltip: `Marked with ${emoji}`
            };
        }

        return undefined;
    }

    /**
     * Manually trigger decoration refresh for specific URIs
     */
    refresh(uris: vscode.Uri[]): void {
        this.changeEmitter.fire(uris);
    }
}
