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
        switch (dest[0]) {
            case 'i':
                destType = 0;
                break;
            case 'I':
                destType = 1;
                break;
            case 'f':
                destType = 2;
                break;
            case 'F':
                destType = 3;
                break;
            default:
                break;
        }

        switch (instr) {

            /// Unary type-agnostic operators
            case 'ABS':
                instrGroup = 1;
                iHexes = [];
                break;
            case 'NEG':
                instrGroup = 1;
                iHexes = [];
                break;
            case 'SQRT':
                instrGroup = 1;
                iHexes = [];
                break;


            case 'RUP':
                instrGroup = 1;
                iHexes = [];
                break;
            case 'RDN':
                instrGroup = 1;
                iHexes = [];
                break;
            case 'TRN':
                instrGroup = 1;
                iHexes = [];
                break;
            case 'NST':
                instrGroup = 1;
                iHexes = [];
                break;

            /// Binary type-agnostic operators
            case 'ADD':
                instrGroup = 2;
                iHexes = ['6A', '7C', '92', 'A0'];
                break;
            case 'SUB':
                instrGroup = 2;
                iHexes = ['6B', '7D', '93', 'A1'];
                break;
            case 'MUL':
                instrGroup = 2;
                iHexes = ['6C', '7E', '94', 'A2'];
                break;
            case 'DIV':
                instrGroup = 2;
                iHexes = ['6D', '7F', '95', 'A3'];
                break;

            case 'EQ':
                instrGroup = 2;
                iHexes = ['46', '51', '5B', '61'];
                break;
            case 'NE':
                instrGroup = 2;
                iHexes = ['47', '52', '5C', '62'];
                break;
            case 'LT':
                instrGroup = 2;
                iHexes = ['48', '53', '5D', '63'];
                break;
            case 'GT':
                instrGroup = 2;
                iHexes = ['4A', '55', '5E', '64'];
                break;
            case 'LE':
                instrGroup = 2;
                iHexes = ['5C', '57', '5F', '65'];
                break;
            case 'GE':
                instrGroup = 2;
                iHexes = ['5E', '59', '60', '66'];
                break;

            case 'AND':
                if (destType < 2) {
                    instrGroup = 2;
                    iHexes = ['71', '83'];
                }
                else { instrGroup = -2; }
                break;
            case 'ORR':
                if (destType < 2) {
                    instrGroup = 2;
                    iHexes = ['72', '84'];
                }
                else { instrGroup = -2; }
                break;
            case 'XOR':
                if (destType < 2) {
                    instrGroup = 2;
                    iHexes = ['73', '85'];
                }
                else { instrGroup = -2; }
                break;
            case 'SHL':
                if (destType < 2) {
                    instrGroup = 2;
                    iHexes = ['74', '86'];
                }
                else { instrGroup = -2; }
                break;
            case 'SHR':
                if (destType < 2) {
                    instrGroup = 2;
                    iHexes = ['75', '87'];
                }
                else { instrGroup = -2; }
                break;
            case 'RTL':
                if (destType < 2) {
                    instrGroup = 2;
                    iHexes = ['77', '89'];
                }
                else { instrGroup = -2; }
                break;
            case 'RTR':
                if (destType < 2) {
                    instrGroup = 2;
                    iHexes = ['78', '8A'];
                }
                else { instrGroup = -2; }
                break;

            case 'MIN':
                if (destType > 1) {
                    instrGroup = 2;
                    iHexes = ['', '', '96', 'A4'];
                }
                else { instrGroup = -2; }
                break;
            case 'MAX':
                if (destType > 1) {
                    instrGroup = 2;
                    iHexes = ['', '', '97', 'A5'];
                }
                else { instrGroup = -2; }
                break;

            default:
                if (instr[0] = '.') {
                    let labelNum = instr.split(1);
                    labelStr = '0x'
                }
                break;
                
        }
        if (iHexes !== null) {
            instrHexStr = '0x' + iHexes[destType];
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