const path = require('path');
const fs = require('fs-extra');
const open = require('open');


// local dependencies
const notification = require('./notification');

/****************************/

// get the list of files
exports.getFiles = (files = []) => {

    // retordena os files para começar a primira pasta como principal
    const filesSort = files.sort((a, b) => {
        if (a.folderIntern && !b.folderIntern) {
            return 1;
        }
        if (!a.folderIntern && b.folderIntern) {
            return -1;
        }
        return 0;
    });

    return filesSort.map(filename => {

        const filePath = path.resolve(filename.folder, filename.file);
        const fileStats = fs.statSync(filePath);


        return {
            folder: getFolderOrFile(filename.folder),
            name: getFolderOrFile(filename.file),
            path: filePath,
            intern: filename.folderIntern,
            size: Number(fileStats.size / 1000).toFixed(1),
        };
    });
};

/****************************/

exports.getFilesInFolder = (folder) => {

    let folderTarget = fs.readdirSync(folder)

    let files = [{
        folder: '',
        file: '',
        forderIntern: false,
        folder: false
    }]

    for (let n in folderTarget) {
        let stat = fs.statSync(folder + '/' + folderTarget[n]);

        if (!stat.isDirectory()) {
            files.push({ folder: folder, file: folder + '/' + folderTarget[n], folderIntern: false, folder: false })
        } else {
            let folderCopy = fs.readdirSync(folder + '/' + folderTarget[n])
            for (let m in folderCopy) {
                let folderCopyName = folder + '/' + folderTarget[n]
                files.push({ folder: folderCopyName, file: folder + '/' + folderTarget[n] + "/" + folderCopy[m], folderIntern: true, folder: true })
            }
        }
    }

    notification.filesAdded(files.length - 1);
    return files;
}

/****************************/
// function for slice string


function getFolderOrFile(folderPath) {
    const nameSliced = folderPath.split('/').pop();

    return nameSliced
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




