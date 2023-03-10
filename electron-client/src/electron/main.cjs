const { app, ipcMain, BrowserWindow, Notification } = require("electron");
const serve = require("electron-serve");
const windowState = require("electron-window-state");

const loadURL = serve({ directory: "build" });
const port = process.env.PORT || 5173;
const dev = !app.isPackaged || (process.env.NODE_ENV == "development");

const createMainWindow = () => {
    let mws = windowState({
        defaultWidth: 1000,
        defaultHeight: 800
    });

    const mainwindow = new BrowserWindow({
        x: mws.x,
        y: mws.y,
        width: mws.width,
        height: mws.height,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: dev || true
        }
    });

    mws.manage(mainwindow);

    // Remove menu bar
    mainwindow.removeMenu();

    // Enable dev tools if dev mode is on
    dev && mainwindow.webContents.toggleDevTools();

    // Load content
    if (dev) {
        // Load vite dev server
        const loadVite = () => {
            mainwindow.loadURL(`http://localhost:${port}`).catch(() => {
                // Retry if vite is not up
                setTimeout(loadVite, 200);
            });
        }
        loadVite();
    } else {
        loadURL(mainwindow)
    }
}

// Misc app listeners
app.once("ready", createMainWindow);
app.on("activate", () => { if (!mainwindow) createMainWindow(); });
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });

// Notification listener
ipcMain.on("app:notification", (event, data) => {
    let notification = new Notification({
        title: data.title,
        body: data.body
    });

    notification.onclick = () => {
        mainwindow.show();
    };

    notification.show();
});