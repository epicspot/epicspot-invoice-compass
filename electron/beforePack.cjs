// Creates a dummy fsevents folder so electron-builder's directory scan doesn't fail on Windows
const fs = require('fs');
const path = require('path');

module.exports = async function beforePack(context) {
  try {
    const appDir = (context && (context.appDir || (context.packager && context.packager.appDir))) || process.cwd();
    const fseventsPath = path.join(appDir, 'node_modules', 'fsevents');

    if (!fs.existsSync(fseventsPath)) {
      fs.mkdirSync(fseventsPath, { recursive: true });
      const pkgJson = path.join(fseventsPath, 'package.json');
      if (!fs.existsSync(pkgJson)) {
        fs.writeFileSync(pkgJson, JSON.stringify({ name: 'fsevents', version: '0.0.0', private: true }));
      }
    }
  } catch (err) {
    console.warn('beforePack fsevents shim warning:', err && err.message ? err.message : err);
  }
};
