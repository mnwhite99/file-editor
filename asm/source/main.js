/*

process instrs
drawing instrs
    1. set box corners
    2. fill / draw with pen
    3. allow interactions

*/

/// Reload and store text
let textEntry = document.getElementById('textEntry');
window.addEventListener('load', function() {
    let storedText = localStorage.getItem('text');
    if (storedText == undefined) {
        storedText = '';
    }
    textEntry.innerHTML = storedText;
});

textEntry.addEventListener('input', function() {
    localStorage.setItem('text', textEntry.value);
});

/// Append
document.write(
    '<script id = "asmParse" type = "text/javascript" src = "source/asmParse.js"></script>'
);

