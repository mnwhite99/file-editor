console.log('what?');

/*/////////////////////////////////////////////////////////////////////////////////////////////////
Language specification:

Variables


Operators














*//////////////////////////////////////////////////////////////////////////////////////////////////

let opLeads = [
    '+', '-', '.', '*', '^', '#', '/', '%'
];

let brackets = [
    '[', ']', '(', ')'
];

function parse(str) {
    let strNew = str;
    let token = '';
    let tokens = [];
    let cursor = 0;
    let stop = 0;
    let leadingSpace = 1;
    let tokenType = 'id';
    let typeSet = 0;
    while (!stop) {
        let char = str[cursor];
        if (char !== ' ' || char !== '\n') {
            leadingSpace = 0;
        }
        if (!leadingSpace) {
            if (char === ' ' || char === '\n') {
                stop = 1;
                cursor++;
            }
            else {
                if (!typeSet) {
                    if (opLeads.includes(char)) {
                        tokenType = 'op';
                    }
                    if (brackets.includes(char)) {
                        tokenType = 'br';
                    }
                    if (char === '$') {
                        tokenType = 'count';
                    }
                    typeSet = 1;
                }
                token += char;
            }
        }
        cursor++;
    }
    tokens.append(token);
    strNew = str.slice(token);
    return tokens.append(parse(strNew));
}