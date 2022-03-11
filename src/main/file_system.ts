import { ipcMain, dialog, Menu, IpcMainInvokeEvent, BrowserWindow } from 'electron';
import { FileTreeItem } from '../renderer/components/FileSystem';

async function showOpenDialog() {
    return await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections', 'openDirectory']
    });
}

async function showSaveDialog() {
    return await dialog.showSaveDialog({})
}

async function showFileExplorerContextMenu(event: IpcMainInvokeEvent, ...args: any[]) {
    if (args.length == 0) {
        return;
    }

    const mainWindow = BrowserWindow.getFocusedWindow();
    const fileTreeItem = args[0] as FileTreeItem;

    Menu.buildFromTemplate([
        {
            label: 'Rename',
            click: function() {
                mainWindow?.webContents.send('set-rename-item', fileTreeItem);
            }
        }
    ]).popup();
}

function setupHandlers() {
    ipcMain.handle('show-open-dialog', showOpenDialog);
    ipcMain.handle('show-save-dialog', showSaveDialog);
    ipcMain.handle('show-fx-context', showFileExplorerContextMenu);
}

export default {
    setupHandlers
}