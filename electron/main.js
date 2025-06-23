import { app, BrowserWindow, ipcMain } from 'electron';
import { resolve } from 'path';
import { autoUpdater } from 'electron-updater';

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        fullscreen: false,
        frame: true, // Affiche les boutons natifs
        autoHideMenuBar: true, // Masque la barre de menu (File, Edit, ...)
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
        mainWindow.loadFile(resolve(__dirname, '../dist/index.html'));
    }

    mainWindow.webContents.on('did-finish-load', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });

    // Bloque tous les raccourcis connus pour ouvrir DevTools
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (
            input.key === 'F12' ||
            (input.control && input.shift && input.key.toLowerCase() === 'i') ||
            (input.meta && input.alt && input.key.toLowerCase() === 'i') ||
            (input.control && input.alt && input.key.toLowerCase() === 'i')
        ) {
            event.preventDefault();
        }
    });

    // Bloque toute ouverture programmée des DevTools
    mainWindow.webContents.on('devtools-opened', () => {
        mainWindow.webContents.closeDevTools();
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

ipcMain.handle('check-for-updates', async () => {
    autoUpdater.checkForUpdatesAndNotify();
});