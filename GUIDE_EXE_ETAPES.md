# Guide Pas à Pas - Créer un fichier .exe

## ✅ Étape 1 : Vérifier les prérequis

Assurez-vous d'avoir :
- ✅ Node.js installé (version 18 ou supérieure)
- ✅ Un terminal (CMD, PowerShell, ou Git Bash)

Pour vérifier Node.js, ouvrez un terminal et tapez :
```bash
node --version
```

---

## ✅ Étape 2 : Modifier le package.json

Ouvrez le fichier `package.json` à la racine du projet.

Trouvez la section `"scripts"` et ajoutez ces lignes **à l'intérieur** :

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "electron": "electron electron/main.js",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:8080 && cross-env NODE_ENV=development electron electron/main.js\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win"
  }
}
```

Ajoutez également cette ligne au même niveau que `"scripts"` (pas à l'intérieur) :
```json
"main": "electron/main.js"
```

**⚠️ Attention** : Respectez bien la syntaxe JSON (virgules, accolades).

---

## ✅ Étape 3 : Installer les dépendances du backend

Ouvrez un terminal à la racine du projet et tapez :

```bash
cd backend
npm install
cd ..
```

Attendez que l'installation se termine.

---

## ✅ Étape 4 : Tester l'application Electron (Optionnel mais recommandé)

Avant de créer le .exe, testez que tout fonctionne :

```bash
npm run electron:dev
```

Une fenêtre devrait s'ouvrir avec votre application. Si tout fonctionne bien, fermez la fenêtre et passez à l'étape suivante.

---

## ✅ Étape 5 : Créer le fichier .exe

Dans le terminal, tapez :

```bash
npm run electron:build:win
```

**⏱️ Attention** : Cette étape peut prendre **5 à 15 minutes** selon votre ordinateur. Ne fermez pas le terminal !

Vous verrez plusieurs messages défiler. C'est normal.

---

## ✅ Étape 6 : Récupérer votre fichier .exe

Une fois terminé, allez dans le dossier `release/` à la racine du projet.

Vous y trouverez :
- **EPICSPOT Gestion Commerciale-1.0.0-Setup.exe** (Installeur)
- **EPICSPOT Gestion Commerciale-1.0.0.exe** (Version portable, optionnel)

---

## ✅ Étape 7 : Installer et tester

1. Double-cliquez sur `EPICSPOT Gestion Commerciale-1.0.0-Setup.exe`
2. Suivez l'assistant d'installation
3. L'application sera installée et un raccourci sera créé sur le bureau

---

## 🎉 C'est terminé !

Votre application est maintenant installée comme un logiciel Windows normal.

---

## ❓ Problèmes courants

### Le build échoue
- Vérifiez que vous avez bien modifié le `package.json`
- Réinstallez les dépendances : `npm install`

### Le .exe ne démarre pas
- Testez d'abord en mode développement : `npm run electron:dev`
- Vérifiez les logs dans le terminal

### Erreur "electron-builder not found"
```bash
npm install
```

---

## 📦 Distribuer votre application

Pour partager votre application :
1. Copiez le fichier `EPICSPOT Gestion Commerciale-1.0.0-Setup.exe`
2. Envoyez-le à vos utilisateurs
3. Ils n'ont qu'à double-cliquer pour installer

**Taille** : Environ 150-200 MB (normal, ça inclut tout le nécessaire)

---

## 🔄 Mettre à jour l'application

Pour créer une nouvelle version après des modifications :
1. Modifiez le code
2. Relancez : `npm run electron:build:win`
3. Un nouveau fichier sera créé dans `release/`
