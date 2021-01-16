class WasmDocument {
    constructor(str) {
        this.instrList = {
            add: [3, ['\x7c', '\xa0'], [1, 1], 0],
            sub: [3, ['\x7d', '\xa1'], [1, 1], 0],
            mul: [3, ['\x7e', '\xa2'], [1, 1], 0],
            div: [3, ['\x7f', '\xa3'], [1, 1], 0],
            eq:  [3, ['\x51', '\x61'], [1, 0], 1],
            ne:  [3, ['\x52', '\x62'], [1, 0], 1],
            lt:  [3, ['\x53', '\x63'], [1, 0], 1],
            gt:  [3, ['\x55', '\x64'], [1, 0], 1],
            le:  [3, ['\x57', '\x65'], [1, 0], 1],
            ge:  [3, ['\x59', '\x66'], [1, 0], 1],
            rem: [3, ['\x81',  null ], [1, 0], 0],
            and: [3, ['\x83',  null ], [1, 0], 0],
            orr: [3, ['\x84',  null ], [1, 0], 0],
            xor: [3, ['\x85',  null ], [1, 0], 0],
            asl: [3, ['\x86',  null ], [1, 0], 0],
            asr: [3, ['\x87',  null ], [1, 0], 0],
            rol: [3, ['\x89',  null ], [1, 0], 0],
            ror: [3, ['\x8a',  null ], [1, 0], 0],
            bif: [2, ['\x0d',  null ], [1, 0], 2],
            set: [2, [  '',     ''  ], [1, 1], 0],
            cnv: [2, [  '',     ''  ], [1, 1], 0],
            rd:  [2, ['\x29', '\x2b'], [1, 1], 0],
            wr:  [2, ['\x37', '\x39'], [0, 0], 0],
            sz:  [1, ['\x3f\x00', ''], [0, 0], 0]
        };
        this.numInts = 0;
        this.numFloats = 0;
        this.numPoints = 0;
        this.wasmStr = '\x00\x61\x73\x6d\x01\x00\x00\x00';
        this.addSection(1, '\x01\x60\x00\x00');
        this.addSection(3, '\x01\x60\x00\x00');
        this.addSection(5, '\x01\x00\x00\x00');
        let codeWasmStr = '';
        let lines = str.split('\n');
        for (let i = 0; i < lines.length; i++) {
            codeWasmStr += this.parseLine(lines[i], i);
        }
        this.addSection(6, '');
        this.addSection(10, codeWasmStr);
    }

    err(str, lineNum) {
        
    }

    addSection(id, content) {
        this.wasmStr += [
            '\x00', '\x01', '\x02', '\x03', '\x04', '\x05',
            '\x06', '\x07', '\x08', '\x09', '\x0a', '\x0b'
        ][id];
        this.wasmStr += this.bitsOf(content.length, 0);
        this.wasmStr += content;
    }
  
    extendRegisters(arg, type) {
        let argNum = parseInt(arg.substring(1));
        if (type === 0 && argNum > this.numInts) {
            this.numInts = argNum;
        }
        if (type === 1 && argNum > this.numFloats) {
            this.numFloats = argNum;
        }
    }

    bitsOf(x, isFloat, bits) {
        let value = null;
        let y = '';
        if (isFloat) {
            value = parseFloat(x);
            if (isNaN(value)) {
                return null;
            }
            let w_exp = [5, 8, 11, 15][Math.log2(bits) - 4];
            let w_scd = bits - w_exp;
        }
        else {
            value = parseInt(x);
            if (isNaN(value)) {
                return null;
            }
            let m = 1 << bits - 1;
            for (let i = 0; i < bits; i++) {
                if (value & m) {
                    y += '\b1';
                }
                else {
                    y += '\b0';
                }
                m = m >> 1;
            }
            return y;
        }
    }

    argType(arg) {
        if (arg[0] === 'i') {
            return 0;
        }
        else if (arg[0] === 'f') {
            return 1;
        }
        else if (arg[arg.length - 1] === 'i') {
            return 2;
        }
        else if (arg[arg.length - 1] === 'f') {
            return 3;
        }
        else {
            return null;
        }
    }

    argBits(arg, type, bits) {
        if (arg === undefined || arg.length < 2 || type === null) {
            return null;
        }
        else if (type < 2) {
            let valueStr = arg.substring(1);
            return this.bitsOf(valueStr, type, bits);
        }
        else {
            let valueStr = arg.substring(0, arg.length - 1);
            return this.bitsOf(valueStr, type - 2, bits);
        }
    }

    parseLine(line, lineNum) {
        let argsWasmStr = '';
        let instrWasmStr = '';
        let destWasmStr = '';
        let args = line.split(' ');
        if (args.length === 0) {
            return '';
        }
        if (args.length === 1) {
            let pointId = parseInt(line);
            if (isNaN(pointId)) {
                this.err('instruction not recognized', lineNum);
                return '';
            }
            if (pointId > this.numPoints){
                this.numPoints = pointId;
            }
        }
        let instr = args[0];
        let instrInfo = this.instrList[instr];
        if (instrInfo === undefined) {
            this.err('instruction not recognized', lineNum);
            return '';
        }
        let dest = args[1];
        let destType = this.argType(dest);
        if (destType === null) {
            this.err('destination type not recognized', lineNum);
            return '';
        }
        if (destType > 1) {
            this.err('immediate destinations not supported', lineNum);
            return '';
        }
        if (instrInfo[2][destType] === 0) {
            this.err('destination type not supported', lineNum);
            return '';
        }
        instrWasmStr += instrInfo[1][destType];
        let destIndex = this.argBits(dest, destType, 32);
        if (destIndex === null) {
            this.err('destination index not recognized', lineNum);
            return '';
        }
        this.extendRegisters(dest, destType);
        if (instr) {
            destWasmStr += '\x24' + destIndex;
        }
        for (let i = 2; i < args.length; i++) {
            let arg = args[i];
            let argType = this.argType(arg);
            if (argType === null) {
                this.err('argument type not recognized', lineNum);
                return '';
            }
            if (argType < 2) {
                let argIndex = this.argBits(arg, argType, 32);
                if (argIndex === null) {
                    this.err('argument index not recognized', lineNum);
                    return '';
                }
                this.extendRegisters(arg, argType);
                argsWasmStr += '\x23' + argIndex;
            }
            else {
                let argValue = this.argBits(arg, argType, 64);
                if (argValue === null) {
                    this.err('argument value not recognized', lineNum);
                    return '';
                }
                argsWasmStr += ['\x42', '\x44'][argType - 2] + argValue;
            }
        }
        return argsWasmStr + instrWasmStr + destWasmStr;
    }
}