const { ipcRenderer } = require("electron");


// open file
window.openFile = function (itemId) {
    // get path of the file
    const itemNode = document.getElementById(itemId);
    const filepath = itemNode.getAttribute("data-filepath");

    // send event to the main thread
    ipcRenderer.send("app:on-file-open", { id: itemId, filepath });
};

exports.displayFiles = (files = []) => {
    const fileListElem = document.getElementById("filelist");
    fileListElem.innerHTML = "";
    let previousFolder = "";

    const folderSet = new Set(); // Conjunto de folder.name únicos

    files.forEach((file) => {
        const itemDomElem = document.createElement("div");
        itemDomElem.setAttribute("id", file.name); // set `id` attribute
        itemDomElem.setAttribute("class", "app__files__container"); // set `class` attribute
        itemDomElem.setAttribute("data-filepath", file.path); // set `data-filepath` attribute

        if (file.intern) {
            if (!folderSet.has(file.folder)) {
                folderSet.add(file.folder);

                const detailsElem = document.createElement("details");
                const summaryElem = document.createElement("summary");

                summaryElem.className = "app__files__container__title";
                summaryElem.innerHTML = `
                                ${file.folder}`;
                detailsElem.appendChild(summaryElem);

                fileListElem.appendChild(detailsElem); // Adiciona o detailsElem ao fileListElem
            }

            itemDomElem.innerHTML = `
            <div class="app__files__container__item">
                <img ondragstart='copyFile(event, "${file.name}")' src='../assets/document.svg' class='app__files__item__file'/>
                <div class='app__files__item__info'>
                <p class='app__files__item__info__name'>${file.name}</p>
                <p class='app__files__item__info__size'>${file.size}KB</p>
                </div>
                <img onclick='openFile("${file.name}")' src='../assets/open.svg' class='app__files__item__open'/>
            </div>
            `;

            const detailsElem = fileListElem.lastElementChild; // Obtém o último elemento (details) adicionado ao fileListElem
            detailsElem.appendChild(itemDomElem); // Adiciona o itemDomElem como filho do detailsElem
        } else {
            if (previousFolder !== file.folder) {
                itemDomElem.innerHTML = `
            <div class="app__files__container__title">
                <img src='../assets/folder.svg' class='app__files__item__file'/>
                <p class="app__file__container__title__principal">Diretório principal: ${file.folder}</p>
            </div>`
            } else {
                itemDomElem.innerHTML = ''
            }


            itemDomElem.innerHTML += `
            <div class="app__files__container__item">
                <img ondragstart='copyFile(event, "${file.name}")' src='../assets/document.svg' class='app__files__item__file'/>
                <div class='app__files__item__info'>
                <p class='app__files__item__info__name'>${file.name}</p>
                <p class='app__files__item__info__size'>${file.size}KB</p>
                </div>
                <img onclick='openFile("${file.name}")' src='../assets/open.svg' class='app__files__item__open'/>
            </div>
            `;
            previousFolder = file.folder
            fileListElem.appendChild(itemDomElem); // Adiciona o itemDomElem ao fileListElem
        }
    });
};
