import { app, BrowserWindow, Menu } from "electron";
import * as path from "path";
import * as url from "url";
import createTermProcess from "./terminal";


import assistantServer from './assistant_server';
import fileSystem from './file_system';

const isMac = process.platform === 'darwin';
let mainWindow: Electron.BrowserWindow | null;

const applicationMenuTemplate: any[] = [
  ...(isMac ? [{
  label: app.name,
  submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
  ]
  }] : []),
  {
      label: 'File',
      submenu: [
          {
              label: 'Open',
              click: function() {
                  mainWindow!.webContents.send('menu-open');
              },
          },
          {
              label: 'Save',
              click: function() {
                  mainWindow!.webContents.send('menu-save');
              },
          },
          {
              label: 'Save As',
              click: function() {
                  mainWindow!.webContents.send('menu-save-as');
              },
          }
      ]
  }
];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    backgroundColor: "#f2f2f2",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: process.env.NODE_ENV !== "production",
      webSecurity: false,
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:4000");
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "renderer/index.html"),
        protocol: "file:",
        slashes: true, 
      })
    );
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (isMac) {
    assistantServer.start();
  }
  
  fileSystem.setupHandlers();
  createTermProcess();

  Menu.setApplicationMenu(
    Menu.buildFromTemplate(applicationMenuTemplate));

  if (process.env.NODE_ENV !== 'production') {
    mainWindow.webContents.openDevTools();
  }

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
