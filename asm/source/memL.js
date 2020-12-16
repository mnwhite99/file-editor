class memLine {
    constructor(str, context) {
        this.str = str;
        this.context = context;
        this.asmStr = '';
        this.parse(str);
    }

    parse(str) {
        let argsStr  = '';
        let instrStr = '';
        let tokens = str.split(' ');
        










        this.asmStr += instrStr;
    }
}