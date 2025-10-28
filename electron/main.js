const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

// Démarrer le backend Node.js
function startBackend() {
  const backendPath = path.join(__dirname, '..', 'backend', 'server.js');
  
  backendProcess = spawn('node', [backendPath], {
    env: {
      ...process.env,
      PORT: '3000',
      FRONTEND_URL: 'http://localhost:8080'
    }
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    title: 'EPICSPOT - Gestion Commerciale'
  });

  // En développement, charger depuis le serveur Vite
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    // En production, charger depuis les fichiers buildés
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Démarrer le backend
  startBackend();
  
  // Attendre un peu que le backend démarre avant d'ouvrir la fenêtre
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Arrêter le backend quand l'application se ferme
  if (backendProcess) {
    backendProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // S'assurer que le backend est bien arrêté
  if (backendProcess) {
    backendProcess.kill();
  }
});
