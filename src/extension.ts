import * as vscode from 'vscode';
import { StorageManager } from './storageManager';
import { EmojiDecorationProvider } from './decorationProvider';
import { addEmojiCommand, removeEmojiCommand, clearAllCommand } from './commands';

/**
 * Extension activation function
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Emoji File Markers extension is now active');

    // Initialize storage manager
    const storageManager = new StorageManager(context);

    // Initialize and register decoration provider
    const decorationProvider = new EmojiDecorationProvider(storageManager);
    context.subscriptions.push(
        vscode.window.registerFileDecorationProvider(decorationProvider)
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('emojiFileMarkers.addEmoji', (uri?: vscode.Uri) => {
            return addEmojiCommand(storageManager, uri);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('emojiFileMarkers.removeEmoji', (uri?: vscode.Uri) => {
            return removeEmojiCommand(storageManager, uri);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('emojiFileMarkers.clearAll', () => {
            return clearAllCommand(storageManager);
        })
    );

    // Show welcome message on first activation
    const hasShownWelcome = context.globalState.get('emojiFileMarkers.hasShownWelcome', false);
    if (!hasShownWelcome) {
        vscode.window.showInformationMessage(
            'Emoji File Markers is now active! Right-click any file to add an emoji marker.',
            'Got it'
        ).then(() => {
            context.globalState.update('emojiFileMarkers.hasShownWelcome', true);
        });
    }
}

/**
 * Extension deactivation function
 */
export function deactivate() {
    console.log('Emoji File Markers extension is now deactivated');
}
