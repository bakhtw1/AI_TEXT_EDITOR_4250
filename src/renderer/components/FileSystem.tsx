import fs from 'fs/promises';
import path from 'path';
import { ipcMain, dialog, ipcRenderer } from 'electron';
import React, { createContext, useContext, useState, useEffect } from 'react';

async function showOpenDialog() {
    return await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections']
    });
}

async function showSaveDialog() {
    return await dialog.showSaveDialog({})
}

export function setupHandlers() {
    ipcMain.handle('show-open-dialog', showOpenDialog);
    ipcMain.handle('show-save-dialog', showSaveDialog);
}

export class AppFile {
    path: string;
    content: string;
    isNewFile: boolean;

    get name(): string {
        return path.basename(this.path);
    }

    get extension(): string {
        return path.extname(this.path);
    }

    constructor(path?: string) {
        if (path) {
            this.path = path;
            this.isNewFile = false;
        } else {
            this.path = 'Untitled';
            this.isNewFile = true;
        }
        
        this.content = '';
    }

    public async open() {
        this.content = await fs.readFile(this.path, 'utf8');
    }

    public async save() {
        let writePath = this.path;

        if (this.isNewFile) {
            const res = await ipcRenderer.invoke('show-save-dialog');
            writePath = res.filePath as string;

            if (!writePath) {
                return;
            }

            this.path = writePath;
            this.isNewFile = false;
        }

        await fs.writeFile(writePath, this.content);
    }

    public async saveAs() {
        const res = await ipcRenderer.invoke('show-save-dialog');
        
        if (!res.filePath) {
            return;
        }

        this.path = res.filePath as string;

        await fs.writeFile(this.path, this.content);
    }
}

interface IAppFileSystem {
    files: AppFile[],
    openFile: (path?: string) => void,
    newFile: () => void,
    updateFile: (file: AppFile, content: string) => void,
    currentFileIdx: number,
    setCurrentFileIdx: (idx: number) => void,
}

const FileSystemContext = createContext<IAppFileSystem | null>(null);

interface FileSystemProviderProps {
    children: React.ReactNode
}

export function FileSystemProvider(props: FileSystemProviderProps) {
    const [files, setFiles] = useState<AppFile[]>([new AppFile()]);
    const [currentFileIdx, setCurrentFileIdx] = useState(0);

    useEffect(() => {
        ipcRenderer.on('menu-open', async function() {
            await openFile();
        });
        ipcRenderer.on('menu-save', async function() {
            await files[currentFileIdx].save();
        });
        ipcRenderer.on('menu-save-as', async function() {
            await files[currentFileIdx].saveAs();
        });
    }, []);

    async function openFile(path?: string) {
        if (!path) {
            const res = await ipcRenderer.invoke('show-open-dialog');

            path = res.filePaths[0] as string;

            if (!path) {
                return;
            }
        }

        let newAppFile = new AppFile(path);
        await newAppFile.open();

        setFiles([
            ...files,
            newAppFile,
        ]);
    }

    function newFile() {
        setFiles([
            ...files,
            new AppFile(),
        ]);
    }

    function updateFile(file: AppFile, content: string) {
        const newFiles = [...fileSystem.files];

        newFiles.forEach((f: AppFile) => {
            if (f.path == file.path) {
                f.content = content;
            }
        });

        setFiles(newFiles);
    }

    const fileSystem: IAppFileSystem = {
        files,
        openFile,
        newFile,
        updateFile,
        currentFileIdx,
        setCurrentFileIdx,
    }

    return (
        <FileSystemContext.Provider
            value={fileSystem}
        >
            {props.children}
        </FileSystemContext.Provider>
    );
}

export function useFileSystem() {
    return useContext(FileSystemContext);
}