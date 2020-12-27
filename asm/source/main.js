/*

process instrs
drawing instrs
    1. set box corners
    2. fill / draw with pen
    3. allow interactions

*/

/// Set colors
setColor(0);
document.getElementById('invert').onclick = function() {
    setColor(1);
}

function setColor(invert) {
    let style = document.documentElement.style;
    let color = parseInt(localStorage.getItem('color'));
    if (invert) {
        color = !color;
    }
    if (color) {
        color = 1;
        style.setProperty('--bg', '#000000');
        style.setProperty('--fg', '#ffffff');
        style.setProperty('--hl', '#fffffffe');
    }
    else {
        color = 0;
        style.setProperty('--bg', '#ffffff');
        style.setProperty('--fg', '#000000');
        style.setProperty('--hl', '#000000fe');
    }
    localStorage.setItem('color', color.toString());
}

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
    '<script id = "parse" type = "text/javascript" src = "source/parse.js"></script>'
);

