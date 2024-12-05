// 字句解析 (Lexer)
class Lexer {
    constructor(sourceCode) {
        this.sourceCode = sourceCode;
        this.tokens = [];
        this.currentIndex = 0;
    }

    tokenize() {
        while (this.currentIndex < this.sourceCode.length) {
            const char = this.sourceCode[this.currentIndex];

            if (/\s/.test(char)) {
                this.currentIndex++; // 空白をスキップ
            } else if (/\d/.test(char)) {
                this.tokens.push(this._readNumber());
            } else if (/[a-zA-Z]/.test(char)) {
                this.tokens.push(this._readIdentifier());
            } else if (char === '(') {
                this.tokens.push({ type: 'LPAREN', value: '(' });
                this.currentIndex++;
            } else if (char === ')') {
                this.tokens.push({ type: 'RPAREN', value: ')' });
                this.currentIndex++;
            } else if (char === '{') {
                this.tokens.push({ type: 'LBRACE', value: '{' });
                this.currentIndex++;
            } else if (char === '}') {
                this.tokens.push({ type: 'RBRACE', value: '}' });
                this.currentIndex++;
            } else if (char === ',') {
                this.tokens.push({ type: 'COMMA', value: ',' });
                this.currentIndex++;
            } else if (char === '+') {
                this.tokens.push({ type: 'OPERATOR', value: '+' });
                this.currentIndex++;
            } else if (char === '=') {
                this.tokens.push({ type: 'EQUALS', value: '=' });
                this.currentIndex++;
            } else if (this.sourceCode.startsWith('function', this.currentIndex)) {
                this.tokens.push({ type: 'FUNCTION', value: 'function' });
                this.currentIndex += 'function'.length;
            } else if (char === ';') {
                this.tokens.push({ type: 'SEMICOLON', value: ';' });
                this.currentIndex++;
            } else {
                throw new Error(`Unexpected character: ${char}`);
            }
        }
        return this.tokens;
    }

    _readNumber() {
        let start = this.currentIndex;
        while (/\d/.test(this.sourceCode[this.currentIndex])) {
            this.currentIndex++;
        }
        return { type: 'NUMBER', value: parseInt(this.sourceCode.slice(start, this.currentIndex)) };
    }

    _readIdentifier() {
        let start = this.currentIndex;
        while (/[a-zA-Z]/.test(this.sourceCode[this.currentIndex])) {
            this.currentIndex++;
        }
        return { type: 'IDENTIFIER', value: this.sourceCode.slice(start, this.currentIndex) };
    }
}

// 構文解析 (Parser)
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.currentIndex = 0;
    }

    parse() {
        const statements = [];
        while (this.currentIndex < this.tokens.length) {
            const token = this.tokens[this.currentIndex];
            if (token.type === 'FUNCTION') {
                statements.push(this._parseFunctionDeclaration());
            } else {
                statements.push(this._parseAssignment());
            }
        }
        return { type: 'Program', body: statements };
    }

    _parseFunctionDeclaration() {
        this.currentIndex++; // 'function' をスキップ
        const nameToken = this.tokens[this.currentIndex++];
        if (nameToken.type !== 'IDENTIFIER') throw new Error('Expected function name');
        const functionName = nameToken.value;

        // 引数の解析
        if (this.tokens[this.currentIndex++].type !== 'LPAREN') throw new Error('Expected (');
        const params = [];
        while (this.tokens[this.currentIndex].type !== 'RPAREN') {
            params.push(this.tokens[this.currentIndex++].value);
            if (this.tokens[this.currentIndex].type === 'COMMA') this.currentIndex++;
        }
        this.currentIndex++; // ')' をスキップ

        // 関数の内容（ブロック）を解析
        if (this.tokens[this.currentIndex++].type !== 'LBRACE') throw new Error('Expected {');
        const body = [];
        while (this.tokens[this.currentIndex].type !== 'RBRACE') {
            body.push(this._parseAssignment());
        }
        this.currentIndex++; // '}' をスキップ

        return { type: 'FunctionDeclaration', name: functionName, params, body };
    }

    _parseAssignment() {
        const identifier = this.tokens[this.currentIndex++];
        const equals = this.tokens[this.currentIndex++];
        if (equals.type !== 'EQUALS') {
            throw new Error("Expected '='");
        }
        const value = this._parseExpression();

        if (this.tokens[this.currentIndex].type === 'SEMICOLON') {
            this.currentIndex++; // ';' をスキップ
        }

        return { type: 'Assignment', identifier: identifier.value, value };
    }

    _parseExpression() {
        const token = this.tokens[this.currentIndex++];
        if (token.type === 'NUMBER') {
            return { type: 'Literal', value: token.value };
        } else if (token.type === 'IDENTIFIER') {
            return { type: 'Variable', name: token.value };
        } else {
            throw new Error("Expected a number or variable");
        }
    }
}

// 仮想マシン (VM)
class VirtualMachine {
    constructor(ast) {
        this.ast = ast;
        this.functions = {};
        this.variables = {};
    }

    execute() {
        for (const statement of this.ast.body) {
            if (statement.type === 'FunctionDeclaration') {
                this.functions[statement.name] = statement;
            } else if (statement.type === 'Assignment') {
                this.variables[statement.identifier] = this._evaluateExpression(statement.value);
            }
        }
        return this.variables;
    }

    _evaluateExpression(expression) {
        if (expression.type === 'Literal') {
            return expression.value;
        } else if (expression.type === 'Variable') {
            return this.variables[expression.name];
        } else {
            throw new Error(`Unknown expression type: ${expression.type}`);
        }
    }

    callFunction(name, args) {
        const func = this.functions[name];
        if (!func) throw new Error(`Undefined function: ${name}`);
        const localVariables = {};
        for (let i = 0; i < func.params.length; i++) {
            localVariables[func.params[i]] = args[i];
        }
        let result;
        for (const statement of func.body) {
            if (statement.type === 'Assignment') {
                localVariables[statement.identifier] = this._evaluateExpression(statement.value);
                result = localVariables[statement.identifier];
            }
        }
        return result;
    }
}

// テストコード
const sourceCode = `
function add(a, b) {
    return a + b;
}
x = 42;
y = add(10, 20);
`;

const lexer = new Lexer(sourceCode);
const tokens = lexer.tokenize();
console.log("Tokens:", tokens);

const parser = new Parser(tokens);
const ast = parser.parse();
console.log("AST:", JSON.stringify(ast, null, 2));

const vm = new VirtualMachine(ast);
const result = vm.execute();
console.log("Execution Result:", result);

console.log("Function Call Result:", vm.callFunction("add", [10, 20]));
