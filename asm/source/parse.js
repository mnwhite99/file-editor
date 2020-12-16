let textEntry = document.getElementById('textEntry');
let text = textEntry.value;
textEntry.addEventListener('input', function() {
    text = textEntry.value;
});

class ASMLine {
    constructor(str) {
        this.instr = '';
        this.cond = '';
        this.args = [];
        this.error = null;
        this.parseLine(str);
    }

    parseLine(str) {
        let words  = str.split(' ');
        let opcode = words[0].toUpperCase().split('.');
        let instr  = opcode[0];
        let cond   = opcode[1];
        let args   = words.slice(1);
        let error  = null;

        switch (instr) {

            /// Arithmetic
            case 'ADD': /// destination a b
                break;
            case 'SUB':
                break;
            case 'MUL':
                break;
            case 'DIV':
                break;
            
            /// Bit
            case 'AND':
                break;
            case 'ORR':
                break;
            case 'XOR':
                break;
            case 'NOT':
                break;
            case 'LSL':
                break;
            case 'LSR':
                break;
            case 'ASL':
                break;
            case 'ASR':
                break;

            /// Type
            case 'INT':
                break;
            case 'UNT':
                break;
            case 'FLT':
                break;

            /// Flow
            case 'CMP': /// a b
                break;
            case 'B':   /// destination
                break;  /// split off suffixes
            
            /// Memory
            case 'RD':  /// destination ptr offset
                break;
            case 'WR':  /// value ptr offset
                break;

            /// Error
            default:
                this.error = 1;
                break;
        }

        switch (cond) {
            case undefined:
                break;
            case 'LT':
                break;
            case 'LE':
                break;
            case 'EQ':
                break;
            case 'NE':
                break;
            case 'GE':
                break;
            case 'GT':
                break;

            /// Error
            default:
                this.error = 1;
                break;
        }

        for (let arg of args) {
            
        }

        this.instr = instr;
        this.cond  = cond;
        this.args  = args;
        this.error = error;
    }
}

class ASMDoc {
    constructor(str, name) {
        this.ASMLines = [];
        this.binaryString = '';
        this.encode(str);
    }

    encode(str,name) {
        let lines = str.split('\n');
        for (let line of lines) {
            
        }
    }
}