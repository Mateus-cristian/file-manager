const { ipcRenderer } = require("electron");

// local dependencies
const dom = require("./dom");

/*****************************/

// // open filesystem dialog
// window.openDialog = () => {
//   ipcRenderer.invoke("app:on-fs-dialog-open").then((files = []) => {
//     dom.displayFiles(files);
//   });
// };

const dialog = document.getElementById("dialog");

// open filesystem dialog
dialog.addEventListener("click", () => {
  ipcRenderer.invoke("app:on-fs-dialog-open").then((files = []) => {
    dom.displayFiles(files);
  });
});

window.addEventListener("click", (e) => {
  e.preventDefault();

  let detail = e.target.parentElement;

  if (detail.getAttribute("open")) {
    const id = e.target.id;
    dom.removeFiles(id);
    return;
  }

  if (e.target.tagName === "SUMMARY") {
    let filepath = "";
    filepath = e.target.getAttribute("data-filepath");
    const id = e.target.id;

    ipcRenderer
      .invoke("app:on-get-files", filepath.toString(), id)
      .then((files = [], id) => {
        dom.displayFiles(files.directory, files.id);
      });
  }
});
