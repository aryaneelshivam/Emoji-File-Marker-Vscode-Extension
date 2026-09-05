import * as vscode from 'vscode';
import { getAncestorPaths, resolveMarker, ResolvedMarker } from './pathUtils';

/**
 * Manages the storage and retrieval of emoji-to-file associations
 */
export class StorageManager {
    private static readonly STORAGE_KEY = 'emojiFileMarkers';

    /** Window in which refresh requests are coalesced into a single decoration event. */
    private static readonly REFRESH_DEBOUNCE_MS = 50;

    /**
     * Upper bound on how many URIs a single refresh enumerates. Marking a folder near the
     * top of a huge workspace should not allocate an array of every file in it; anything
     * past the cap keeps its stale badge until the explorer re-queries that item.
     */
    private static readonly MAX_REFRESH_URIS = 5000;

    private readonly context: vscode.ExtensionContext;
    private changeEmitter = new vscode.EventEmitter<vscode.Uri[]>();

    /** Roots whose subtrees still need a decoration refresh, keyed by uri.toString(). */
    private readonly pendingRefreshRoots = new Map<string, vscode.Uri>();
    private refreshTimer: ReturnType<typeof setTimeout> | undefined;

    public readonly onDidChange = this.changeEmitter.event;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Get all stored emoji mappings
     */
    private getAllMappings(): Record<string, string> {
        return this.context.workspaceState.get(StorageManager.STORAGE_KEY, {});
    }

    /**
     * Save all emoji mappings
     */
    private async saveAllMappings(mappings: Record<string, string>): Promise<void> {
        await this.context.workspaceState.update(StorageManager.STORAGE_KEY, mappings);
    }

    /**
     * Normalize URI to string for consistent storage
     */
    private normalizeUri(uri: vscode.Uri): string {
        return uri.toString();
    }

    /**
     * Set an emoji for a given URI
     */
    async setEmoji(uri: vscode.Uri, emoji: string): Promise<void> {
        await this.setEmojiForUris([uri], emoji);
    }

    /**
     * Set the same emoji on several URIs in one storage write, so a large multi-selection
     * costs one read-modify-write and one refresh instead of one of each per item.
     */
    async setEmojiForUris(uris: readonly vscode.Uri[], emoji: string): Promise<void> {
        if (uris.length === 0) {
            return;
        }

        const mappings = this.getAllMappings();
        for (const uri of uris) {
            mappings[this.normalizeUri(uri)] = emoji;
        }
        await this.saveAllMappings(mappings);

        this.queueRefresh(uris);
    }

    /**
     * Get the emoji explicitly set on a given URI (ignoring inheritance)
     */
    getEmoji(uri: vscode.Uri): string | undefined {
        const mappings = this.getAllMappings();
        const key = this.normalizeUri(uri);
        return mappings[key];
    }

    /**
     * Get the inherited emoji from parent folders (if any)
     */
    getInheritedEmoji(uri: vscode.Uri): string | undefined {
        const mappings = this.getAllMappings();

        for (const ancestor of getAncestorPaths(uri.fsPath, { boundary: this.getBoundary(uri) })) {
            const emoji = mappings[this.normalizeUri(vscode.Uri.file(ancestor))];
            if (emoji) {
                return emoji;
            }
        }

        return undefined;
    }

    /**
     * Resolve the marker to display for a URI: its own emoji if it has one, otherwise the
     * one inherited from the nearest marked ancestor folder.
     */
    resolveEmoji(uri: vscode.Uri): ResolvedMarker | undefined {
        const mappings = this.getAllMappings();

        return resolveMarker(
            uri.fsPath,
            (candidatePath) => mappings[this.normalizeUri(vscode.Uri.file(candidatePath))],
            { boundary: this.getBoundary(uri) }
        );
    }

    /**
     * Remove the emoji for a given URI
     */
    async removeEmoji(uri: vscode.Uri): Promise<void> {
        await this.removeEmojiForUris([uri]);
    }

