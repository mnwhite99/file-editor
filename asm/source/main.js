class Parser {
    constructor(text) {
        this.assembly = [];
        this.codeAssembly = [];
        this.functionAssembly = [];
        this.usedFunctionValues = [];
        this.currentFunctionValue = 0;
        this.errors = [];
        this.lineCount = 0;
        this.integerCount = 0;
        this.floatCount = 0;
        this.parseText(text);
    }

    parseText(text) {
        let instructionSet = {
            buf: [4, [null, 0x00], ['144'       ], 0],
            add: [4, [0x7c, 0xa0], ['044', '155'], 0],
            sub: [4, [0x7d, 0xa1], ['044', '155'], 0],
            mul: [4, [0x7e, 0xa2], ['044', '155'], 0],
            div: [4, [0x7f, 0xa3], ['044', '155'], 0],
            lt:  [4, [0x53, 0x63], ['044', '055'], 1],
            gt:  [4, [0x55, 0x64], ['044', '055'], 1],
            eq:  [4, [0x51, 0x61], ['044', '055'], 1],
            leq: [4, [0x57, 0x65], ['044', '055'], 1],
            geq: [4, [0x59, 0x66], ['044', '055'], 1],
            neq: [4, [0x52, 0x62], ['044', '055'], 1],
            and: [4, [0x83, null], ['044'       ], 0],
            ior: [4, [0x84, null], ['044'       ], 0],
            xor: [4, [0x85, null], ['044'       ], 0],
            sl:  [4, [0x86, null], ['044'       ], 0],
            sr:  [4, [0x87, null], ['044'       ], 0],
            set: [3, [0x01, 0x01], ['04',  '15' ], 0],
            cvt: [3, [0xb0, 0xb9], ['05',  '14' ], 0],
            bif: [3, [0x04, null], ['44'        ], 0],
            rd:  [3, [0x29, 0x2b], ['04',  '14' ], 0],
            wr:  [3, [0x37, 0x39], ['44',  '45' ], 0],
            sz:  [2, [0x40, null], ['04'        ], 1]
        };
        let lines = text.split('\n');
        this.lineCount = lines.length;
        this.assembly.concat([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
        for (let i = 0; i < lines.length; i++) {
            this.parseLine(line, i, instructionSet);
        }
        this.appendSection(this.codeAssembly, 10);
        let functionTypes = this.readBytes(this.usedFunctionValues.length, 32);
        for (let i = 0; i < this.usedFunctionValues.length; i++) {
            functionTypes.concat([0x60, 0x00]);
        }
        this.appendSection(functionTypes, 3);
        let byteArray = new Uint8Array(this.assembly.length);
        for (let i = 0; i < this.assembly.length; i++) {
            byteArray[i] = this.assembly[i];
        }
        this.assembly = byteArray;
    }

    parseLine(line, lineNumber, instructionSet) {
        let operands = line.trim().split(' ').map(operand => operand.trim());

        let operandsAssembly = [];
        let instructionAssembly = [];
        let destinationAssembly = [];

        let typeString = '';

        let instruction = operands[0];
        let instructionKey = instructionSet[instruction];
        if (instructionKey === undefined) {
            if (operands.length === 1) {
                let functionOperand = this.readOperand(operands[0]);
                let functionType = functionOperand[0];
                let functionValue = functionOperand[1];
                if (functionType === undefined) {
                    this.reportError('function type not recognized', lineNumber);
                    return;
                }
                else if (functionType !== 2) {
                    this.reportError('function type not supported', lineNumber);
                    return;
                }
                else if (functionValue === undefined) {
                    this.reportError('function value not recognized', lineNumber);
                    return;
                }
                else if (functionValue < 0 || functionValue >= 2 ^ 32) {
                    this.reportError('function value not supported', lineNumber);
                    return;
                }
                else if (this.usedFunctionValues.includes(functionValue)) {
                    this.reportError('function value already in use', lineNumber);
                    return;
                }
                let functionCodeLength = this.readBytes(this.functionAssembly.length - 5, 33);
                for (let i = 0; i < 5; i++) {
                    this.functionAssembly[i] = functionCodeLength[i];
                }
                this.codeAssembly.concat(this.functionAssembly);
                this.usedFunctionValues.push(functionValue);
                this.currentFunctionValue = functionValue;
                this.functionAssembly = [0x01, 0x01, 0x01, 0x01, 0x01];
                return;
            }
            else {
                this.reportError('instruction not recognized', lineNumber);
                return;
            }
        }

        let destination = operands[1];
        let destinationOperand = this.readOperand(destination);
        let destinationType = destinationOperand[0];
        let destinationValue = destinationOperand[1];
        if (destinationType === undefined) {
            this.reportError('destination type not recognized', lineNumber);
            return;
        }
        else if (destinationValue === undefined) {
            this.reportError('destination value not recognized', lineNumber);
            return;
        }
        else if (this.validateOperand(destinationOperand) === 0) {
            this.reportError('destination value not supported', lineNumber);
            return;
        }
        else if (instruction === 'bif') {
            destinationAssembly.concat([0x00, 0x11, 0x06]);
            if (destinationType === 0) {
                destinationAssembly.push(0x23);
                destinationAssembly.concat(this.readBytes(2 * destinationValue, 32, 0));
            }
            if (destinationType === 2) {
                destinationAssembly.concat(this.readBytes(destinationValue, 32, 0));
            }
        }
        else if (instruction !== 'wr') {
            destinationAssembly.push(0x24);
            destinationAssembly.concat(this.readBytes(destinationValue, 32));
        }

        instructionAssembly.push(instructionKey[1][destinationType % 2]);
        if (instruction === 'sz') {
            instructionAssembly.push(0x00);
        }
        else if (instruction === 'rd' || instruction === 'wr') {
            instructionAssembly.concat([0x05, 0x00]);
        }

        for (let i = 2; i < operands.length; i++) {
            let operand = this.readOperand(operands[i]);
            let operandType = operand[0];
            let operandValue = operand[1];
            if (operandType === undefined) {
                this.reportError('operand type not recognized', lineNumber);
                return;
            }
            else if (operandValue === undefined) {
                this.reportError('operand value not recognized', lineNumber);
                return;
            }
            else if (this.validateOperand(operand) === 0) {
                this.reportError('operand value not supported', lineNumber);
                return;
            }
            else if (operandType < 2) {
                operandsAssembly.push(0x24);
                operandsAssembly.concat(this.readBytes(2 * operandValue + operandType, 32, 0));
            }
            else {
                operandsAssembly.push([0x42, 0x44][operandType - 2]);
                operandsAssembly.push(this.readBytes(operandValue, 64, operandType));
            }
            if (instruction === 'rd') {
                operandsAssembly.concat(0x08, 0x00);
            }
        }

        if (instruction === 'wr') {
            operandsAssembly.push(0x24);
            operandsAssembly.concat(this.readBytes(destinationValue, 32, 0));
        }

        if (this.validateTypeString(typeString, instructionKey[2]) === 0) {
            this.reportError('operand types not supported', lineNumber);
            return;
        }

        this.functionAssembly.concat(operandsAssembly);
        this.functionAssembly.concat(instructionAssembly);
        this.functionAssembly.concat(destinationAssembly);
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
                let prefix = operand.substring(0, 2);
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
            if (type === 0 && value > this.integerCount) {
                this.integerCount = value;
            }
            if (type === 1 && value > this.floatCount) {
                this.floatCount = value;
            }
            return 1;
        }
    }

    readBytes(value, bits, type) {
        let bitArray = [];
        if (type % 2 === 1) {
            let sign = Math.signum(value);
            let magnitude = Math.abs(value);   
            if (sign < 0) {
                bitArray.push(1);
            }
            else {
                bitArray.push(0);
            }
            

        }
    }

    reportError(message, lineNumber) {
        this.errors.push({
            message: message,
            lineNumber: lineNumber
        });
    }

    validateTypeString(typeString, validTypeStrings) {
        for (let i = 0; i < validTypeStrings.length; i++) {
            for (let j = 0; j < typeString.length && j < validTypeStrings[i].length; j++) {
                let typeCharacter = typeString[j];
                let validTypeCharacter = validTypeStrings[i][j];
                if (typeCharacter !== validTypeCharacter) {
                    if (validTypeCharacter === '4') {
                        if (typeCharacter === '1' || typeCharacter === '3') {
                            return 0;
                        }
                    }
                    else if (validTypeCharacter === '5') {
                        if (typeCharacter === '0' || typeCharacter === '2') {
                            return 0;
                        }
                    }
                    else {
                        return 0;
                    }
                }
            }
        }
        return 1;
    }

    appendSection(bytes, index) {
        this.assembly.push(index);
        this.assembly.concat(this.readBytes(bytes.length, 32));
        this.assembly.concat(bytes);
    }
}

class Definition {
    constructor(title, content) {
        this.title = title;
        this.content = content;
    }
}

class Editor {
    constructor() {
        this.audioContext = new window.AudioContext() || new window.webkitAudioContext();
        this.assembly = undefined;

        let definitions = localStorage.getItem('definitions');
        if (definitions === null || definitions === undefined) {
            definitions = '{}';
        }
        this.definitions = JSON.parse(definitions);

        let definition = document.getElementById('definition');
        let definitionText = definition.value;
        let textEntry = document.getElementById('textEntry');
        this.protectTextArea(textEntry);
        this.protectTextArea(definition);

        definition.addEventListener('input', function() {
            definitionText = definition.value;
            localStorage.setItem('definition', definitionText);
            if (definitionText === '') {
                textEntry.oninput = function(event) {
                    event.preventDefault();
                }
            }
        });

        window.addEventListener('load', function() {
            let text = localStorage.getItem('text');
            if (text === undefined || text === null) {
                text = '';
            }
            textEntry.innerHTML = text;
        });
        textEntry.addEventListener('input', function() {
            localStorage.setItem('text', textEntry.value);
        });
        window.onselect = function() {
            window.getSelection().collapseToStart();
        }
    }

    protectTextArea(textArea) {
        textArea.oncut = function(event) {
            event.preventDefault();
        }
        textArea.oncopy = function(event) {
            event.preventDefault();
        }
        textArea.onpaste = function(event) {
            event.preventDefault();
        }
        textArea.ondrag = function(event) {
            event.preventDefault();
        }
        textArea.ondrop = function(event) {
            event.preventDefault();
        }
        textArea.onpointermove = function(event) {
            event.preventDefault();
        }
        textArea.oncontextmenu = function(event) {
            event.preventDefault();
        }
    }
    
    instantiate(definition) {
        this.assembly = (new Parser(definition.content)).assembly;
        while (1) {

        }
        let processorNode = new AudioWorkletNode(this.audioContext, 'compiledProcessor');
        processorNode.connect(this.audioContext.destination);
    }
}

let editor = new Editor();