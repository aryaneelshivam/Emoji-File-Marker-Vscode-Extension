import * as vscode from 'vscode';
import { StorageManager } from './storageManager';
import { showEmojiPicker } from './emojiPicker';

/**
 * Command to add an emoji marker to a file
 */
export async function addEmojiCommand(
    storageManager: StorageManager,
    uri?: vscode.Uri
): Promise<void> {
    // Get the target URI
    const targetUri = uri || vscode.window.activeTextEditor?.document.uri;

    if (!targetUri) {
        vscode.window.showErrorMessage('No file selected');
        return;
    }

    // Check if it's a file (not a folder)
    try {
        const stat = await vscode.workspace.fs.stat(targetUri);
        if (stat.type === vscode.FileType.Directory) {
            vscode.window.showWarningMessage('Emoji markers can only be added to files, not folders');
            return;
        }
    } catch (error) {
        vscode.window.showErrorMessage('Failed to access file');
        return;
    }

    // Show emoji picker
    const emoji = await showEmojiPicker();

    if (emoji) {
        await storageManager.setEmoji(targetUri, emoji);
        vscode.window.showInformationMessage(`Added ${emoji} marker to ${vscode.workspace.asRelativePath(targetUri)}`);
    }
}

/**
 * Command to remove an emoji marker from a file
 */
export async function removeEmojiCommand(
    storageManager: StorageManager,
    uri?: vscode.Uri
): Promise<void> {
    // Get the target URI
    const targetUri = uri || vscode.window.activeTextEditor?.document.uri;

    if (!targetUri) {
        vscode.window.showErrorMessage('No file selected');
        return;
    }

    // Check if the file has an emoji marker
    const currentEmoji = storageManager.getEmoji(targetUri);

    if (!currentEmoji) {
        vscode.window.showInformationMessage('This file does not have an emoji marker');
        return;
    }

    await storageManager.removeEmoji(targetUri);
    vscode.window.showInformationMessage(`Removed ${currentEmoji} marker from ${vscode.workspace.asRelativePath(targetUri)}`);
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
