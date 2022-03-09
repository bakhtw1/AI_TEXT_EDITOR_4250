import fs from 'fs/promises';
import path from 'path';
import { ipcMain, dialog, ipcRenderer } from 'electron';
import React, { createContext, useContext, useState, useEffect } from 'react';

async function showOpenDialog() {
    return await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections', 'openDirectory']
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
        return path.extname(this.path).slice(1);
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

export class FileTreeItem {
    path: string;
    directory: boolean;
    children: FileTreeItem[];
    explored: boolean;

    get name(): string {
        return path.basename(this.path);
    }

    constructor(path: string, directory: boolean) {
        this.path = path;
        this.directory = directory;
        this.explored = false;

        this.children = [];
    }

    public async explore() {
        if (!this.directory) {
            return;
        }

        const fsChildren = await fs.readdir(this.path);

        for (const fsItem of fsChildren) {
            const newPath = path.join(this.path, fsItem);
            const stats = await fs.lstat(newPath);

            this.children.push(new FileTreeItem(newPath, stats.isDirectory()));
        }

        this.explored = true;
    }
}

interface IAppFileSystem {
    files: AppFile[],
    open: (item?: FileTreeItem) => void,
    newFile: () => void,
    updateFile: (file: AppFile, content: string) => void,
    currentFileIdx: number,
    setCurrentFileIdx: (idx: number) => void,
    explorerTree: FileTreeItem[],
    exploreDirectory: (treeItem: FileTreeItem, replace: boolean) => void
}

const FileSystemContext = createContext<IAppFileSystem | null>(null);

interface FileSystemProviderProps {
    children: React.ReactNode
}

export function FileSystemProvider(props: FileSystemProviderProps) {
    const [files, setFiles] = useState<AppFile[]>([new AppFile()]);
    const [fileCount, setFileCount] = useState(1);
    const [currentFileIdx, setCurrentFileIdx] = useState(0);
    const [explorerTree, setExplorerTree] = useState<FileTreeItem[]>([]);
    const [baseDirectory, setBaseDirectory] = useState('');

    useEffect(() => {
        ipcRenderer.on('menu-open', async function() {
            await open();
        });
        ipcRenderer.on('menu-save', async function() {
            await files[currentFileIdx].save();
        });
        ipcRenderer.on('menu-save-as', async function() {
            await files[currentFileIdx].saveAs();
        });
    }, []);

    useEffect(() => {
        if (files.length != fileCount) {
            setCurrentFileIdx(files.length - 1);

            setFileCount(files.length);
        }
    }, [files]);

    async function open(item?: FileTreeItem) {
        if (!item) {
            const res = await ipcRenderer.invoke('show-open-dialog');
            const path = res.filePaths[0] as string;

            if (!path) {
                return;
            }

            const stats = await fs.lstat(path);
            item = new FileTreeItem(path, stats.isDirectory());

            if (item.directory) {
                return await exploreDirectory(item, true);
            }
        }

        let newAppFile = new AppFile(item.path);
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

    async function exploreDirectory(treeItem: FileTreeItem, replace: boolean = false) { 
        if (replace) {
            await treeItem.explore();
            setBaseDirectory(treeItem.path);
            setExplorerTree([...treeItem.children]);
            return;
        }

        const relativePath = treeItem.path.slice(baseDirectory.length);
        const pathParts = relativePath.split(path.sep).filter((v) => v !== '').reverse();
        const depth = pathParts.length;

        let fileTree = [...explorerTree];
        let curLevel = fileTree;

        for (let i = 0; i < depth; i++) {
            for (const levelItem of curLevel) {
                if (levelItem.name == pathParts[pathParts.length - 1]) {
                    if (levelItem.path == treeItem.path) {
                        await levelItem.explore();
                    }

                    curLevel = levelItem.children;
                    pathParts.pop();

                    break;
                }
            }
        }

        setExplorerTree(fileTree);
    }

    const fileSystem: IAppFileSystem = {
        files,
        open,
        newFile,
        updateFile,
        currentFileIdx,
        setCurrentFileIdx,
        explorerTree,
        exploreDirectory,
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