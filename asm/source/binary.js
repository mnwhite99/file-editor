class ASMBinary {
    constructor(str) {
        this.binaryStr = '';
        this.convert(str);
    }

    writeLn(str) {
        this.binaryStr += str + '\n';
    }

    convert(str) {
        this.writeLn();
    }
}