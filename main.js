const { app, BrowserWindow, Menu } = require("electron");
const url = require("url");

const newApp = () => {
    const win = new BrowserWindow({
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

    let aboutWindow = null;
    let mixerWindow = null;

    const openAboutWindow = (e) => {
        if(aboutWindow){
            aboutWindow.focus();
            aboutWindow.show();
            return;
        }

        aboutWindow = new BrowserWindow({
            width: 400,
            height: 400,
        })

        aboutWindow.on("close", (e) => {
            aboutWindow.hide();
            e.preventDefault();
        })

        aboutWindow.loadURL(
            url.format({
                pathname: "about.html",
                slashes: true
            })
        )
        // aboutWindow.loadURL("file://./about.html");   
    }

    const openMixerWindow = (e) => {
        if(mixerWindow){
            mixerWindow.focus();
            mixerWindow.show();
            return;
        }

        mixerWindow = new BrowserWindow({
            width: 750,
            height: 300,
        })

        mixerWindow.on("close", (e) => {
            mixerWindow.hide();
            e.preventDefault();
        })

        mixerWindow.loadURL(
            url.format({
                pathname: "mixer.html",
                slashes: true
            })
        )
    }

    const menuTemplate = [
        {
            label: "File",
            submenu: [
                {
                    label: "About",
                    click: () => { openAboutWindow()}
                },
                {
                    label: "Mixer",
                    click: () => { openMixerWindow()}
                },
                {
                    type: "separator"
                },
                {
                    label: "Leave this depressing world as we succumb into the dark abyss from our own demise",
                    click: () => { app.quit()}
                }
            ]
        },
        {
            label: 'View',
            submenu: [
               {
                  role: 'reload'
               },
               {
                  role: 'toggledevtools'
               },
               {
                  type: 'separator'
               },
               {
                  role: 'resetzoom'
               },
               {
                  role: 'zoomin'
               },
               {
                  role: 'zoomout'
               },
               {
                  type: 'separator'
               },
               {
                  role: 'togglefullscreen'
               }
            ]
         },
         
         {
            role: 'window',
            submenu: [
               {
                  role: 'minimize'
               },
               {
                  role: 'close'
               }
            ]
         },
         
         {
            role: 'help',
            submenu: [
               {
                  label: 'Learn More'
               }
            ]
         }
    ];

    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);

}

app.on("ready", () => {
    newApp();
});