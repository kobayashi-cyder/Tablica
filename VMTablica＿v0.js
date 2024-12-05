class VirtualMachine {
    constructor(bytecode) {
        this.bytecode = bytecode;
        this.stack = [];
        this.variables = {};
    }

    execute() {
        for (const instruction of this.bytecode) {
            switch (instruction.opcode) {
                case 'LOAD':
                    if (typeof instruction.operand === 'string') {
                        // 変数の値をロード
                        if (instruction.operand in this.variables) {
                            this.stack.push(this.variables[instruction.operand]);
                        } else {
                            throw new Error(`Undefined variable: ${instruction.operand}`);
                        }
                    } else {
                        // リテラル値をロード
                        this.stack.push(instruction.operand);
                    }
                    break;
                case 'STORE':
                    // スタックのトップを変数に保存
                    this.variables[instruction.operand] = this.stack.pop();
                    break;
                case 'ADD':
                    const addRight = this.stack.pop();
                    const addLeft = this.stack.pop();
                    this.stack.push(addLeft + addRight);
                    break;
                case 'SUB':
                    const subRight = this.stack.pop();
                    const subLeft = this.stack.pop();
                    this.stack.push(subLeft - subRight);
                    break;
                case 'MUL':
                    const mulRight = this.stack.pop();
                    const mulLeft = this.stack.pop();
                    this.stack.push(mulLeft * mulRight);
                    break;
                case 'DIV':
                    const divRight = this.stack.pop();
                    const divLeft = this.stack.pop();
                    if (divRight === 0) {
                        throw new Error("Division by zero");
                    }
                    this.stack.push(divLeft / divRight);
                    break;
                default:
                    throw new Error(`Unknown opcode: ${instruction.opcode}`);
            }
        }
        return this.variables;
    }
}
