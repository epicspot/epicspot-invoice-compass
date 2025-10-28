# Guide de Build Electron - Application EPICSPOT

Ce guide explique comment créer un fichier .exe (Windows), .dmg (Mac) ou .AppImage (Linux) de votre application EPICSPOT.

## 📋 Prérequis

- Node.js v18 ou supérieur
- Git
- Windows pour créer un .exe (ou Mac pour .dmg, Linux pour .AppImage)

## 🔧 Configuration Manuelle du package.json

**IMPORTANT**: Vous devez ajouter manuellement ces scripts à votre `package.json` principal (à la racine du projet):

Ouvrez `package.json` et ajoutez ces lignes dans la section `"scripts"`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "electron": "electron electron/main.js",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:8080 && cross-env NODE_ENV=development electron electron/main.js\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:linux": "npm run build && electron-builder --linux"
  },
  "main": "electron/main.js"
}
```

Ajoutez également cette ligne au même niveau que `"scripts"` (pas à l'intérieur):

```json
"main": "electron/main.js"
```

## 📦 Installation des Dépendances Backend

Les dépendances Electron sont déjà installées. Maintenant, installez les dépendances du backend:

```bash
cd backend
npm install
cd ..
```

## 🚀 Tester l'Application en Mode Electron (Développement)

Pour tester l'application Electron avant de la builder:

```bash
npm run electron:dev
```

Cela va:
1. Démarrer le serveur Vite (frontend)
2. Démarrer le backend Node.js
3. Ouvrir l'application Electron

## 📦 Créer le Fichier .exe (Production)

### Pour Windows:

```bash
npm run electron:build:win
```

Cela va créer:
- Un installeur `.exe` dans le dossier `release/`
- Une version portable également

### Pour Mac:

```bash
npm run electron:build:mac
```

### Pour Linux:

```bash
npm run electron:build:linux
```

## 📁 Où Trouver l'Application Buildée?

Après le build, vous trouverez vos fichiers dans le dossier `release/`:

- **Windows**: `EPICSPOT Gestion Commerciale-1.0.0-Setup.exe`
- **Mac**: `EPICSPOT Gestion Commerciale-1.0.0.dmg`
- **Linux**: `EPICSPOT Gestion Commerciale-1.0.0.AppImage`

## 🎯 Distribution

### Installer l'Application

**Windows**:
1. Double-cliquez sur le fichier `.exe`
2. Suivez l'assistant d'installation
3. L'application sera installée et un raccourci sera créé sur le bureau

**Version Portable Windows**:
- Il y aura aussi un fichier `.exe` portable que vous pouvez exécuter directement sans installation

### Points Importants

1. **Base de Données**: Chaque installation aura sa propre base de données SQLite locale
2. **Mises à Jour**: Pour mettre à jour, il suffit de réinstaller la nouvelle version
3. **Taille**: L'application fera environ 150-200 MB (inclut Node.js, Chromium, etc.)

## 🔍 Dépannage

### Le build échoue

1. Vérifiez que vous avez bien ajouté les scripts au package.json
2. Vérifiez que toutes les dépendances sont installées:
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

### L'application ne démarre pas

1. Vérifiez les logs dans la console
2. Essayez d'abord en mode développement: `npm run electron:dev`

### Erreur de build sur Windows

Si vous obtenez une erreur de signature:
- C'est normal, l'application n'est pas signée numériquement
- Pour un usage personnel, ce n'est pas un problème
- Pour la distribution publique, vous devrez obtenir un certificat de signature de code

## 📝 Personnalisation

### Changer l'Icône

Remplacez le fichier `public/favicon.ico` par votre propre icône (format .ico, recommandé 256x256px)

### Changer le Nom de l'Application

Modifiez dans `electron-builder.json`:
```json
{
  "productName": "Votre Nom d'Application"
}
```

## 🎉 C'est Tout!

Votre application est maintenant prête à être distribuée comme une application de bureau complète!

Pour toute question, consultez la documentation:
- [Electron](https://www.electronjs.org/)
- [Electron Builder](https://www.electron.build/)
