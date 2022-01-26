import { Token, TokenType } from "./tokens.js";

const DIGITS = '0123456789'
const DIGITS_DOT = DIGITS + '.';
const WHITE_SPACE = ' \t'

export class Lexter {

    private readonly src: string;
    private tokenList: Token[];
    private currentPos: number = -1;
    private currentChar: string;

    constructor(src: string) {
        this.src = src;
        this.tokenList = [];
        this.advance();
    }

    private advance(): void {
        this.currentPos++;
        if (this.currentPos < this.src.length) {
            this.currentChar = this.src[this.currentPos];
        } else {
            this.currentChar = undefined;
        }
    }

    private appendToken(token: Token) {
        this.tokenList.push(token);
    }

    public tokenize(): Token[] {

        while (this.currentChar) {
            const char = this.currentChar;
            if (char === '+') {
                this.appendToken({ type: TokenType.TT_PLUS });
                this.advance();
            } else if (char === '-') {
                this.appendToken({ type: TokenType.TT_MINUS });
                this.advance();
            } else if (char === '*') {
                this.appendToken({ type: TokenType.TT_MULTY });
                this.advance();
            } else if (char === '/') {
                this.appendToken({ type: TokenType.TT_DIV });
                this.advance();
            } else if (char === '(') {
                this.appendToken({ type: TokenType.TT_L_PARAN });
                this.advance();
            } else if (char === ')') {
                this.appendToken({ type: TokenType.TT_R_PARAN });
                this.advance();
            } else if (DIGITS.indexOf(char) !== -1) {
                this.getNumber();
            } else if (WHITE_SPACE.indexOf(char) !== -1) {
                this.advance();
            }
            else {
                // TODO: implement error-system...
                console.log(`Invalid token: ${char}`);
                return null;
            }
        }





        this.appendToken({ type: TokenType.TT_EOF });
        return this.tokenList;
    }


    private getNumber() {
        let token_str = this.currentChar;
        let dots = 0;
        this.advance();


        while (this.currentChar && (DIGITS_DOT.indexOf(this.currentChar) !== -1)) {
            token_str += this.currentChar;
            if (this.currentChar === '.') {
                dots++;
            }
            this.advance();
        }

        if (dots > 1) {
            // TODO: implement error system...
            console.log(`Invalid token: more than one dots in: ${token_str}`);
            return;
        }

        if (dots === 1) {
            this.appendToken({ type: TokenType.TT_FLOAT, value: Number(token_str) });
        } else {
            this.appendToken({ type: TokenType.TT_INT, value: Number(token_str) });
        }

    }
}