const path = require("path");
const fs = require("fs-extra");
const open = require("open");

// local dependencies
const notification = require("./notification");

/****************************/

// get the list of files
exports.getFiles = (files = []) => {
  console.log(files);
  // retordena os files para começar a primira pasta como principal
  let filesSort = files.sort((a, b) => {
    if (!a.fatherFolder && b.fatherFolder) {
      return -1; // a vem antes de b
    } else if (a.fatherFolder && !b.fatherFolder) {
      return 1; // b vem antes de a
    } else {
      return 0; // ordem não importa
    }
  });

  return filesSort.map((filename) => {
    const filePath = path.resolve(filename.folder, filename.path);
    const fileStats = fs.statSync(filePath);

    let nameFile =
      filename.nameFile.length > 0 ? filename.nameFile.split(",")[0] : "";

    return {
      type: filename.type,
      fatherFolder: filename.fatherFolder,
      folder: filename.nameFolder,
      name: nameFile,
      path: filePath,
      size: Number(fileStats.size / 1000).toFixed(1),
    };
  });
};

exports.getFilesInFolder = (diretorio) => {
  function listarArquivosEPastasDeUmDiretorio(diretorio, arquivos, folder) {
    if (!arquivos) arquivos = [];

    let listaDeArquivos = fs.readdirSync(diretorio);

    for (let k in listaDeArquivos) {
      let nameFatherFolder = "";
      let stat = fs.statSync(diretorio + "/" + listaDeArquivos[k]);
      if (stat.isDirectory()) {
        arquivos.push({
          type: "folder",
          fatherFolder: getNameFolder(diretorio + "/" + listaDeArquivos[k]),
          nameFolder: getNameFolder(diretorio + "/" + listaDeArquivos[k]),
          nameFile: "",
          path: diretorio + "/" + listaDeArquivos[k],
        });
      } else {
        arquivos.push({
          type: "file",
          fatherFolder: "",
          nameFolder: getNameFolder(diretorio),
          nameFile: getNameFolder(diretorio + "/" + listaDeArquivos[k]),
          path: diretorio + "/" + listaDeArquivos[k],
        });
      }
    }

    return arquivos;
  }

  let lista = listarArquivosEPastasDeUmDiretorio(diretorio);

  // notification.filesAdded(lista.length - 1);
  return lista;
};

/****************************/
// function for slice string

function getNameFolder(folderPath = "") {
  const nameSliced = folderPath.split(/[\\/]/).pop();

  return nameSliced;
}

/****************************/

// open a file
exports.openFile = (filename) => {
  const filePath = path.resolve(filename);

  // open a file using default application
  if (fs.existsSync(filePath)) {
    open(filePath);
  }
};
