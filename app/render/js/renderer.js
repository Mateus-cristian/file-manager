const dragDrop = require('drag-drop');
const { ipcRenderer } = require('electron');

// local dependencies
const dom = require('./dom');

/*****************************/

// open filesystem dialog
window.openDialog = () => {
    ipcRenderer.invoke('app:on-fs-dialog-open').then((files = []) => {
        dom.displayFiles(files);
    });
}

const dialog = document.getElementsByClassName('dialog')

// open filesystem dialog
dialog.addEventListener('click', () => {
    ipcRenderer.invoke('app:on-fs-dialog-open').then((files = []) => {
        dom.displayFiles(files);
    });
})





