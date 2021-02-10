const { app, BrowserWindow } = require("electron");
const url = require("url");

const newApp = () => {
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadURL(
        url.format({
            pathname: "index.html",
            slashes: true
        })
    );
}

app.on("ready", newApp);