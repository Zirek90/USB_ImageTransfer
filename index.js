const { app, BrowserWindow } = require('electron')

let win;

function boot() {
    win = new BrowserWindow({
        width: 1000, 
        height: 800,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.loadURL('file://' + __dirname + '/index.html')

    win.webContents.openDevTools();

    win.on('close', () => win = null)

}

app.on('ready', boot)


