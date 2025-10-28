import { app, BrowserWindow } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let backendProcess;

// Démarrer le backend Node.js
function startBackend() {
  const env = {
    ...process.env,
    PORT: '3000',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:8080',
  };

  if (process.env.NODE_ENV === 'development') {
    const devBackendPath = path.join(__dirname, '..', 'backend', 'server.js');
    backendProcess = spawn('node', [devBackendPath], { env });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
    });
  } else {
    // En production, importer directement le serveur ESM depuis resources/backend
    const prodBackendPath = path.join(process.resourcesPath, 'backend', 'server.js');
    import(pathToFileURL(prodBackendPath).href)
      .then(() => console.log('Backend démarré (production)'))
      .catch((err) => console.error('Erreur de démarrage du backend:', err));
  }
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
    const indexPath = app.isPackaged
      ? path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html')
      : path.join(__dirname, '..', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }
  
  // Ouvrir DevTools pour déboguer
  mainWindow.webContents.openDevTools();

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
