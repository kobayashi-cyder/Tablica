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
            } else if (['+', '-', '*', '/', '%'].includes(char)) {
                this.tokens.push({ type: 'OPERATOR', value: char });
                this.currentIndex++;
            } else if (char === '*' && this.sourceCode[this.currentIndex + 1] === '*') {
                this.tokens.push({ type: 'OPERATOR', value: '**' });
                this.currentIndex += 2;
            } else if (char === '=' && this.sourceCode[this.currentIndex + 1] === '=') {
                this.tokens.push({ type: 'COMPARATOR', value: '==' });
                this.currentIndex += 2;
            } else if (char === '=' && this.sourceCode[this.currentIndex + 1] !== '=') {
                this.tokens.push({ type: 'EQUALS', value: '=' });
                this.currentIndex++;
            } else if (['<', '>', '!', '='].includes(char) &&
                       this.sourceCode[this.currentIndex + 1] === '=') {
                this.tokens.push({ type: 'COMPARATOR', value: char + '=' });
                this.currentIndex += 2;
            } else if (['<', '>'].includes(char)) {
                this.tokens.push({ type: 'COMPARATOR', value: char });
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

        if (this.currentIndex >= this.tokens.length || this.tokens[this.currentIndex].type !== 'SEMICOLON') {
            throw new Error("Expected ';'");
        }

        this.currentIndex++;
        return { type: 'Assignment', identifier: identifier.value, value: value };
    }

    _parseExpression() {
        return this._parseAddSub();
    }

    _parseAddSub() {
        let left = this._parseMulDivMod();

        while (
            this.currentIndex < this.tokens.length &&
            ['+', '-'].includes(this.tokens[this.currentIndex].value)
        ) {
            const operator = this.tokens[this.currentIndex++].value;
            const right = this._parseMulDivMod();
            left = { type: 'BinaryExpression', operator: operator, left: left, right: right };
        }

        return left;
    }

    _parseMulDivMod() {
        let left = this._parsePrimary();

        while (
            this.currentIndex < this.tokens.length &&
            ['*', '/', '%'].includes(this.tokens[this.currentIndex].value)
        ) {
            const operator = this.tokens[this.currentIndex++].value;
            const right = this._parsePrimary();
            left = { type: 'BinaryExpression', operator: operator, left: left, right: right };
        }

        return left;
    }

    _parsePrimary() {
        const token = this.tokens[this.currentIndex++];
        console.log("Parsing Primary Token:", token); // デバッグ出力
        if (token.type === 'NUMBER' || token.type === 'IDENTIFIER') {
            return { type: 'Literal', value: token.value };
        }
        throw new Error("Expected a number or identifier");
    }
}

// テストコード
const sourceCode = "x = 42; y = x + 1 * 3 - 2 / 1;";
const lexer = new Lexer(sourceCode);
const tokens = lexer.tokenize();
console.log("Tokens:", tokens);

const parser = new Parser(tokens);
const ast = parser.parse();
console.log("AST:", JSON.stringify(ast, null, 2));
