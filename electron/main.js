const { app, BrowserWindow } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        fullscreen: false,
        frame: true, // When false : Disable or not the window frame (including the toolbar)
        autoHideMenuBar: false, // When true : Automatically hide the menu bar
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Vérification : si on est en mode dev, on charge le serveur Vite
    // sinon on charge le build dist
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }

    mainWindow.webContents.on('did-finish-load', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

autoUpdater.on('update-available', () => {
    // Optionnel : informer l'utilisateur qu'une mise à jour est en cours de téléchargement
});
autoUpdater.on('update-downloaded', () => {
    // Optionnel : demander à l'utilisateur de redémarrer pour appliquer la mise à jour
});