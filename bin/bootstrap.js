const { app, BrowserWindow } = require('electron')

function createWindow () {
    let win = new BrowserWindow({
        width: 1280,
        height: 720,
        useContentSize: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: false
        }
    });
    
    win.setBackgroundColor("#000000");
    win.loadFile('./index.html');
    win.setFullScreen(true);
}

app.whenReady().then(createWindow)