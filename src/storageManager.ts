import * as vscode from 'vscode';

/**
 * Manages the storage and retrieval of emoji-to-file associations
 */
export class StorageManager {
    private static readonly STORAGE_KEY = 'emojiFileMarkers';
    private readonly context: vscode.ExtensionContext;
    private changeEmitter = new vscode.EventEmitter<vscode.Uri[]>();

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
     * Set an emoji for a given file URI
     */
    async setEmoji(uri: vscode.Uri, emoji: string): Promise<void> {
        const mappings = this.getAllMappings();
        const key = this.normalizeUri(uri);
        mappings[key] = emoji;
        await this.saveAllMappings(mappings);
        this.changeEmitter.fire([uri]);
    }

    /**
     * Get the emoji for a given file URI
     */
    getEmoji(uri: vscode.Uri): string | undefined {
        const mappings = this.getAllMappings();
        const key = this.normalizeUri(uri);
        return mappings[key];
    }

    /**
     * Remove the emoji for a given file URI
     */
    async removeEmoji(uri: vscode.Uri): Promise<void> {
        const mappings = this.getAllMappings();
        const key = this.normalizeUri(uri);

        if (mappings[key]) {
            delete mappings[key];
            await this.saveAllMappings(mappings);
            this.changeEmitter.fire([uri]);
        }
    }

    /**
     * Clear all emoji markers
     */
    async clearAll(): Promise<void> {
        const mappings = this.getAllMappings();
        const changedUris = Object.keys(mappings).map(key => vscode.Uri.parse(key));

        await this.saveAllMappings({});
        this.changeEmitter.fire(changedUris);
    }

    /**
     * Get all URIs that have emoji markers
     */
    getAllMarkedUris(): vscode.Uri[] {
        const mappings = this.getAllMappings();
        return Object.keys(mappings).map(key => vscode.Uri.parse(key));
    }
}
