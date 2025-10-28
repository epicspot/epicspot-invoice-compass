const { contextBridge } = require('electron');

// Exposer des APIs sécurisées au renderer process si nécessaire
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  version: process.versions.electron
});
