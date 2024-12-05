//日本語でコメントします。
//私自身の不勉強によりJSにて記述しています。
//一旦、コンパイラをブラウザ上で作って、仮想バイトコードを作って、それでコンパイラを作成して、それを用いてセルフホストしてみようかと思っています。
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
            } else if (char === '=') {
                this.tokens.push({ type: 'EQUALS', value: '=' });
                this.currentIndex++;
            } else if (['+', '-', '*', '/'].includes(char)) {
                this.tokens.push({ type: 'OPERATOR', value: char }); // 演算子トークン
                this.currentIndex++;
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
        while (/[a-zA-Z0-9]/.test(this.sourceCode[this.currentIndex])) {
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
            statements.push(this._parseStatement());
        }
        return { type: 'Program', body: statements };
    }

    _parseStatement() {
        const token = this.tokens[this.currentIndex];
        if (token.type === 'IDENTIFIER') {
            return this._parseAssignment();
        } else {
            throw new Error(`Unexpected token: ${token.type}`);
        }
    }

    _parseAssignment() {
        const identifier = this.tokens[this.currentIndex++];
        const equals = this.tokens[this.currentIndex++];
        if (equals.type !== 'EQUALS') {
            throw new Error("Expected '='");
        }
        const value = this._parseExpression();

        // セミコロンのチェック
        if (this.currentIndex >= this.tokens.length || this.tokens[this.currentIndex].type !== 'SEMICOLON') {
            throw new Error("Expected ';'");
        }

        this.currentIndex++; // セミコロンを消費
        return { type: 'Assignment', identifier: identifier.value, value: value };
    }

    _parseExpression() {
        return this._parseAddSub();
    }

    // 優先順位: +, -
    _parseAddSub() {
        let left = this._parseMulDiv();

        while (
            this.currentIndex < this.tokens.length &&
            (this.tokens[this.currentIndex].value === '+' || this.tokens[this.currentIndex].value === '-')
        ) {
            const operator = this.tokens[this.currentIndex++].value; // '+' または '-'
            const right = this._parseMulDiv();
            left = { type: 'BinaryExpression', operator: operator, left: left, right: right };
        }

        return left;
    }

    // 優先順位: *, /
    _parseMulDiv() {
        let left = this._parsePrimary();

        while (
            this.currentIndex < this.tokens.length &&
            (this.tokens[this.currentIndex].value === '*' || this.tokens[this.currentIndex].value === '/')
        ) {
            const operator = this.tokens[this.currentIndex++].value; // '*' または '/'
            const right = this._parsePrimary();
            left = { type: 'BinaryExpression', operator: operator, left: left, right: right };
        }

        return left;
    }

    _parsePrimary() {
        const token = this.tokens[this.currentIndex++];
        if (token.type === 'NUMBER' || token.type === 'IDENTIFIER') {
            return { type: 'Literal', value: token.value };
        }
        throw new Error("Expected a number or identifier");
    }
}

// 仮想命令セット生成 (Code Generator)
class CodeGenerator {
    constructor(ast) {
        this.ast = ast;
        this.bytecode = [];
    }

    generate() {
        this._traverse(this.ast.body);
        return this.bytecode;
    }

    _traverse(statements) {
        for (const statement of statements) {
            if (statement.type === 'Assignment') {
                this._generateAssignment(statement);
            }
        }
    }

    _generateAssignment(statement) {
        this._generateExpression(statement.value);
        this.bytecode.push({ opcode: 'STORE', operand: statement.identifier });
    }

    _generateExpression(expression) {
        if (expression.type === 'Literal') {
            this.bytecode.push({ opcode: 'LOAD', operand: expression.value });
        } else if (expression.type === 'BinaryExpression') {
            this._generateExpression(expression.left);
            this._generateExpression(expression.right);
            this.bytecode.push({ opcode: this._getOpcode(expression.operator) });
        }
    }

    _getOpcode(operator) {
        switch (operator) {
            case '+': return 'ADD';
            case '-': return 'SUB';
            case '*': return 'MUL';
            case '/': return 'DIV';
            default: throw new Error(`Unsupported operator: ${operator}`);
        }
    }
}

// テストコード
const sourceCode = "x = 42; y = x + 1 * 3 - 2 / 1;";

// 1. 字句解析
const lexer = new Lexer(sourceCode);
const tokens = lexer.tokenize();
console.log("Tokens:", tokens);

// 2. 構文解析
const parser = new Parser(tokens);
const ast = parser.parse();
console.log("AST:", JSON.stringify(ast, null, 2));

// 3. 仮想命令セット生成
const codeGenerator = new CodeGenerator(ast);
const bytecode = codeGenerator.generate();
console.log("Bytecode:", bytecode);
