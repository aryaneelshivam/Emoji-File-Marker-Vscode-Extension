import * as vscode from 'vscode';

interface EmojiItem extends vscode.QuickPickItem {
    emoji: string;
}

/**
 * Shows an emoji picker and returns the selected emoji
 */
export async function showEmojiPicker(): Promise<string | undefined> {
    const emojis: EmojiItem[] = [
        // Smileys & People
        { emoji: '😀', label: '😀', description: 'Grinning Face' },
        { emoji: '😃', label: '😃', description: 'Grinning Face with Big Eyes' },
        { emoji: '😄', label: '😄', description: 'Grinning Face with Smiling Eyes' },
        { emoji: '😊', label: '😊', description: 'Smiling Face with Smiling Eyes' },
        { emoji: '🙂', label: '🙂', description: 'Slightly Smiling Face' },
        { emoji: '🤔', label: '🤔', description: 'Thinking Face' },
        { emoji: '😎', label: '😎', description: 'Smiling Face with Sunglasses' },
        { emoji: '🤓', label: '🤓', description: 'Nerd Face' },
        { emoji: '🥳', label: '🥳', description: 'Partying Face' },
        { emoji: '😴', label: '😴', description: 'Sleeping Face' },
        { emoji: '🤯', label: '🤯', description: 'Exploding Head' },

        // Symbols & Status
        { emoji: '✅', label: '✅', description: 'Check Mark' },
        { emoji: '❌', label: '❌', description: 'Cross Mark' },
        { emoji: '⚠️', label: '⚠️', description: 'Warning' },
        { emoji: '🚨', label: '🚨', description: 'Police Car Light' },
        { emoji: '🔥', label: '🔥', description: 'Fire' },
        { emoji: '⭐', label: '⭐', description: 'Star' },
        { emoji: '💡', label: '💡', description: 'Light Bulb' },
        { emoji: '💯', label: '💯', description: 'Hundred Points' },
        { emoji: '🎯', label: '🎯', description: 'Direct Hit' },
        { emoji: '🏆', label: '🏆', description: 'Trophy' },
        { emoji: '🔑', label: '🔑', description: 'Key' },
        { emoji: '🔒', label: '🔒', description: 'Locked' },
        { emoji: '🔓', label: '🔓', description: 'Unlocked' },

        // Objects & Tools
        { emoji: '📝', label: '📝', description: 'Memo' },
        { emoji: '📄', label: '📄', description: 'Page Facing Up' },
        { emoji: '📋', label: '📋', description: 'Clipboard' },
        { emoji: '📁', label: '📁', description: 'File Folder' },
        { emoji: '📂', label: '📂', description: 'Open File Folder' },
        { emoji: '🗂️', label: '🗂️', description: 'Card Index Dividers' },
        { emoji: '📊', label: '📊', description: 'Bar Chart' },
        { emoji: '📈', label: '📈', description: 'Chart Increasing' },
        { emoji: '📉', label: '📉', description: 'Chart Decreasing' },
        { emoji: '🔧', label: '🔧', description: 'Wrench' },
        { emoji: '🔨', label: '🔨', description: 'Hammer' },
        { emoji: '⚙️', label: '⚙️', description: 'Gear' },
        { emoji: '🛠️', label: '🛠️', description: 'Hammer and Wrench' },

        // Development & Tech
        { emoji: '💻', label: '💻', description: 'Laptop' },
        { emoji: '🖥️', label: '🖥️', description: 'Desktop Computer' },
        { emoji: '⌨️', label: '⌨️', description: 'Keyboard' },
        { emoji: '🖱️', label: '🖱️', description: 'Computer Mouse' },
        { emoji: '💾', label: '💾', description: 'Floppy Disk' },
        { emoji: '💿', label: '💿', description: 'Optical Disk' },
        { emoji: '🐛', label: '🐛', description: 'Bug' },
        { emoji: '🚀', label: '🚀', description: 'Rocket' },
        { emoji: '⚡', label: '⚡', description: 'High Voltage' },
        { emoji: '🔬', label: '🔬', description: 'Microscope' },

        // Colors & Flags
        { emoji: '🔴', label: '🔴', description: 'Red Circle' },
        { emoji: '🟠', label: '🟠', description: 'Orange Circle' },
        { emoji: '🟡', label: '🟡', description: 'Yellow Circle' },
        { emoji: '🟢', label: '🟢', description: 'Green Circle' },
        { emoji: '🔵', label: '🔵', description: 'Blue Circle' },
        { emoji: '🟣', label: '🟣', description: 'Purple Circle' },
        { emoji: '⚫', label: '⚫', description: 'Black Circle' },
        { emoji: '⚪', label: '⚪', description: 'White Circle' },
        { emoji: '🏁', label: '🏁', description: 'Chequered Flag' },
        { emoji: '🚩', label: '🚩', description: 'Red Flag' },
        { emoji: '🏴', label: '🏴', description: 'Black Flag' },

        // Arrows & Directions
        { emoji: '➡️', label: '➡️', description: 'Right Arrow' },
        { emoji: '⬅️', label: '⬅️', description: 'Left Arrow' },
        { emoji: '⬆️', label: '⬆️', description: 'Up Arrow' },
        { emoji: '⬇️', label: '⬇️', description: 'Down Arrow' },
        { emoji: '↗️', label: '↗️', description: 'Up-Right Arrow' },
        { emoji: '↘️', label: '↘️', description: 'Down-Right Arrow' },
        { emoji: '🔄', label: '🔄', description: 'Anticlockwise Arrows' },
        { emoji: '🔃', label: '🔃', description: 'Clockwise Vertical Arrows' },

        // Nature & Animals
        { emoji: '🌟', label: '🌟', description: 'Glowing Star' },
        { emoji: '🌈', label: '🌈', description: 'Rainbow' },
        { emoji: '🌙', label: '🌙', description: 'Crescent Moon' },
        { emoji: '☀️', label: '☀️', description: 'Sun' },
        { emoji: '⚡', label: '⚡', description: 'Lightning' },
        { emoji: '🐝', label: '🐝', description: 'Honeybee' },
        { emoji: '🦋', label: '🦋', description: 'Butterfly' },
        { emoji: '🌺', label: '🌺', description: 'Hibiscus' },
        { emoji: '🌸', label: '🌸', description: 'Cherry Blossom' },
        { emoji: '🌻', label: '🌻', description: 'Sunflower' },
    ];

    const selected = await vscode.window.showQuickPick(emojis, {
        placeHolder: 'Select an emoji to mark this file',
        matchOnDescription: true,
        title: 'Emoji File Marker'
    });

    return selected?.emoji;
}
