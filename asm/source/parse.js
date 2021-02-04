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
            add: [4, [0x7c, 0xa0], [1, 1, 0, 0], [[1, 1, 1, 1], [1, 1, 1, 1]], 0],
            sub: [4, [0x7d, 0xa1], [1, 1, 0, 0], [[1, 1, 1, 1], [1, 1, 1, 1]], 0],
            mul: [4, [0x7e, 0xa2], [1, 1, 0, 0], [[1, 1, 1, 1], [1, 1, 1, 1]], 0],
            div: [4, [0x7f, 0xa3], [1, 1, 0, 0], [[1, 1, 1, 1], [1, 1, 1, 1]], 0],
            lt:  [4, [0x53, 0x63], [1, 0, 0, 0], [[1, 1, 1, 1], [1, 1, 1, 1]], 1],
            gt:  [4, [0x55, 0x64], [1, 0, 0, 0], [[1, 1, 1, 1], [1, 1, 1, 1]], 1],
            eq:  [4, [0x51, 0x61], [1, 0, 0, 0], [[1, 1, 1, 1], [1, 1, 1, 1]], 1],
            leq: [4, [0x57, 0x65], [1, 0, 0, 0], [[1, 1, 1, 1], [1, 1, 1, 1]], 1],
            geq: [4, [0x59, 0x66], [1, 0, 0, 0], [[1, 1, 1, 1], [1, 1, 1, 1]], 1],
            neq: [4, [0x52, 0x62], [1, 0, 0, 0], [[1, 1, 1, 1], [1, 1, 1, 1]], 1],
            and: [4, [0x83, null], [1, 0, 0, 0], [[1, 0, 1, 0], [1, 0, 1, 0]], 1],
            orr: [4, [0x84, null], [1, 0, 0, 0], [[1, 0, 1, 0], [1, 0, 1, 0]], 1],
            xor: [4, [0x85, null], [1, 0, 0, 0], [[1, 0, 1, 0], [1, 0, 1, 0]], 1],
            sl:  [4, [0x86, null], [1, 0, 0, 0], [[1, 0, 1, 0], [1, 0, 1, 0]], 0],
            sr:  [4, [0x87, null], [1, 0, 0, 0], [[1, 0, 1, 0], [1, 0, 1, 0]], 0],
            cbr: [3, [0x04, null], [1, 0, 1, 0], [[1, 0, 1, 0], [0, 0, 0, 0]], 0],
            set: [3, [0x01, 0x01], [1, 1, 0, 0], [[1, 1, 1, 1], [1, 1, 1, 1]], 0],
            rxy: [3, [0x29, 0x2b], [1, 1, 0, 0], [[1, 0, 1, 0], [1, 0, 1, 0]], 0],
            wxy: [3, [0x37, 0x39], [1, 1, 1, 1], [[1, 0, 1, 0], [1, 0, 1, 0]], 0],
            mx:  [1, [0x10, null], [1, 0, 1, 0], [[0, 0, 0, 0], [0, 0, 0, 0]], 0],
            my:  [1, [0x10, null], [1, 0, 1, 0], [[0, 0, 0, 0], [0, 0, 0, 0]], 0],
            mw:  [1, [0x10, null], [1, 0, 1, 0], [[0, 0, 0, 0], [0, 0, 0, 0]], 0],
            mh:  [1, [0x10, null], [1, 0, 1, 0], [[0, 0, 0, 0], [0, 0, 0, 0]], 0],
            msz: [2, [0x3f, null], [1, 0, 0, 0], [[0, 0, 0, 0], [0, 0, 0, 0]], 1],
            mxt: [2, [0x40, null], [1, 0, 1, 0], [[0, 0, 0, 0], [0, 0, 0, 0]], 0]
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
                if (expressionType !== 0 && expressionType !== 2) {
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

        if (instruction === 'wxy') {
            if (destinationType < 2) {
                operandsWasm
            }
            else {

            }
            operandsWasm.concat([0x00, 0x06]);
        }
        else if (instruction === 'cbr') {

        }
        else {
            instructionWasm.push(instructionInfo[1][destinationType % 2]);
            destinationWasm.push(0x24);
            destinationWasm.concat(this.readBytes(2 * destinationIndex + destinationType, 32));
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
        if (type < 2 && (value < 0 || 2 * value + type - 2 >= 2 ^ 32)) {
            return 0;
        }
        else {
            return 1;
        }
    }

    readBytes(value, bits, float = 0) {

    }

    composeByteArray(binaryString) {
        let byteArray = new Uint8Array(Math.ceil(binaryString.length / 8));
        for (let i = 0; i < binaryString.length; i += 8) {
            let byteValue = parseInt(binaryString.substring(i, i + 8), 2);
            byteArray.push(byteValue);
        }
        return byteArray;
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