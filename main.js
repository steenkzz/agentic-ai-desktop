/**
 * main.js — Agentic AI Desktop
 * Electron main process. Opens the demo UI in a native app window.
 */

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

// Keep a global reference so the window isn't garbage collected
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width:           1280,
    height:          820,
    minWidth:        900,
    minHeight:       600,
    title:           'Agentic AI',
    backgroundColor: '#0D0F14',
    webPreferences: {
      nodeIntegration:  false,
      contextIsolation: true,
    },
    // Use icon based on platform
    icon: path.join(__dirname, 'assets',
      process.platform === 'win32' ? 'icon.ico' : 'icon.icns'
    ),
  });

  // Load the demo UI
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Open external links in the default browser, not inside the app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Open Jira ticket links in the browser too
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // macOS: re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
