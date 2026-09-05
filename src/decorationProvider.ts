import * as vscode from 'vscode';
import { StorageManager } from './storageManager';
import { DEFAULT_INHERITED_PREFIX, buildInheritedBadge } from './badge';

const CONFIG_SECTION = 'emojiFileMarkers';

interface InheritedStyle {
    show: boolean;
    prefix: string;
}

/**
 * Provides file decorations (emoji badges) for marked files
 */
export class EmojiDecorationProvider implements vscode.FileDecorationProvider, vscode.Disposable {
    private readonly storageManager: StorageManager;
    private changeEmitter = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();
    private readonly disposables: vscode.Disposable[] = [];

    /** Cached so config isn't re-read for every item the explorer renders. */
    private inheritedStyle: InheritedStyle;

    public readonly onDidChangeFileDecorations = this.changeEmitter.event;

    constructor(storageManager: StorageManager) {
        this.storageManager = storageManager;
        this.inheritedStyle = EmojiDecorationProvider.readInheritedStyle();

        // Listen to storage changes and emit decoration change events
        this.disposables.push(
            this.storageManager.onDidChange((uris) => {
                this.changeEmitter.fire(uris);
            })
        );

        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration((event) => {
                if (!event.affectsConfiguration(CONFIG_SECTION)) {
                    return;
                }

                this.inheritedStyle = EmojiDecorationProvider.readInheritedStyle();
                // Re-decorate everything the change could affect.
                this.storageManager.refreshMarked();
            })
        );
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

        const { show, prefix } = this.inheritedStyle;
        if (!show) {
            return undefined;
        }

        // No `color`: it would tint the file name rather than the emoji, and would fight
        // with Git status colours. The prefix and the tooltip carry the distinction.
        return {
            badge: buildInheritedBadge(marker.emoji, prefix),
            tooltip: `Inherited ${marker.emoji} from parent folder`,
            propagate: false
        };
    }

    dispose(): void {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables.length = 0;
        this.changeEmitter.dispose();
    }

    private static readInheritedStyle(): InheritedStyle {
        const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

        return {
            show: config.get<boolean>('showInheritedMarkers', true),
            prefix: config.get<string>('inheritedMarkerPrefix', DEFAULT_INHERITED_PREFIX)
        };
    }
}