    /**
     * Remove markers from several URIs in one storage write. Returns the URIs that
     * actually had a marker.
     */
    async removeEmojiForUris(uris: readonly vscode.Uri[]): Promise<vscode.Uri[]> {
        const mappings = this.getAllMappings();
        const removed: vscode.Uri[] = [];

        for (const uri of uris) {
            const key = this.normalizeUri(uri);
            if (mappings[key]) {
                delete mappings[key];
                removed.push(uri);
            }
        }

        if (removed.length === 0) {
            return removed;
        }

        await this.saveAllMappings(mappings);
        this.queueRefresh(removed);

        return removed;
    }

    /**
     * Clear all emoji markers
     */
    async clearAll(): Promise<void> {
        const markedUris = this.getAllMarkedUris();

        await this.saveAllMappings({});
        this.queueRefresh(markedUris);
    }

    /**
     * Get all URIs that have emoji markers
     */
    getAllMarkedUris(): vscode.Uri[] {
        const mappings = this.getAllMappings();
        return Object.keys(mappings).map(key => vscode.Uri.parse(key));
    }

    dispose(): void {
        if (this.refreshTimer !== undefined) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = undefined;
        }
        this.pendingRefreshRoots.clear();
        this.changeEmitter.dispose();
    }

    /**
     * Inheritance stops at the workspace folder containing the URI, so a marker on a
     * folder outside the workspace never leaks into it. Files outside any workspace
     * folder simply walk to the filesystem root.
     */
    private getBoundary(uri: vscode.Uri): string | undefined {
        return vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath;
    }

    /**
     * Queue the subtrees affected by a change. Requests inside the debounce window are
     * merged, so marking a 200-item selection fires one decoration event, not 200.
     */
    private queueRefresh(uris: readonly vscode.Uri[]): void {
        for (const uri of uris) {
            this.pendingRefreshRoots.set(this.normalizeUri(uri), uri);
        }

        if (this.refreshTimer !== undefined) {
            return;
        }

        this.refreshTimer = setTimeout(() => {
            this.refreshTimer = undefined;
            void this.flushRefresh();
        }, StorageManager.REFRESH_DEBOUNCE_MS);
    }

    private async flushRefresh(): Promise<void> {
        const roots = [...this.pendingRefreshRoots.values()];
        this.pendingRefreshRoots.clear();

        if (roots.length === 0) {
            return;
        }

        const uris = await this.collectAffectedUris(roots);
        if (uris.length > 0) {
            this.changeEmitter.fire(uris);
        }
    }

    /**
     * The URIs whose decoration can have changed: the changed items themselves plus, for
     * folders, their descendants (which may show an inherited badge). Deduplicated, and
     * scoped to the affected subtrees rather than scanning the whole workspace.
     *
     * Symlinked directories are not descended into, which both keeps the walk cheap and
     * makes a symlink cycle impossible.
     */
    private async collectAffectedUris(roots: readonly vscode.Uri[]): Promise<vscode.Uri[]> {
        const collected = new Map<string, vscode.Uri>();
        for (const root of roots) {
            collected.set(this.normalizeUri(root), root);
        }

        // Breadth-first, one level at a time, reading the directories of a level in
        // parallel. Roots that are plain files simply come back with no entries.
        let level: vscode.Uri[] = [...collected.values()];

        while (level.length > 0 && collected.size < StorageManager.MAX_REFRESH_URIS) {
            const listings = await Promise.all(level.map(dir => this.readDirectorySafely(dir)));
            const next: vscode.Uri[] = [];

            for (const [dir, entries] of listings) {
                for (const [name, type] of entries) {
                    if (collected.size >= StorageManager.MAX_REFRESH_URIS) {
                        return [...collected.values()];
                    }

                    const child = vscode.Uri.joinPath(dir, name);
                    collected.set(this.normalizeUri(child), child);

                    if (type === vscode.FileType.Directory) {
                        next.push(child);
                    }
                }
            }

            level = next;
        }

        return [...collected.values()];
    }

    private async readDirectorySafely(uri: vscode.Uri): Promise<[vscode.Uri, [string, vscode.FileType][]]> {
        try {
            return [uri, await vscode.workspace.fs.readDirectory(uri)];
        } catch {
            // Not a directory, or gone/unreadable: nothing below it to refresh.
            return [uri, []];
        }
    }
}
