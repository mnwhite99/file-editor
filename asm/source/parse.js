const instrList = {
    ///  Group        Opcodes           DestTypes
    ADD: [2, ['6A', '7C', '92', 'A0'], [1, 1, 1, 1]],
    SUB: [2, ['6B', '7D', '93', 'A1'], [1, 1, 1, 1]],
    MUL: [2, ['6C', '7E', '94', 'A2'], [1, 1, 1, 1]],
    DIV: [2, ['6D', '7F', '95', 'A3'], [1, 1, 1, 1]],
    EQ:  [2, ['46', '51', '5B', '61'], [1, 1, 0, 0]],
    NE:  [2, ['47', '52', '5C', '62'], [1, 1, 0, 0]],
    LT:  [2, ['48', '53', '5D', '63'], [1, 1, 0, 0]],
    GT:  [2, ['4A', '55', '5E', '64'], [1, 1, 0, 0]],
    LE:  [2, ['5C', '57', '5F', '65'], [1, 1, 0, 0]],
    GE:  [2, ['5E', '59', '60', '66'], [1, 1, 0, 0]],
    AND: [2, ['71', '83', null, null], [1, 1, 0, 0]],
    ORR: [2, ['72', '84', null, null], [1, 1, 0, 0]],
    XOR: [2, ['73', '85', null, null], [1, 1, 0, 0]],
    SHL: [2, ['74', '86', null, null], [1, 1, 0, 0]],
    SHR: [2, ['75', '87', null, null], [1, 1, 0, 0]],
    RTL: [2, ['77', '89', null, null], [1, 1, 0, 0]],
    RTR: [2, ['78', '8A', null, null], [1, 1, 0, 0]],
    MIN: [2, [null, null, '96', 'A4'], [0, 0, 1, 1]],
    MAX: [2, [null, null, '97', 'A5'], [0, 0, 1, 1]],
    CBR: [1, ['0D', null, null, null], [1, 0, 0, 0]],
    i2I: [1, [null, 'AC', null, null], [0, 1, 0, 0]],
    i2f: [1, [null, null, 'B2', null], [0, 0, 1, 0]],
    i2F: [1, [null, null, null, 'B7'], [0, 0, 0, 1]],
    I2i: [1, ['A7', null, null, null], [1, 0, 0, 0]],
    I2f: [1, [null, null, 'B4', null], [0, 0, 1, 0]],
    I2F: [1, [null, null, null, 'B9'], [0, 0, 0, 1]],
    f2i: [1, ['B6', null, null, null], [1, 0, 0, 0]],
    f2I: [1, [null, 'AE', null, null], [0, 1, 0, 0]],
    f2F: [1, [null, null, null, 'BB'], [0, 0, 0, 1]],
    F2i: [1, ['AA', null, null, null], [1, 0, 0, 0]],
    F2I: [1, [null, 'B0', null, null], [0, 1, 0, 0]],
    F2f: [1, [null, null, 'B6', null], [0, 0, 1, 0]],
}
const IOCodes = [];
const systemList = {
    W:   [0, [null, null, null, null], [1, 0, 0, 0]],
    H:   [0, [null, null, null, null], [1, 0, 0, 0]],
    PX:  [0, [null, null, null, null], [0, 0, 0, 0]],
    PY:  [0, [null, null, null, null], [0, 0, 0, 0]],
    LIN: [0, [null, null, null, null], [0, 0, 0, 0]],
    LW:  [0, [null, null, null, null], [0, 0, 0, 0]],
    FIL: [0, [null, null, null, null], [0, 0, 0, 0]],
    SY:  [0, [null, null, null, null], [0, 0, 0, 0]],
    SW:  [0, [null, null, null, null], [0, 0, 0, 0]],
    SC:  [0, [null, null, null, null], [0, 0, 0, 0]],
    SA:  [0, [null, null, null, null], [0, 0, 0, 0]],
    SF:  [0, [null, null, null, null], [0, 0, 0, 0]],
    MX:  [0, [null, null, null, null], [0, 0, 1, 0]],
    MY:  [0, [null, null, null, null], [0, 0, 1, 0]],
    ML:  [0, [null, null, null, null], [1, 0, 0, 0]],
    MR:  [0, [null, null, null, null], [1, 0, 0, 0]],
    SCX: [0, [null, null, null, null], [0, 0, 1, 0]],
    SCY: [0, [null, null, null, null], [0, 0, 1, 0]],
    ALO: [1, [null, null, null, null], [1, 0, 0, 0]],
    CLR: [1, [null, null, null, null], [1, 0, 0, 0]],
    SET: [1, [null, null, null, null], [0, 0, 0, 0]],
    GET: [1, [null, null, null, null], [1, 0, 0, 0]],
    IO:  [2,         IOCodes,          [1, 1, 1, 1]]
};
const sysDests = {
    imgbuf,
    imgw,
    imgh,
    iobuf,
    iosr,
    iolen
};
const sysArgs = {
    IMGW,
    IMGH,
    INUM,
    ILEN,
    ISRT,
    ONUM,
    OLEN,
    OSRT
};
const inputList = {};
const outputList = {};
const typeIdxs = { i: 0, I: 1, f: 2, F: 3 };

