import fs from 'fs/promises';
import path from 'path';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { createContext, useContext, useState, useEffect } from 'react';

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
    exploreDirectory: (treeItem: FileTreeItem, replace: boolean) => void,
    currentRenamingTreeItem: FileTreeItem | null,
    setCurrentRenamingTreeItem: (item: FileTreeItem | null) => void,
    renameTreeItem: (newName: string) => void,
    updateFileTree: () => void,
    closeFile: (fileId: number) => void,
    searchDirectory: (searchTerm: string) => Promise<string[]>,
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
    const [currentRenamingTreeItem, setCurrentRenamingTreeItem] = useState<FileTreeItem | null>(null);

    useEffect(() => {
        ipcRenderer.on('menu-open', async function() {
            await open();
        });
        ipcRenderer.on('menu-save', async function() {
            await files[currentFileIdx].save();

            updateFileTree();
        });
        ipcRenderer.on('menu-save-as', async function() {
            await files[currentFileIdx].saveAs();

            updateFileTree();
        });
        ipcRenderer.on('set-rename-item', function(event: IpcRendererEvent, ...args: any[]) {
            if (args.length == 0) {
                setCurrentRenamingTreeItem(null);
            } else {
                const treeItem = args[0] as FileTreeItem;
                setCurrentRenamingTreeItem(treeItem);
            }
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

    function closeFile(fileId: number) {
        const allFiles = [...files];
        const openFiles = [];

        for (let i = 0; i < allFiles.length; i++) {
            if (i !== fileId) {
                openFiles.push(allFiles[i]);
            }
        }
        
        setFiles(openFiles);
    }

    function updateFileTree() {
        const currentPaths = explorerTree.map((item) => item.path);
        let newExplorerTree = [...explorerTree];

        for (const file of files) {
            if (!currentPaths.includes(file.path) && !file.isNewFile) {
                newExplorerTree.push(new FileTreeItem(file.path, false));
            }
        }

        setExplorerTree(newExplorerTree);
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

    async function renameTreeItem(newName: string) {
        if (currentRenamingTreeItem == null) {
            return;
        }

        const currentPath = currentRenamingTreeItem.path;
        const newPath = path.join(path.dirname(currentRenamingTreeItem.path), newName);

        await fs.rename(currentPath, newPath);

        const relativePath = currentRenamingTreeItem.path.slice(baseDirectory.length);
        const pathParts = relativePath.split(path.sep).filter((v) => v !== '').reverse();
        const depth = pathParts.length;

        let fileTree = [...explorerTree];
        let curLevel = fileTree;

        for (let i = 0; i < depth; i++) {
            for (const levelItem of curLevel) {
                if (levelItem.name == pathParts[pathParts.length - 1]) {
                    if (levelItem.path == currentRenamingTreeItem.path) {
                        levelItem.path = newPath;
                    }

                    curLevel = levelItem.children;
                    pathParts.pop();

                    break;
                }
            }
        }

        setExplorerTree(fileTree);
        setCurrentRenamingTreeItem(null);
    }

    async function searchFile(searchTerm: string, filePath: string) {
        const file = await fs.readFile(filePath, 'utf8');
        if (file.indexOf(searchTerm) !== -1) {
            return true;
        }
        return false;
    }

    async function searchDirectory(searchTerm : string) {

        let stack = [[...explorerTree]];

        let results : string[] = [];

        while (stack.length > 0) {
            const curLevel = stack.pop()!;
            let nextLevel : FileTreeItem[] = [];
            for (const item of curLevel) {
                if (item.directory) {
                    nextLevel = nextLevel.concat(item.children);
                }
                else {
                    if (await searchFile(searchTerm, item.path)) {
                        results.push(item.path);
                    }
                }
            }
            if (nextLevel.length > 0) {
                stack.push(nextLevel);
            }
        }
        
        return results;
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
        currentRenamingTreeItem,
        setCurrentRenamingTreeItem,
        renameTreeItem,
        updateFileTree,
        closeFile,
        searchDirectory
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