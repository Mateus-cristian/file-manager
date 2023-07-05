const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

// local dependencies
const io = require("./main/io");
``;

let win;
// open a window
const openWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    // load `index.html` file
    win.loadFile(path.resolve(__dirname, "render/html/index.html"));

    /*-----*/

    return win; // return window
};

// when app is ready, open a window
app.on("ready", () => {

    // Código a ser executado quando o Electron estiver pronto faz a busca pela pasta output
    const appFolderOutputPath = path.join(app.getAppPath(), "output");

    let filesInFolder = io.getFilesInFolder(appFolderOutputPath);
    let directory = io.getFiles(filesInFolder);

    ipcMain.handle("app:on-get-files-loaded", () => {
        return directory;
    });

    openWindow();
});

// when all windows are closed, quit the app
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// when app activates, open a window
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        openWindow();
    }
});

/************************/

// Função para mostrar a mensagem de carregamento
function showLoadingMessage() {
    win.webContents.send('show-loading-message');
}

// Função para ocultar a mensagem de carregamento
function hideLoadingMessage() {
    win.webContents.send('hide-loading-message');
}

/************************/

// return list of files
ipcMain.handle("app:get-files", () => {
    return io.getFiles();
});

// open filesystem dialog to choose files
ipcMain.handle("app:on-fs-dialog-open", (event) => {
    const files = dialog.showOpenDialogSync({
        properties: ['openFile'],
        filters: [
            { name: 'Arquivos de Texto', extensions: ['txt'] }
        ]
    });

    const fileName = files[0];

    // Executar o comando Python e, em seguida, le as pastas geradas
    const filesOutput = executePythonScript(fileName)
        .then(() => {
            hideLoadingMessage()

            const appFolderOutputPath = path.join(app.getAppPath(), "output");

            let filesInFolder = io.getFilesInFolder(appFolderOutputPath);
            let directory = io.getFiles(filesInFolder);


            return directory;
        })
        .catch((error) => {
            hideLoadingMessage()
            console.error("Ocorreu um erro ao executar o script Python:", error);
            const emptyFolder = []
            return emptyFolder;
        });

    return filesOutput;
});

// Função para executar o comando Python
function executePythonScript(fileName) {
    const pythonScript = path.join(__dirname, "reader.py");
    showLoadingMessage()
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn("python3", [pythonScript, fileName]);

        let errorMessages = ""; // Variável para armazenar as linhas de erro caso tenha

        pythonProcess.stderr.on("data", (data) => {
            const errorMessage = data.toString();
            errorMessages += errorMessage; // Concatena as linhas de erro
        });

        pythonProcess.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                const errorMessage =
                    errorMessages ||
                    `O script Python retornou um código de erro: ${code}`;
                reject(new Error(errorMessage));
            }
        });
    });
}

// get files
ipcMain.handle("app:on-get-files", (event, files, id) => {
    let filesInFolder = io.getFilesInFolder(files);
    let directory = io.getFiles(filesInFolder);

    return { directory, id };
});

// listen to file open event
ipcMain.handle("app:on-file-open", (event, file) => {
    return io.openFile(file.filePath)
});
