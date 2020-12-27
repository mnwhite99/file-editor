/// Conversion of inline WASM to standard
/// Includes IO handles

const typeEnums = {i: 0, f: 1};
const instrList = {
    add: [3, ['i64.add', 'f64.add'],   [1, 1], 0],
    sub: [3, ['i64.sub', 'f64.sub'],   [1, 1], 0],
    mul: [3, ['i64.mul', 'f64.mul'],   [1, 1], 0],
    div: [3, ['i64.div_s', 'f64.div'], [1, 1], 0],
    eq:  [3, ['i64.eq', 'f64.eq'],     [1, 0], 1],
    ne:  [3, ['i64.ne', 'f64.ne'],     [1, 0], 1],
    lt:  [3, ['i64.lt_s', 'f64.lt'],   [1, 0], 1],
    gt:  [3, ['i64.gt_s', 'f64.gt'],   [1, 0], 1],
    le:  [3, ['i64.le_s', 'f64.le'],   [1, 0], 1],
    ge:  [3, ['i64.ge_s', 'f64.ge'],   [1, 0], 1],
    and: [3, ['i64.and', null],        [1, 0], 1],
    orr: [3, ['i64.or', null],         [1, 0], 1],
    xor: [3, ['i64.xor', null],        [1, 0], 1],
    sfl: [3, ['i64.shl', null],        [1, 0], 0],
    sfr: [3, ['i64.shr_s', null],      [1, 0], 0],
    rol: [3. ['i64.rotl', null],       [1, 0], 0],
    ror: [3, ['i64.rotr', null],       [1, 0], 0],
    min: [3, [null, 'f64.min'],        [0, 1], 0],
    max: [3, [null, 'f64.max'],        [0, 1], 0],
    mov: [2, ['', ''],                 [1, 1], 0],
    bif: [2, ['br_if', null],          [1, 0], 0]
}

class inlineDocument {
    constructor(str) {
        this.asmStr = '';
        this.errors = [];
        this.parseLines(str);
    }

    err(str, lineNum) {
        this.errors.push([str, lineNum]);
    }

    parseLines(str) {
        this.asmStr += '(module';
        let lines = str.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            this.parseLines(line, i);
        }
        this.asmStr += ')';
    }

    parseLine(str, lineNum) {
        let args = str.split(' ');
        let argsStr = '';
        let instr = args[0];
        let instrStr = '';
        let instrInfo = instrList[instr];
        if (instrInfo === undefined) {
            this.err('instruction not recognized', lineNum);
            return;
        }
        if (args.length > instrInfo[0] + 1) {
            this.err('too many arguments', lineNum);
            return;
        }
        let dest = args[1];
        let destTypeEnum = typeEnums[dest[0]];
        let destStr = '';
        if (destTypeEnum === undefined) {
            this.err('destination type not recognized');
            return;
        }
        else {
            let destValue = parseInt(dest.substring(1));
            if (isNaN(destValue)) {
                this.err('destination index not recognized', lineNum);
                return;
            }
            destStr += 'global.set $' + dest + '\n';
        }

        let asmInstr = instrInfo[1][destTypeEnum];
        if (asmInstr === null) {
            this.err('destination type not supported', lineNum);
            return;
        }
        else {
            instrStr += asmInstr + destStr;
            let requiresExtension = instrInfo[3];
            if (requiresExtension) {
                instrStr += 'global.get $' + dest + '\n';
                instrStr += 'i64.promote_f32\n';
                instrStr += destStr; 
            }
        }
        for (let i = 2; i < args.length; i++) {
            let arg = args[i];
            let argTypeEnum = typeEnums[arg[0]];
            if (argTypeEnum === undefined) {
                this.err('argument type not recognized', lineNum);
                return;
            }
            else if (arg.length < 2) {
                this.err('argument value not specified', lineNum);
                return;
            }
            else {
                let argValue = arg.substring(1);
                argsStr += 'global.get $' + arg + '\n';
            }
            if (instr === 'mov') {
                if (destTypeEnum === 0 && argTypeEnum === 1) {
                    argsStr += 'i64.trunc_sat_f64_s\n';
                }
                else if (destTypeEnum === 1 && argTypeEnum === 1) {
                    argsStr += 'f64.convert_i64_s\n';
                }
            }
        }
        this.asmStr += argsStr + instrStr + destStr;
    }
}