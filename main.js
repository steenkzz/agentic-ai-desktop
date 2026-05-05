/**
 * main.js — Agentic AI Desktop
 * Electron main process with auto-update support via electron-updater.
 */

const { app, BrowserWindow, shell, ipcMain } = require('electron');
const { autoUpdater }                         = require('electron-updater');
const path                                    = require('path');

let mainWindow;

function setupAutoUpdater() {
  if (!app.isPackaged) {
    console.log('[Updater] Dev mode — skipping update check');
    return;
  }

  autoUpdater.autoDownload         = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update-available', { version: info.version, releaseDate: info.releaseDate });
  });
  autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('update-not-available');
  });
  autoUpdater.on('download-progress', (p) => {
    mainWindow?.webContents.send('update-progress', { percent: Math.round(p.percent) });
  });
  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update-downloaded');
  });
  autoUpdater.on('error', (err) => {
    mainWindow?.webContents.send('update-error', err.message);
  });

  setTimeout(() => autoUpdater.checkForUpdates(), 3000);
}

ipcMain.on('download-update',  () => autoUpdater.downloadUpdate());
ipcMain.on('install-update',   () => autoUpdater.quitAndInstall(false, true));

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 820, minWidth: 900, minHeight: 600,
    title: 'Agentic AI', backgroundColor: '#0D0F14',
    webPreferences: {
      nodeIntegration: false, contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.icns'),
  });

  mainWindow.loadURL('https://ai-support-sprint.vercel.app');

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isVercel = url.startsWith('https://ai-support-sprint.vercel.app');
    if (!isVercel) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
