const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

// local dependencies
const io = require("./main/io");
``;
// open a window
const openWindow = () => {
  const win = new BrowserWindow({
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

// return list of files
ipcMain.handle("app:get-files", () => {
  return io.getFiles();
});

// open filesystem dialog to choose files
ipcMain.handle("app:on-fs-dialog-open", (event) => {
  const files = dialog.showOpenDialogSync({
    properties: ["openFile"],
  });

  const fileName = files[0];

  // Executar o comando Python e, em seguida, ler as pastas geradas
  executePythonScript(fileName)
    .then(() => {
      console.log("Script Python concluído com sucesso.");
    })
    .catch((error) => {
      console.error("Ocorreu um erro ao executar o script Python:", error);
    });
});

// Função para executar o comando Python
function executePythonScript(fileName) {
  const pythonScript = path.join(__dirname, "reader.py");
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python3", [pythonScript, fileName]);

    let errorMessages = ""; // Variável para armazenar as linhas de erro

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
ipcMain.on("app:on-file-open", (event, file) => {
  io.openFile(file.filepath);
});
