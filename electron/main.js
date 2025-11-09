import { app, BrowserWindow } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { APP_CONFIG } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let backendProcess;

// Démarrer le backend Node.js
function startBackend() {
  const env = {
    ...process.env,
    PORT: APP_CONFIG.BACKEND_PORT.toString(),
    FRONTEND_URL: process.env.FRONTEND_URL || APP_CONFIG.FRONTEND_URL,
  };

  if (app.isPackaged) {
    // En production (app packagée), importer le serveur depuis resources/backend
    const prodBackendPath = path.join(process.resourcesPath, 'backend', 'server.js');
    import(pathToFileURL(prodBackendPath).href)
      .then(() => console.log('Backend démarré (production)'))
      .catch((err) => console.error('Erreur de démarrage du backend:', err));
  } else {
    // En développement, utiliser spawn pour lancer le serveur
    const devBackendPath = path.join(__dirname, '..', 'backend', 'server.js');
    backendProcess = spawn('node', [devBackendPath], { env });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
    });
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
    title: APP_CONFIG.APP_NAME
  });

  // Charger l'application
  if (app.isPackaged) {
    // En production, charger depuis les fichiers buildés dans resources
    const indexPath = path.join(__dirname, '..', '..', 'dist', 'index.html');
    console.log('Loading from:', indexPath);
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('Erreur de chargement:', err);
      // Fallback: essayer depuis process.resourcesPath
      const fallbackPath = path.join(process.resourcesPath, 'dist', 'index.html');
      console.log('Trying fallback:', fallbackPath);
      mainWindow.loadFile(fallbackPath);
    });
  } else {
    // En développement, charger depuis le serveur Vite
    mainWindow.loadURL(APP_CONFIG.FRONTEND_URL).catch((err) => {
      console.error('Erreur de chargement:', err);
    });
  }
  
  // Ouvrir DevTools en développement
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
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
