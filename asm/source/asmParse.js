class AsmContext {
    constructor() {

    }
}

class AsmLine {
    constructor(str) {
        this.instr         = null;
        this.cond          = null;
        this.handle        = null;
        this.args          = [];
        this.error         = null;
        this.asmStr        = '';
        this.newAsmContext = null;
        this.parseLine(str);
    }

    parseLine(str) {
        let words  = str.split(' ');
        let opcode = words[0].toUpperCase().split('.');
        let instr  = opcode[0];
        let suffix = opcode[1];
        let args   = words.slice(1);
        let error  = null;

        let instrStr = '';
        switch (instr) {

            /// Arithmetic
            case 'ADD':
                break;
            case 'SUB':
                break;
            case 'MUL':
                break;
            case 'DIV':
                break;

            /// Binary
            case 'AND':
                break;
            case 'ORR':
                break;
            case 'NOT':
                break;
            case 'XOR':
                break;
            case 'LSL':
                break;
            case 'LSR':
                break;
            case 'ASL':
                break;
            case 'ASR':
                break;

            /// Memory
            case 'RD':
                break;
            case 'WR':
                break;

            /// Flow
            case 'CMP':
                break;
            case 'GTO':
                break;

            /// Type
            case 'I32':
                break;
            case 'I64':
                break;
            case 'F32':
                break;
            case 'F64':
                break;

            default:
                this.error = 'instr';
                break;
        }

        let suffixStr = '';
        switch (suffix) {
            default:
                this.error = 'suffix';
                break;
        }

        let argsStr = '';
        for (let i = 0; i < args.length; i++) {
            arg = args[i];

            /// Register arguments
            if (arg[0] === 'r') {
                let value = arg.split(1);

                /// Destination
                if (i === 0) {
                    argsStr += 'local.get $var' + value + '\n';
                }

                /// Sources
                else {
                    argsStr += 'local.get $var' + value + '\n';
                }
            }

            /// Immediate values
            else if (arg[0] === '#') {
                if (i === 0) {
                    this.error = 'arg';
                }
                else {
                    let value = arg.split(1);
                    argsStr += 'i32.const ' + value;
                }
            }
            switch (arg) {
                default:
                    this.error = 'arg';
                    break;
            }
        }

        /// 1. Construct conditional gate from suffix
        /// 2. Retrieve arguments
        /// 3. Execute instruction
        this.asmStr += suffixStr;
        this.asmStr += argsStr;
        this.asmStrv+= instrStr;
    }
}

class AsmDocument {
    constructor(signature, str) {
        this.signature = signature;
        this.asmLines = [];
        this.asmStr = '';
        this.asmContext = null;
        this.writeDoc(str);
    }

    parse(str) {
        let lines = str.split('\n');
        for (let line of lines) {
            let asmLine = new AsmLine(line);
            this.asmLines.push(asmLine);
            this.asmStr += asmLine.asmStr;
            this.asmContext = asmLine.newAsmContext;
        }
    }

    writeDoc(str, n_i = 32, n_f = 32, n_I = 16, n_F = 16) {
        this.asmStr = '(func (export "' + this.signature + '")\n';
        let k = 0;
        for (k = 0; k < n_i; k++) {
            this.asmStr += '(local $i'+ k + 'i32)\n';
        }
        for (k = 0; k < n_f; k++) {
            this.asmStr += '(local $f'+ k + 'f32)\n';
        }
        for (k = 0; k < n_I; k++) {
            this.asmStr += '(local $I'+ k + 'i64)\n';
        }
        for (k = 0; k < n_F; k++) {
            this.asmStr += '(local $F'+ k + 'f64)\n';
        }
        this.asmStr += ')';
        this.parse(str);
    }
}