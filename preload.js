/**
 * preload.js
 * Exposes a safe update API to the renderer via contextBridge.
 * This is required because contextIsolation: true is enabled.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('updater', {
  // Renderer → Main
  downloadUpdate: () => ipcRenderer.send('download-update'),
  installUpdate:  () => ipcRenderer.send('install-update'),

  // Main → Renderer (event listeners)
  onUpdateAvailable:    (cb) => ipcRenderer.on('update-available',     (_, data) => cb(data)),
  onUpdateNotAvailable: (cb) => ipcRenderer.on('update-not-available', ()        => cb()),
  onProgress:           (cb) => ipcRenderer.on('update-progress',      (_, data) => cb(data)),
  onDownloaded:         (cb) => ipcRenderer.on('update-downloaded',    ()        => cb()),
  onError:              (cb) => ipcRenderer.on('update-error',         (_, msg)  => cb(msg)),
});
