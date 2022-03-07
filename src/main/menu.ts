import { Menu, app, BrowserWindow } from 'electron';

const isMac = process.platform === 'darwin';

export function buildMenu(mainWindow: BrowserWindow) {
    const template: any[] = [
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
                        mainWindow.webContents.send('menu-open');
                    },
                },
                {
                    label: 'Save',
                    click: function() {
                        mainWindow.webContents.send('menu-save');
                    },
                },
                {
                    label: 'Save As',
                    click: function() {
                        mainWindow.webContents.send('menu-save-as');
                    },
                }
            ]
        }
    ];

    return Menu.buildFromTemplate(template);
}