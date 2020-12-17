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
    BR:  [0, ['0C', null, null, null], [1, 0, 0, 0]],
    BC:  [1, ['0D', null, null, null], [1, 0, 0, 0]],
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
    F2f: [1, [null, null, 'B6', null], [0, 0, 1, 0]]
};

class AsmDocument {
    constructor(str) {
        this.asmStr = '';
        this.rMax = 12;
        this.parseLines(str);
    }

    parseLines(str) {
        let lines = str.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            this.asmStr += this.parseLine(line);
        }
    }

    parseLine(str) {
        let destStr = '';

        let words = str.split(' ');
        let instr = words[0];
        let instrInfo = instrList[instr];
        if (instrInfo === undefined) {
            if (instr[0] === '.') {

            }
            else {

            }
        }
        else {
            let args = words.slice(1);
            if (args.length > 0) {
                let dest = args[0];
                let destType = dest[0];
                let destTypeIdx = { i: 0, I: 1, f: 2, F: 3 }[destType];
                if (destTypeIdx === undefined) {
                    destTypeIdx = -1;
                }
                else {
                    let destContent = dest.slice(1);
                    let destContentStr = parseInt(destContent).toString(16);
                    destStr = '21' + destContentStr + '\n';
                }

            }


        }
    }


}

class WeeWaa {
    constructor(str) {
        this.asmStr = '';
        this.rMax = 12;
        this.parseLines(str);
    }

    parseValue(valueStr) {

    }

    parseLines(str) {
        let lines = str.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            this.parseLine(line);
        }
    }

    parseLine(line) {
        let tokens = line.split(' ');
        let instr = tokens[0];
        let instrGroup = 0;
        let args = tokens.slice(1);
        let iHexes = null;
        let destHexStr = '';
        let argsHexStr = '';
        let instrHexStr = '';
        let labelStr = '';

        let dest = args[0];
        let destType = -1
        let destID = -1;
        if (iHexes !== null) {
            instrHexStr = '0x' + iHexes[Math.min(destType, iHexes.length)];
        }


        
        for (let i = 0; i < args.length; i++) {
            let arg = args[i];
            let argTag = arg[0];
            let argContent = arg.slice(1);
            let rIdx = parseInt(toString(argContent), 16);
            if (i === 0) {
                destHexStr = '0x21' + rIdx;
                if (rIdx > this.rMax) {
                    this.rMax = rIdx;
                }
                destHexStr += '\n';
            }
            else {
                if (argTag === 'i' || argTag === 'I' || argTag === 'f' || argTag === 'F') {
                    argsHexStr += '0x20' + rIdx;
                    if (rIdx > this.rMax) {
                        this.rMax = rIdx;
                    }
                }
                else if (argTag === '#') {
                    let immediateSubtype = arg[1];
                    let immediateValue = arg.split(2);
                    switch (immediateSubtype) {
                        case 'i':
                            argsHexStr += '0x41' + immediateValue;
                            break;
                        case 'I' :
                            argsHexStr += '0x42' + immediateValue;
                            break;
                        case 'f':
                            argsHexStr += '0x43' + immediateValue;
                            break;
                        case 'F':
                            argsHexStr += '0x44' + immediateValue;
                            break;
                        default:
                            break; 
                    }
                }
                argsHexStr += '\n';
            }
            switch (instrGroup) {

                /// Binary operations
                case 2:
                    

            }
        }
    }
}

/// Distractors