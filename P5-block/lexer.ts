import { Keywords, Token, TokenType } from "./tokens.js";

const DIGITS = '0123456789'
const DIGITS_DOT = DIGITS + '.';
const WHITE_SPACE = ' \t'
const LETTERS = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
const LETTERS_DASH = LETTERS + '_'
const LETTERS_DASH_DIGITS = LETTERS_DASH + DIGITS


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
            } else if (char === '=') {
                this.get_two_char_token('==', [TokenType.TT_ASSIGN, TokenType.TT_EQ])
            }
            else if (char === '!') {
                this.get_two_char_token('!=', [TokenType.TT_LOGICAL_NOT, TokenType.TT_NOT_EQ])
            }
            else if (char === '&') {
                this.get_two_char_token('&&', [TokenType.TT_ILLIGAL, TokenType.TT_LOGIC_AND])
            }
            else if (char === '|') {
                this.get_two_char_token('||', [TokenType.TT_ILLIGAL, TokenType.TT_LOGIC_OR])
            }
            else if (char === '(') {
                this.appendToken({ type: TokenType.TT_L_PARAN });
                this.advance();
            } else if (char === ')') {
                this.appendToken({ type: TokenType.TT_R_PARAN });
                this.advance();
            } else if (char === ',') {
                this.appendToken({ type: TokenType.TT_COMMA });
                this.advance();
            } else if (char === '<') {
                this.appendToken({ type: TokenType.TT_LESS });
                this.advance();
            } else if (char === '>') {
                this.appendToken({ type: TokenType.TT_GREATER });
                this.advance();
            }
            else if (DIGITS.indexOf(char) !== -1) {
                this.getNumber();
            } else if (LETTERS_DASH.indexOf(char) !== -1) {
                this.get_ID_KW();
            }
            else if (WHITE_SPACE.indexOf(char) !== -1) {
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

    private get_two_char_token(token: string, t_types: [TokenType, TokenType]/*, one_lenght_throw: boolean*/) {
        this.advance()

        if (this.currentChar === token[1]) {
            this.advance();
            this.appendToken({ type: t_types[1] })
        } else {
            if (t_types[0] === TokenType.TT_ILLIGAL) {
                throw new Error(`Token " ${token[0]} " is not supported!`);
            }

            this.appendToken({ type: t_types[0] })
        }

    }

    private get_ID_KW() {
        let token_str = this.currentChar;
        this.advance();

        while (this.currentChar && (LETTERS_DASH_DIGITS.indexOf(this.currentChar) !== -1)) {
            token_str += this.currentChar;
            this.advance();
        }

        if (token_str in Keywords) {
            this.appendToken({ type: TokenType.TT_KEYWORD, keword: Keywords[token_str] })
        } else {
            this.appendToken({ type: TokenType.TT_IDENTIFIER, value: token_str })
        }

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