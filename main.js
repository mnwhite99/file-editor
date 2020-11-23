let color = parseInt(localStorage.getItem('color'));
let color_bg = '#ffffff';
let color_fg = '#000000';
if (isNaN(color)) color = 0;
setColors();
let reader = new FileReader();
let libReaderWait = 0;

/// Database //////////////////////////////////////////////////////////////////////////////////////
let db = null;
let openDb = window.indexedDB.open('db', 4);
openDb.onerror = function(event) {
    console.log('Database error. Please load from local filesystem.');
}
openDb.onupgradeneeded = function(event) {
    db = event.target.result;
    db.onerror = function(event) {
        console.log('Database error. Please load from local filesystem.');
        let dbStore = db.createObjectStore('files');
        files.createIndex('new', '', {unique: true});
    }
}
openDb.onsuccess = function(event) {
    db = openDb.result;
}


let dbVis = 'hidden';
document.getElementById('openFromDB').onclick = function() {
    let dbBrowser = document.getElementById('dbBrowser');
    if (dbVis === 'hidden') dbVis = 'visible';
    else dbVis = 'hidden';
    dbBrowser.style.setProperty('visibility', dbVis);
}

/// Toolbar ///////////////////////////////////////////////////////////////////////////////////////

/*
let libDirList = [];
let addLibFile = document.getElementById('addLibFile');
addLibFile.addEventListener('input', function() {
    let files = addLibFile.files;
    console.log(files);
    for (let file of files) {
        console.log(file);
        let libReader = new FileReader();
        libReader.readAsText(file);
        library.innerHTML += file.webkitRelativePath + '/' + file.name;
        localStorage.setItem('libText', library.innerHTML);
        libReader.addEventListener('load', function() {
            console.log(file.webkitRelativePath)
            
        });
    }
});
*/
document.getElementById('fileSave').onclick = function() {
    document.createElement('a', 'href = #textareaEntry download');
}

document.getElementById('darker').onclick = function() {
    color++;
    setColors();
}

document.getElementById('lighter').onclick = function() {
    color--;
    setColors();
}

function setColors() {
    let docStyle = document.documentElement.style;
    if (color <= 0) {
        color = 0;
        color_bg = '#ffffff';
        color_fg = '#000000';
    }
    else if (color === 1) {
        color_bg = '#dddddd';
        color_fg = '#444444';
    }
    else if (color === 2) {
        color_bg = '#444444';
        color_fg = '#dddddd';
    }
    else {
        color = 3;
        color_bg = '#000000';
        color_fg = '#ffffff';
    }

    docStyle.setProperty('--color-bg', color_bg);
    docStyle.setProperty('--color-fg', color_fg);
    docStyle.setProperty('--color-hl', docStyle.getPropertyValue('--color-fg') + 'fe');
    localStorage.setItem('color', color.toString());
}

/// Project area //////////////////////////////////////////////////////////////////////////////////

let textareaEntry = document.getElementById('textareaEntry');
window.addEventListener('load', function() {

    /// Project
    let text = localStorage.getItem('text');
    if (text === undefined) text = '';
    textareaEntry.innerHTML = text;

    /// Library
    /*
    text = localStorage.getItem('libText');
    if (text === undefined) text = '';
    library.innerHTML = text;
    */
});

textareaEntry.addEventListener('input', function() {
    let text = textareaEntry.value;
    localStorage.setItem('text', text);
});

/// Library ///////////////////////////////////////////////////////////////////////////////////////

/// File selectors
let openFromFile = document.getElementById('openFromFile');
openFromFile.addEventListener('input', function() {
    let file = openFromFile.files[0];
    console.log(file);
    reader.readAsText(file);
});

reader.addEventListener('load', function() {
    let text = reader.result;
    textareaEntry.innerHTML = text;
    localStorage.setItem('text', text);
});

/// Maintenance ///////////////////////////////////////////////////////////////////////////////////