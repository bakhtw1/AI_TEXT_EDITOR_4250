import { ipcMain, BrowserWindow } from 'electron';
import * as os from "os";
const pty = require( "node-pty");

export default function createTermProcess() {
    const mainWindow = BrowserWindow.getFocusedWindow();
    var shell = os.platform() === "win32" ? "powershell.exe" : "bash";
    var ptyProcess = pty.spawn(shell, [], {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env,
    });

    ptyProcess.on("data", (data: any) => {
        mainWindow?.webContents.send("terminal-incData", data);
    });
      
    ipcMain.on("terminal-into", (event, data) => {
        ptyProcess.write(data);
    });

}