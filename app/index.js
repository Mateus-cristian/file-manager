const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

// local dependencies
const io = require('./main/io');
``
// open a window
const openWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    });

    // load `index.html` file
    win.loadFile(path.resolve(__dirname, 'render/html/index.html'));

    /*-----*/

    return win; // return window
};

// when app is ready, open a window
app.on('ready', () => {
    openWindow();
});

// when all windows are closed, quit the app
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// when app activates, open a window
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        openWindow();
    }
});

/************************/

// return list of files
ipcMain.handle('app:get-files', () => {
    return io.getFiles();
});

// open filesystem dialog to choose files
ipcMain.handle('app:on-fs-dialog-open', (event) => {
    const files = dialog.showOpenDialogSync({
        properties: ['openDirectory', 'multiSelections'],
    });

    let filesInFolder = io.getFilesInFolder(files[0]).filter(x => x.file.length > 0);

    let directory = io.getFiles(filesInFolder);

    return directory;
});


// listen to file open event
ipcMain.on('app:on-file-open', (event, file) => {
    io.openFile(file.filepath);
});

