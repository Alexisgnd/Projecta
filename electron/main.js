const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        fullscreen: false,
        frame: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Dev ou production ?
    const isDev = !!process.env.VITE_DEV_SERVER_URL;

    // En dev : serveur Vite
    if (isDev) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        mainWindow.webContents.openDevTools(); // outils dev auto en dev
    } else {
        // En prod : fichier local
        mainWindow.loadFile(path.resolve(__dirname, '../dist/index.html'));
    }

    // Vérifie les mises à jour après chargement
    mainWindow.webContents.on('did-finish-load', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });

    // 🚫 Sécurisation stricte des DevTools en prod
    if (!isDev) {
        // 1. Bloque raccourcis clavier
        mainWindow.webContents.on('before-input-event', (event, input) => {
            const isDevToolsShortcut =
                input.key === 'F12' ||
                (input.control && input.shift && ['i', 'c'].includes(input.key.toLowerCase())) ||
                (input.meta && input.alt && ['i', 'c'].includes(input.key.toLowerCase())) ||
                (input.control && input.alt && input.key.toLowerCase() === 'i') ||
                (input.meta && input.key.toLowerCase() === 'k') ||
                (input.key === 'F10' && input.shift);

            if (isDevToolsShortcut) {
                event.preventDefault();
            }
        });

        // 2. Ferme automatiquement DevTools
        mainWindow.webContents.on('devtools-opened', () => {
            mainWindow.webContents.closeDevTools();
        });

        // 3. Bloque menu contextuel (clic droit)
        mainWindow.webContents.on('context-menu', (e) => {
            e.preventDefault();
        });
    }
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

// IPC : déclenche manuellement la mise à jour (depuis renderer si besoin)
ipcMain.handle('check-for-updates', async () => {
    autoUpdater.checkForUpdatesAndNotify();
});
