const { ipcRenderer } = require("electron");

// local dependencies
const dom = require("./dom");

// get list of files from the `main` process
ipcRenderer.invoke('app:get-files').then((files = []) => {
    dom.displayFiles(files);
});

// get list of files from the `main` process
ipcRenderer.invoke('app:on-get-files-loaded').then((files = []) => {
    dom.displayFiles(files);
});


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

const buttonSearch = document.getElementById('buttonSearch')
const highlightNext = document.getElementById('highlightNext')
const highlightPrevious = document.getElementById('highlightPrevious')


let currentIndex = -1;
let highlightedIndices = [];


// Busca pela palavra do input text,conta os elementos achados e marca no primeiro elemento encontrado
//se não encontrar nada retorna e o texto segue normal
buttonSearch.addEventListener('click', function (e) {
    e.preventDefault();

    const textInputSearch = document.getElementById('inputSearch');
    const textInput = textInputSearch.value;

    const counter = document.getElementById('counter');
    counter.textContent = ''

    if (!textInput) {
        highlightedIndices = [];
        return;
    }

    const textFile = document.getElementById('textFile');

    textFile.innerHTML = textFile.innerHTML.replaceAll('<br>', '/--/');
    const text = textFile.textContent;
    const regex = new RegExp(textInput, 'g');
    let match;

    let highlightedText = text;
    highlightedIndices = [];



    while ((match = regex.exec(text)) !== null) {
        const startIndex = match.index;
        const endIndex = regex.lastIndex;
        highlightedIndices.push({ startIndex: startIndex, endIndex: endIndex });
    }

    if (match = regex.exec(text) === null) {
        highlightedIndices = [];
        restructureText()
        return;
    }

    currentIndex = highlightedIndices.length > 0 ? 0 : -1;


    updateCounter();
    highlightCurrent();
});

//Para trocar de palavra selecionada para frente
highlightNext.addEventListener('click', function () {
    if (highlightedIndices.length > 0) {
        const textFile = document.getElementById('textFile');
        textFile.innerHTML = textFile.innerHTML.replaceAll('<br>', '/--/');

        currentIndex = (currentIndex + 1) % highlightedIndices.length;
        updateCounter();
        highlightCurrent();
    }
});

//Para trocar de palavra selecionada para trás
highlightPrevious.addEventListener('click', function () {
    if (highlightedIndices.length > 0) {
        const textFile = document.getElementById('textFile');
        textFile.innerHTML = textFile.innerHTML.replaceAll('<br>', '/--/');

        currentIndex = (currentIndex - 1 + highlightedIndices.length) % highlightedIndices.length;
        updateCounter();
        highlightCurrent();
    }
});

// Função que marca a palavra selecionada e ao final da o scroll até a palavra
function highlightCurrent() {
    const textFile = document.getElementById('textFile');
    const highlightedElements = textFile.getElementsByClassName('highlightText');


    for (let i = 0; i < highlightedElements.length; i++) {
        highlightedElements[i].classList.remove('highlightText');
    }

    if (currentIndex !== -1) {
        const currentIndices = highlightedIndices[currentIndex];
        let highlightedText =
            textFile.textContent.slice(0, currentIndices.startIndex) +
            '<span class="highlightText">' +
            textFile.textContent.slice(currentIndices.startIndex, currentIndices.endIndex) +
            '</span>' +
            textFile.textContent.slice(currentIndices.endIndex);

        highlightedText = highlightedText.replaceAll('/--/', '<br>');

        textFile.innerHTML = highlightedText;

    }


    // restructureText();

    let element = highlightedElements[0];


    if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }

}

// Função que verifica se o elemento a dar scroll está visível na tela
function isElementOutOfView(element) {
    const elementTop = element.offsetTop;

    const elementHeight = element.offsetHeight;
    const viewportHeight = window.innerHeight;

    return (elementTop + elementHeight) < 0 || elementTop > viewportHeight;
}

// função que deixa a estrutura do texto originalmente como antes de fazer as manipulações
function restructureText() {
    let textFile = document.getElementById('textFile');

    if (textFile.innerHTML.includes('/--/')) {
        textFile.innerHTML = textFile.innerHTML.replaceAll('/--/', '<br>');
    }
}

function updateCounter() {
    const counter = document.getElementById('counter');
    counter.textContent = `${currentIndex + 1} de ${highlightedIndices.length}`;
}



// funções para quando o documento esteja dando upload assim mostra o loading e retira ao final
ipcRenderer.on('show-loading-message', () => {
    const loadingDiv = document.getElementById('loading-message');
    loadingDiv.style.display = 'flex';

    document.getElementById('navbar').style.display = 'none';
    document.getElementById('filelist').style.display = 'none';
    document.getElementById('uploader').style.display = 'none';
});

ipcRenderer.on('hide-loading-message', () => {
    const loadingDiv = document.getElementById('loading-message');
    loadingDiv.style.display = 'none';

    document.getElementById('navbar').style.display = 'flex';

    document.getElementById('filelist').style.display = 'block';
    document.getElementById('uploader').style.display = 'flex';
    document.getElementById('uploader').style.width = 'calc(100% - 20vw)';
});
