import * as vscode from 'vscode';
import { StorageManager } from './storageManager';
import { showEmojiPicker } from './emojiPicker';
import { RecentEmojiStore } from './recentEmojis';

/**
 * Resolve the items a command should act on: an explorer multi-selection if there is one,
 * otherwise the right-clicked item, otherwise the active editor's document.
 */
function resolveTargetUris(uri?: vscode.Uri, selectedUris?: vscode.Uri[]): vscode.Uri[] {
    if (selectedUris && selectedUris.length > 0) {
        return selectedUris;
    }

    if (uri) {
        return [uri];
    }

    const activeUri = vscode.window.activeTextEditor?.document.uri;
    return activeUri ? [activeUri] : [];
}

/**
 * Command to add an emoji marker to files and/or folders
 */
export async function addEmojiCommand(
    storageManager: StorageManager,
    recentStore: RecentEmojiStore,
    uri?: vscode.Uri,
    selectedUris?: vscode.Uri[]
): Promise<void> {
    const candidateUris = resolveTargetUris(uri, selectedUris);

    if (candidateUris.length === 0) {
        vscode.window.showErrorMessage('No file or folder selected');
        return;
    }

    // Stat every candidate in parallel; an item that is inaccessible is dropped rather
    // than failing the whole selection.
    const stats = await Promise.all(candidateUris.map(async (candidateUri) => {
        try {
            const stat = await vscode.workspace.fs.stat(candidateUri);
            // Accept both files and folders
            const isMarkable = stat.type === vscode.FileType.File || stat.type === vscode.FileType.Directory;
            return isMarkable ? candidateUri : undefined;
        } catch {
            return undefined;
        }
    }));

    const validUris = stats.filter((value): value is vscode.Uri => value !== undefined);

    if (validUris.length === 0) {
        vscode.window.showWarningMessage('No valid files or folders selected');
        return;
    }

    const emoji = await showEmojiPicker(recentStore);

    if (!emoji) {
        return;
    }

    // One storage write and one decoration refresh for the whole selection.
    await storageManager.setEmojiForUris(validUris, emoji);

    if (validUris.length === 1) {
        vscode.window.showInformationMessage(`Added ${emoji} marker to ${vscode.workspace.asRelativePath(validUris[0])}`);
        return;
    }

    const skipped = candidateUris.length - validUris.length;
    const skippedNote = skipped > 0 ? ` (${skipped} skipped)` : '';
    vscode.window.showInformationMessage(`Added ${emoji} marker to ${validUris.length} items${skippedNote}`);
}

/**
 * Command to remove emoji markers from files and/or folders
 */
export async function removeEmojiCommand(
    storageManager: StorageManager,
    uri?: vscode.Uri,
    selectedUris?: vscode.Uri[]
): Promise<void> {
    const targetUris = resolveTargetUris(uri, selectedUris);

    if (targetUris.length === 0) {
        vscode.window.showErrorMessage('No file or folder selected');
        return;
    }

    // Only markers set directly on an item can be removed; an inherited badge is cleared
    // by removing the marker from the folder that owns it.
    const marked = targetUris
        .map((targetUri) => ({ uri: targetUri, emoji: storageManager.getEmoji(targetUri) }))
        .filter((entry): entry is { uri: vscode.Uri; emoji: string } => entry.emoji !== undefined);

    if (marked.length === 0) {
        vscode.window.showInformationMessage(
            targetUris.length === 1
                ? 'This item does not have an emoji marker'
                : 'None of the selected items have an emoji marker'
        );
        return;
    }

    await storageManager.removeEmojiForUris(marked.map((entry) => entry.uri));

    if (marked.length === 1) {
        vscode.window.showInformationMessage(
            `Removed ${marked[0].emoji} marker from ${vscode.workspace.asRelativePath(marked[0].uri)}`
        );
        return;
    }

    vscode.window.showInformationMessage(`Removed emoji markers from ${marked.length} items`);
}

/**
 * Command to clear all emoji markers
 */
export async function clearAllCommand(storageManager: StorageManager): Promise<void> {
    const markedUris = storageManager.getAllMarkedUris();

    if (markedUris.length === 0) {
        vscode.window.showInformationMessage('No emoji markers to clear');
        return;
    }

    const confirmation = await vscode.window.showWarningMessage(
        `Are you sure you want to remove all ${markedUris.length} emoji markers?`,
        { modal: true },
        'Yes',
        'No'
    );

    if (confirmation === 'Yes') {
        await storageManager.clearAll();
        vscode.window.showInformationMessage(`Cleared ${markedUris.length} emoji markers`);
    }
}
