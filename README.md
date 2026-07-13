# Tab Renamer - Edge Extension

A Microsoft Edge extension that allows you to rename browser tabs with custom names.

## Features

- 🏷️ Rename any tab with a custom name
- 🔄 Reset tab to its original title
- 💾 Remembers custom names even after page reload
- 🎨 Clean, modern UI
- ⚡ Fast and lightweight

## Installation

1. Open Microsoft Edge
2. Navigate to `edge://extensions/`
3. Enable "Developer mode" (toggle in the left sidebar)
4. Click "Load unpacked"
5. Select the extension folder

## Usage

### Rename A Tab

- Option 1:

   1. Right Click a tab and select "Rename Tab"
   2. Enter a custom name for the tab

- Option 2:

   1. Ensure the tab that you wish to rename is focused
   2. Click the extension icon in your browser toolbar
   3. Enter a custom name for the tab
   4. Click "Rename Tab" to apply the new name

### Reset A Tab Name

1. Ensure the tab whose name you wish to clear is focused
2. Click the extension icon in your browser toolbar
3. Click "Reset" to restore the original title

## How It Works

- The extension stores custom tab names in local storage
- When you rename a tab, it injects a script to change the document title
- Custom names persist across page reloads
- Storage is automatically cleaned up when tabs are closed

## Permissions

- `tabs` - To access and modify tab information
- `storage` - To save custom tab names
- `scripting` - To inject scripts that change the document title
- `<all_urls>` - To work on any webpage

## Development

The extension consists of:

- `manifest.json` - Extension configuration
- `popup.html/js` - User interface for renaming tabs
- `background.js` - Service worker for tab management
- `icons/` - Extension icons (placeholder)

## Notes

- Custom names persist across browser restarts (stored by URL)
- Some special pages (like `edge://` pages) cannot be renamed due to browser restrictions
- The extension automatically restores custom names when pages reload or when you reopen the browser

## License

MIT License - Feel free to modify and distribute