class AsmDocument {
    constructor(str) {
        this.asmStr = '';
        this.rMax = 12;
        this.parseDocument(str);
    }

    iToHex(str) {
        let int = parseInt(str);
        if (isNaN(int)) {
            return undefined;
        }
        else {
            return int.toString(16);
        }
    }

    err(num) {
        stop();
    }

    parseDocument(str) {
        this.asmStr += '0061736D01000000';
        this.asmStr += '0100'; // Type
        this.asmStr += '0200'; // Imports
        this.asmStr += '03200000'; // Function type
        this.asmStr += '0400' // Tables
        this.asmStr += '054000000000'; // Memory????
        this.asmStr += '0600'; // Globals
        this.asmStr += '0700'; // Exports
        this.asmStr += '0800'; //Start
        this.asmStr += '0900'; // Table elements
        this.asmStr += '0A'
        this.parseLines(str); // Code segment
        this.asmStr += '0B00'; // Data

    }

    parseLines(str) {
        let lines = str.split('\n');
        let asmCode = '';
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            asmCode += this.parseLine(line);
        }
        let bytes = asmCode.length / 2;
        this.asmStr += this.iToHex(bytes);
        this.asmStr += asmCode;

    }

    parseLine(str) {
        let argsStr = '';
        let instrStr = '';
        let destStr = '';
        let isSystem = 0;

        let words = str.split(' ');
        let instr = words[0];
        let instrInfo = instrList[instr];
        if (instrInfo === undefined) {
            if (instr[0] === '.') {

            }
            else {
                instrInfo = systemList[instr];
                if (instrInfo === undefined) {
                    this.err(0);
                }
                else {
                    isSystem = 1;
                }
            }
        }
        else {
            let args = words.slice(1);
            if (args.length > 0) {

                /// Destination for returning instructions
                if (isSystem === 0 || 
                    (isSystem === 1 && (instrInfo[2][0] === 1) || instrInfo[2][2] === 1)) {
                    let dest = args[0];
                    let destType = dest[0];
                    let destTypeIdx = typeIdxs[destType];
                    if (destTypeIdx === undefined) {
                        this.err(1);
                    }
                    else if (dest.length > 1) {
                        let destContent = dest.slice(1);
                        let destContentStr = this.iToHex(destContent);
                        if (destContentStr === undefined) {
                            this.err(2);
                        }
                        else {
                            destStr = '21' + destContentStr + '\n';
                        }
                    }
                }

                /// Instruction
                if (instrInfo[2][destTypeIdx] === 0) {
                    this.err(3);
                }
                else {
                    instrStr = instrInfo[1][destTypeIdx];
                }

                /// Arguments
                for (let i = 1; i < args.length; i++) {
                    let arg = args[i];
                    let argType = arg[0];
                    let argTypeIdx = typeIdxs[argType];

                    /// Immediates
                    if (argTypeIdx === undefined) {
                        if (argType === '#') {
                            let immType = arg[2];
                            let immTypeIdx = typeIdxs[immType];
                            if (immTypeIdx === undefined) {
                                this.err(4);
                            }
                            else if (arg.length > 2) {
                                let immContent = arg.slice(2);
                                let immContentStr = '';
                                if (immTypeIdx < 2) {
                                    immContentStr = this.iToHex(immContent);
                                }
                                else {
                                    immContentStr = 'flooat';
                                }
                                if (immContentStr === undefined) {
                                    this.err(5);
                                }
                                else {
                                    argsStr += ['41', '42', '43', '44'][immTypeIdx];
                                    argsStr += immContentStr + '\n';
                                }
                            }
                        }
                        else {
                            this.err(6);
                            argTypeIdx = -1;
                        }
                    }

                    /// Registers
                    else {
                        if (arg.length > 1) {
                            let argContent = arg.slice(1);
                            let argContentStr = this.iToHex(argContent);
                            if (argContentStr === undefined) {
                                this.err(7);
                            }
                            else {
                                let r = parseInt(argContent);
                                if (r > this.rMax) {
                                    this.rMax = r;
                                }
                                argsStr += '20' + argContentStr + '\n';
                            }
                        }
                    }
                }
            }
        }
    }
}

let textEntry = document.getElementById('textEntry');
textEntry.addEventListener('input', function() {
    let doc = new AsmDocument(textEntry.innerHTML);
    console.log(doc.asmStr);
})