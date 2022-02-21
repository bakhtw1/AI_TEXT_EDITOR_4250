import { ipcMain, dialog, OpenDialogOptions, OpenDialogReturnValue, IpcMainInvokeEvent } from "electron";
import { readFileSync } from "fs";

export default class FileOps {

  constructor () {}

  getFileOrDirectory = async (event:IpcMainInvokeEvent) : Promise<OpenDialogReturnValue> => {
    const options: OpenDialogOptions = {
      properties: ['openFile', 'multiSelections']
    };
      
    const res = await dialog.showOpenDialog(options);
    return res
  }

  getFile = async (event:IpcMainInvokeEvent, path:string) : Promise<string> => {
    return readFileSync(path, 'utf8');
  }

  attachHandles() {
    ipcMain.handle('file-dialog-handle', this.getFileOrDirectory);   
    ipcMain.handle('file-contents-handle', this.getFile);
  }

}