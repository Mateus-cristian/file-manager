const { ipcRenderer } = require("electron");

// open file
window.openFile = function (filePath) {

    // send event to the main thread
    ipcRenderer.invoke("app:on-file-open", { filePath: filePath }).then((fileText) => {

        document.getElementById('openedFile').style.display = 'flex';

        const fileExist = document.getElementById('textFile')
        if (fileExist) {
            fileExist.innerText = fileText;
            return;
        }

        fileElem = document.getElementById("openedFile");
        const itemDomElem = document.createElement("p");
        itemDomElem.setAttribute("id", 'textFile');
        itemDomElem.innerText = fileText;

        fileElem.appendChild(itemDomElem)

    });
};

exports.displayFiles = (files = [], id) => {
    let fileListElem = HTMLElement;
    if (id) {
        fileListElem = document.getElementById(id);
        fileListElem.parentElement.setAttribute("open", true);
    } else {
        fileListElem = document.getElementById("filelist");
        fileListElem.innerHTML = "";
    }

    let previousFolder = "";

    const folderSet = new Set(); // Conjunto de folder.name únicos

    files.forEach((file) => {

        const itemDomElem = document.createElement("div");
        itemDomElem.setAttribute("id", file.name); // set `id` attribute
        itemDomElem.setAttribute("class", "app__files__container"); // set `class` attribute

        if (file.type === "folder") {
            if (!folderSet.has(file.folder)) {
                folderSet.add(file.folder);

                const detailsElem = document.createElement("details");

                const summaryElem = document.createElement("summary");
                summaryElem.setAttribute("data-filepath", file.path);
                summaryElem.setAttribute("id", file.folder);

                // summaryElem.addEventListener("click", () => {
                //   openFile(file.folder);
                // });

                summaryElem.className = "app__files__container__title";
                summaryElem.innerHTML = `
        ${file.folder}`;
                detailsElem.appendChild(summaryElem);

                fileListElem.appendChild(detailsElem); // Adiciona o detailsElem ao fileListElem
            }

            const detailsElem = fileListElem.lastElementChild; // Obtém o último elemento (details) adicionado ao fileListElem
            detailsElem.appendChild(itemDomElem); // Adiciona o itemDomElem como filho do detailsElem
        } else {
            itemDomElem.setAttribute("data-filepath", file.path); // set `data-filepath` attribute

            itemDomElem.innerHTML += `
            <div class="app__files__container__item">
                <img ondragstart='copyFile(event, "${file.name}")' src='../assets/document.svg' class='app__files__item__file'/>
                <div class='app__files__item__info'>
                <p class='app__files__item__info__name'>${file.name}</p>
                <p class='app__files__item__info__size'>${file.size}KB</p>
                </div>
                <img onclick='openFile("${file.path}")' src='../assets/open.svg' class='app__files__item__open'/>
            </div>
            `;
            previousFolder = file.folder;
            fileListElem.appendChild(itemDomElem); // Adiciona o itemDomElem ao fileListElem
        }
    });
};

exports.removeFiles = (id) => {
    const fileListElem = document.getElementById(id);
    fileListElem.parentElement.removeAttribute("open");
    fileListElem.innerHTML = id;
};
