/// Direct memory language specification


class MemDocument {
    constructor(str) {
        this.lines = [];
        this.asmStr = '';
        this.parse(str);
    }

    parse(str) {
        let lines = str.split('\n');
        for (let line of lines) {
            let tokens = line.split(' ');
            let instr = tokens[0];
            let format = null;
            switch (instr) {

                /// instr a b c

                /// ADD i4 <- i8 i9
                /// Add the i32 at 8 and the i32 at 9 and store the result as an i32 at 4

                /// SUB I4 <- I8 i9
                /// Subtract the i32 at 9 and the I64 at 8 and store the result as an I64 at 4
                /// This zeros the last 32 bits of I8
                case 'ADD': /// a <- b + c
                    format = 0;
                    break;
                case 'SUB': /// a <- b - c
                    format = 0;
                    break;
                case 'MUL': /// a <- b * c
                    format = 0;
                    break;
                case 'DIV': /// a <- b / c
                    format = 0;
                    break;
                case 'PWR': /// a <- b **c
                    format = 0;
                    break;
                case 'AND': /// a <- b & c
                    format = 0;
                    break;
                case 'ORR': /// a <- b | c
                    format = 0;
                    break;
                case 'XOR': /// a <- b ^ c
                    format = 0;
                    break;
                case 'NOT': /// a <- -b 
                    format = 1;
                    break;
                

                case 'LT':
                    format = 0;
                    break;
                case 'LE':
                    format = 0;
                    break;
                case 'EQ':
                    format = 0;
                    break;
                case 'GE':
                    format = 0;
                    break;
                case 'GT':
                    format = 0;
                    break;
                case 'NE':
                    format = 0;
                    break;

                case 'MOV': /// a <- b[c]
                    format = 1;
                    break;
                case 'BR':  /// goto a if b
                    format = 1;
                    break;
                case 'ADV': /// goto pc + a if b
                    format = 1;
                    break;                

                case 'RO':
                    format = 2;
                    break;
                case 'RW':
                    format = 2;
                    break;
                case 'RH':
                    format = 2;
                    break;

                default:
                    break;
                
            }
            let args = tokens.split(1);
            let argsStr = '';
            for (let i = 0; i < args.length; i++) {
                let arg = args[i];
                let prefix = arg[0];
                switch (format) {
                    case 0:
                        switch (prefix) {
                            case 'i':
                                argsStr += '0x7F';
                                break;
                            case 'I':
                                argsStr += '0x7E';
                                break;
                            case 'f':
                                argsStr += '0x7D';
                                break;
                            case 'F':
                                argsStr += '0x7C';
                                break;
                            case '#':
                                let prefix2 = arg[1];
                                switch (prefix2) {
                                    case 'i':
                                        argsStr += '0x7F';
                                        break;
                                    case 'I':
                                        argsStr += '0x7E';
                                        break;
                                    case 'f':
                                        argsStr += '0x7D';
                                        break;
                                    case 'F':
                                        argsStr += '0x7C';
                                        break;
                                    default:
                                        break;
                                }
                                break;
                        }
                        break;
                }

            }
        }
    }
}