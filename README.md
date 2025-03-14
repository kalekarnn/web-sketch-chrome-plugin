<div align="center">
  <img src="https://github.com/kalekarnn/web-sketch-chrome-plugin/blob/main/images/icon128.png" alt="Alt text" title="WebSketch" />
</div>

# WebSketch : Webpage Drawing Tool

A Chrome extension that lets you draw directly on any webpage with various tools and colors.

## Features

- ✅ **Freehand Drawing** – Use the mouse to draw on top of any webpage.
- ✅ **Different Colors & Brush Sizes** – Choose from various colors and adjust brush thickness.
- ✅ **Eraser Tool** – Erase mistakes without refreshing the page.
- ✅ **Shortcut Key Activation** – Press Alt+D to toggle drawing mode.
- ✅ **Clear All Option** – Remove all drawings instantly.

## Installation

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store page for Webpage Drawing Tool
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now be installed and visible in your toolbar

## How to Use

1. Click the extension icon in your toolbar to open the control panel
2. Select your preferred tool (pencil or eraser)
3. Choose a color and brush size
4. Toggle drawing mode by pressing Alt+D
5. Draw on the webpage with your mouse


## Keyboard Shortcuts

- **Alt+D**: Toggle drawing mode on/off

## Technical Details

This extension uses HTML5 Canvas for drawing and includes the following components:
- Popup interface for tool selection and settings
- Content script that injects the drawing canvas into webpages
- Background script for handling keyboard shortcuts and settings storage
- html2canvas library for saving drawings as images

## License

MIT License

## Credits

Created by [@kalekarnn](https://github.com/kalekarnn)
