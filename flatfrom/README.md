# CRM Desktop Application

This is the desktop version of the CRM application built with Electron.

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

## Setup Instructions

1. **First, build the CRM frontend:**
   ```bash
   cd ../crm-frontend
   npm install
   npm run build
   ```

2. **Install desktop app dependencies:**
   ```bash
   cd flatfrom
   npm install
   ```

3. **Build the desktop app:**
   ```bash
   node build-script.js
   ```

## Running the Application

### Development Mode
```bash
npm start
```

### Create Installer

#### Windows
```bash
npm run build-win
```

#### macOS
```bash
npm run build-mac
```

#### Linux
```bash
npm run build-linux
```

## Features

- ✅ Cross-platform desktop app (Windows, macOS, Linux)
- ✅ Native menu bar
- ✅ Auto-updater support
- ✅ Secure communication between processes
- ✅ Custom application icon
- ✅ Installer with logo
- ✅ Desktop and Start Menu shortcuts

## File Structure

```
flatfrom/
├── main.js              # Main Electron process
├── preload.js           # Preload script for security
├── package.json         # Dependencies and build config
├── build-script.js      # Script to copy React build
├── assets/
│   └── icon.png         # Application icon
├── build/               # Copied React build (generated)
└── dist/                # Final installer (generated)
```

## Build Configuration

The app is configured to create:
- **Windows**: NSIS installer (.exe)
- **macOS**: DMG package
- **Linux**: AppImage

## Troubleshooting

1. **If the app doesn't start:**
   - Make sure you've built the CRM frontend first
   - Check that the build folder exists and contains index.html

2. **If the installer fails:**
   - Make sure all dependencies are installed
   - Check that the assets/icon.png file exists

3. **For development:**
   - The app will load from localhost:5173 in development mode
   - Make sure the CRM frontend dev server is running
