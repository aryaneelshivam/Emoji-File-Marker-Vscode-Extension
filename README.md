# Emoji File Markers

Mark and tag your files with emojis in the VS Code file explorer! 🎨

## Features

- **Visual File Organization**: Mark files with emojis to quickly identify their purpose, status, or priority
- **Easy to Use**: Right-click any file in the explorer to add or remove emoji markers
- **Persistent**: Emoji markers are saved at the workspace level and persist across VS Code sessions
- **Rich Emoji Collection**: Choose from 90+ carefully curated emojis across multiple categories
- **Quick Access**: Use the Command Palette for quick access to all emoji marker commands

## Usage

### Adding an Emoji Marker

1. Right-click on any file in the File Explorer
2. Select **"Add Emoji Marker"** from the context menu
3. Choose an emoji from the Quick Pick menu
4. The emoji will appear next to the file name

![Demo placeholder](https://via.placeholder.com/600x300?text=Demo+GIF+Coming+Soon)

### Removing an Emoji Marker

1. Right-click on a file with an emoji marker
2. Select **"Remove Emoji Marker"** from the context menu

### Clearing All Markers

1. Open the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type **"Clear All Emoji Markers"**
3. Confirm the action

## Available Emojis

The extension includes emojis in the following categories:

- **Status & Symbols**: ✅ ❌ ⚠️ 🚨 🔥 ⭐ 💡 💯 🎯
- **Development**: 💻 🐛 🚀 ⚡ 🔧 🔨 ⚙️ 🛠️
- **Files & Documents**: 📝 📄 📋 📁 📂 📊 📈
- **Smileys**: 😀 😊 🤔 😎 🤓 🥳
- **Colors**: 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪
- **Nature**: 🌟 🌈 ☀️ ⚡ 🌺 🌸
- And many more!

## Commands

| Command | Description |
|---------|-------------|
| `Add Emoji Marker` | Add an emoji marker to the selected file |
| `Remove Emoji Marker` | Remove the emoji marker from the selected file |
| `Clear All Emoji Markers` | Remove all emoji markers from the workspace |

## Use Cases

- **Priority Marking**: Use 🔥 for urgent files, ⭐ for important ones
- **Status Tracking**: Mark files with ✅ when complete, 🚧 for work in progress
- **File Categories**: Use 📝 for docs, 🐛 for bug-related files, 🚀 for deployment scripts
- **Team Collaboration**: Create a shared emoji convention for your team
- **Quick Navigation**: Visually scan for specific file types at a glance

## Requirements

- VS Code version 1.75.0 or higher

## Extension Settings

This extension does not add any VS Code settings. All emoji markers are stored at the workspace level.

## Known Limitations

- Emoji markers are currently supported for files only (not folders)
- Emoji associations are stored locally per workspace
- If a file is renamed or moved, the emoji marker may be lost (future enhancement planned)

## Release Notes

### 0.1.0

Initial release of Emoji File Markers:
- Add emoji markers to files via context menu
- Remove emoji markers from files
- Clear all emoji markers at once
- 90+ curated emojis across multiple categories
- Workspace-level persistence

## Contributing

Found a bug or have a feature request? Please open an issue on the [GitHub repository](https://github.com/your-username/emoji-file-markers).

## License

This extension is licensed under the [MIT License](LICENSE).

---

**Enjoy organizing your files with emojis!** 🎉
