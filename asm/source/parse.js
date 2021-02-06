class Parser {
    constructor(string) {
        this.wasm = [];
        this.codeWasm = [];
        this.currentexpression = 0;
        this.expressionWasm = [];
        this.usedExpressions = [];
        this.expressionTable = [];
        this.errors = [];
        this.lineCount = 0;
        this.integerCount = 0;
        this.floatCount = 0;
        let lines = string.split('\n');
        this.parseLines(lines);
    }

    parseLines(lines) {
        let instructionSet = {
            add: [4, [0x7c, 0xa0], [1, 1, 0, 0], 0, [[1, 1, 1, 1], [1, 1, 1, 1]]],
            sub: [4, [0x7d, 0xa1], [1, 1, 0, 0], 0, [[1, 1, 1, 1], [1, 1, 1, 1]]],
            mul: [4, [0x7e, 0xa2], [1, 1, 0, 0], 0, [[1, 1, 1, 1], [1, 1, 1, 1]]],
            div: [4, [0x7f, 0xa3], [1, 1, 0, 0], 0, [[1, 1, 1, 1], [1, 1, 1, 1]]],
            lt:  [4, [0x53, 0x63], [1, 0, 0, 0], 1, [[1, 1, 1, 1], [1, 1, 1, 1]]],
            gt:  [4, [0x55, 0x64], [1, 0, 0, 0], 1, [[1, 1, 1, 1], [1, 1, 1, 1]]],
            eq:  [4, [0x51, 0x61], [1, 0, 0, 0], 1, [[1, 1, 1, 1], [1, 1, 1, 1]]],
            leq: [4, [0x57, 0x65], [1, 0, 0, 0], 1, [[1, 1, 1, 1], [1, 1, 1, 1]]],
            geq: [4, [0x59, 0x66], [1, 0, 0, 0], 1, [[1, 1, 1, 1], [1, 1, 1, 1]]],
            neq: [4, [0x52, 0x62], [1, 0, 0, 0], 1, [[1, 1, 1, 1], [1, 1, 1, 1]]],
            and: [4, [0x83, null], [1, 0, 0, 0], 1, [[1, 0, 1, 0], [1, 0, 1, 0]]],
            ior: [4, [0x84, null], [1, 0, 0, 0], 1, [[1, 0, 1, 0], [1, 0, 1, 0]]],
            xor: [4, [0x85, null], [1, 0, 0, 0], 1, [[1, 0, 1, 0], [1, 0, 1, 0]]],
            sl:  [4, [0x86, null], [1, 0, 0, 0], 0, [[1, 0, 1, 0], [1, 0, 1, 0]]],
            sr:  [4, [0x87, null], [1, 0, 0, 0], 0, [[1, 0, 1, 0], [1, 0, 1, 0]]],
            set: [3, [0x01, 0x01], [1, 1, 0, 0], 2, [[1, 1, 1, 1], [1, 1, 1, 1]]],
            cbr: [3, [0x04, null], [1, 0, 1, 0], 0, [[1, 0, 1, 0], [0, 0, 0, 0]]],
            rd:  [2, [0x29, 0x2b], [1, 1, 0, 0], 2, [[1, 0, 1, 0], [0, 0, 0, 0]]],
            wr:  [2, [0x37, 0x39], [1, 1, 1, 1], 2, [[1, 0, 1, 0], [0, 0, 0, 0]]],
            msz: [2, [0x3f, null], [1, 0, 0, 0], 1, [[0, 0, 0, 0], [0, 0, 0, 0]]],
            mxt: [2, [0x40, null], [1, 0, 1, 0], 0, [[0, 0, 0, 0], [0, 0, 0, 0]]],
            lns: [1, [0x10, null], [1, 0, 1, 0], 0, [[0, 0, 0, 0], [0, 0, 0, 0]]],
            lnc: [1, [0x10, null], [1, 0, 1, 0], 0, [[0, 0, 0, 0], [0, 0, 0, 0]]],
            lnf: [1, [0x10, null], [1, 0, 1, 0], 0, [[0, 0, 0, 0], [0, 0, 0, 0]]],
            lnw: [1, [null, 0x10], [0, 1, 0, 1], 0, [[0, 0, 0, 0], [0, 0, 0, 0]]],
            lnx: [1, [null, 0x10], [0, 1, 0, 1], 0, [[0, 0, 0, 0], [0, 0, 0, 0]]],
            lny: [1, [null, 0x10], [0, 1, 0, 1], 0, [[0, 0, 0, 0], [0, 0, 0, 0]]],
            lna: [1, [null, 0x10], [0, 1, 0, 1], 0, [[0, 0, 0, 0], [0, 0, 0, 0]]],
            ctl: [2, [null, 0x10], [0, 1, 0, 1], 0, [[1, 0, 1, 0], [1, 0, 1, 0]]]
        };
        this.lineCount = lines.length;
        this.wasm.concat([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
        for (let i = 0; i < lines.length; i++) {
            this.parseLine(line, i, instructionSet);
        }
        this.appendSection(this.codeWasm, 10);
        let functionTypes = this.readBytes(this.usedExpressions.length, 32);
        for (let i = 0; i < this.usedExpressions.length; i++) {
            functionTypes.concat([0x60, 0x00]);
        }
        this.appendSection(functionTypes, 3);
        let byteArray = new Uint8Array(this.wasm.length);
        for (let i = 0; i < this.wasm.length; i++) {
            byteArray[i] = this.wasm[i];
        }
        this.wasm = byteArray;
    }

    parseLine(line, lineNumber, instructionSet) {
        let operands = line.trim().split(' ').map(operand => operand.trim());
        if (operands.length === 0) {
            return;
        }

        let operandsWasm = [];
        let instructionWasm = [];
        let destinationWasm = [];

        let instruction = operands[0];    
        let instructionInfo = instructionSet[instruction];
        if (instructionInfo === undefined) {
            if (operands.length === 1) {
                let expressionOperand = this.readOperand(operands[0]);
                let expressionType = expressionOperand[0];
                let expressionIndex = expressionOperand[1];
                if (expressionType === undefined) {
                    this.reportError('expression type not recognized', lineNumber);
                    return;
                }
                if (expressionType !== 2) {
                    this.reportError('expression type not supported', lineNumber);
                    return;
                }
                if (expressionIndex === undefined) {
                    this.reportError('expression index not recognized', lineNumber);
                    return;
                }
                if (expressionIndex < 0 || expressionIndex >= 2 ^ 32) {
                    this.reportError('expression index not supported', lineNumber);
                    return;
                }
                if (this.usedExpressions.contains(expressionIndex)) {
                    this.reportError('expression index already in use', lineNumber);
                    return;
                }
                if (expressionIndex === 0x40) {
                    expressionIndex = 0xff;
                }
                this.expressionWasm[0] = expressionWasm.length - 1;
                this.codeWasm.concat(this.expressionWasm);
                this.usedExpressions.push(expressionIndex);
                this.currentExpression = expressionIndex;
                this.expressionWasm = [0x00];
                return;
            }
            else {
                this.reportError('instruction not supported', lineNumber);
                return;
            }
        }
        if (operands.length === 1) {
            this.reportError('destination not specified', lineNumber);
            return;
        }

        let destinationOperand = this.readOperand(operands[1]);
        let destinationWasm = [];
        let destinationType = destinationOperand[0];
        let destinationIndex = destinationOperand[1];
        if (destinationType === undefined) {
            this.reportError('destination type not recognized', lineNumber);
            return;
        }
        if (instructionInfo[2][destinationType] === 0) {
            this.reportError('destination type not supported', lineNumber);
            return;
        }
        if (destinationIndex === undefined) {
            this.reportError('destination index not recognized', lineNumber);
            return;
        }
        if (this.validateOperand(destinationOperand) === 0) {
            this.reportError('destination index not supported', lineNumber);
            return;
        }

        instructionWasm.push(instructionInfo[1][destinationType % 2]);

        if (instruction === 'wr') {
            destinationWasm.push(0x00);
            if (destinationType < 2) {
                destinationWasm.push(0x23);
            }
            destinationWasm.concat(this.readBytes(destinationIndex, 32));
        }
        if (instruction === 'cbr') {

        }
        if (instruction === 'msz') {
            instructionWasm.push(0x00);
        }
        if (instruction === 'mxt') {
            instructionWasm.push(0x00);
        }
        if (instruction !== 'mxt' && instruction.substring(0, 2) !== 'ln') {
            destinationWasm.push(0x24);
            destinationWasm.concat(this.readBytes(2 * destinationIndex + destinationType, 32));
        }

        for (let i = 2; i < operands.length; i++) {
            let operand = this.readOperand(operands[i]);
            let operandType = operand[0];
            let operandValue = operand[1];
            if (operandType === undefined) {
                this.reportError('operand type not recognized', lineNumber);
                return;
            }
            if (operandType % 2 !== destinationType && instructionInfo[3] !== 2) {
                this.reportError('operand type not supported', lineNumber);
                return;
            }
            if (operandValue === undefined) {
                this.reportError('operand value not recognized', lineNumber);
                return;
            }
            if (this.validateOperand(operand) === 0) {
                this.reportError('operand value not supported', lineNumber);
                return;
            }
            if (operandType < 2) {
                operandsWasm.push(0x24);
                operandsWasm.push(this.readBytes(2 * operandValue + operandType, 32));
            }
            if (operandType >= 2) {
                operandsWasm.push([0x42, 0x44][operandType - 2]);
                operandsWasm.push(this.readBytes(operandValue, 64, operandType - 2));
            }
            if (instruction === 'set' && operandType % 2 !== destinationType) {
                if (destinationType === 0) {
                    operandsWasm.push(0xb0);
                }
                else {
                    operandsWasm.push(0xb9);
                }
            }
        }

        this.expressionWasm.concat(operandsWasm.concat(instructionWasm.concat(destinationWasm)));     
    }

    readOperand(operand) {
        let type = undefined;
        let value = undefined;
        if (operand.length > 0) {
            type = 2;
            if (operand[0] === 'i') {
                type = 0;
            }
            else if (operand[0] === 'f') {
                type = 1
            }
            else if (operand.contains('.')) {
                type = 3;
            }
            
            let valueString = undefined;
            if (type < 2) {
                valueString = operand.substring(1);
            }
            else {
                valueString = operand;
            }

            let radix = 10;
            if (type !== 3) {
                let prefix = operand.substring(0, 2)
                if (prefix === '0x') {
                    radix = 16;
                    valueString = valueString.substring(2);
                }
                else if (prefix === '0b') {
                    radix = 2;
                    valueString = valueString.substring(2);
                }
            }

            let verifier = '0123456789';
            if (type === 3) {
                verifier += '.-';
                let decimalCount = 0;
                let negativeCount = 0;
                for (let i = 0; i < valueString.length; i++) {
                    if (!verifier.includes(valueString[i])) {
                        return [type, undefined];
                    }
                    if (valueString[i] === '.') {
                        decimalCount++;
                    }
                    if (valueString[i] === '-') {
                        negativeCount++;
                    }
                }
                if (decimalCount !== 1 || negativeCount > 1) {
                    return [type, undefined];
                }
                value = parseFloat(valueString);
            }
            else {
                if (radix === 16) {
                    verifier += 'abcdef';
                }
                else if (radix === 2) {
                    verifier = '01';
                }
                else {
                    verifier += '-';
                }
                for (let i = 0; i < valueString.length; i++) {
                    if (!verifier.includes(valueString[i])) {
                        return [type, undefined];
                    }
                }
                value = parseInt(valueString, radix);
            }
        }
        return [type, value];
    }

    validateOperand(type, value) {
        if (type < 2 && (value < 0 || 2 * value + type >= 2 ^ 32)) {
            return 0;
        }
        else {
            return 1;
        }
    }

    readBytes(value, bits, float = 0) {

    }

    reportError(message, lineNumber) {
        this.errors.push({
            message: message, lineNumber, lineNumber
        });
    }

    appendSection(bytes, index) {
        this.wasm.push(index);
        this.wasm.concat(this.readBytes(bytes.length, 32));
        this.wasm.concat(bytes);
    }
}