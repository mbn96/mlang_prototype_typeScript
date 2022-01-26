import { KeywordType, Token, TokenType } from './tokens.js'

export enum NodeType {
    NT_STATE = 'NT_STATE',
    NT_EXPR = 'NT_EXPR',
    NT_TERM = 'NT_TERM',
    NT_FACTOR = 'NT_FACTOR'
}



export interface BaseNode {
    type: NodeType
}

export interface BiNode {
    left: BaseNode,
    right: BaseNode
}


export interface StatementNode extends BaseNode {
    statementType: 'declear' | 'expr'
    expr?: BaseNode
    identifier?: string
}

export interface ExprNode extends BaseNode {
    exprType: 'plus' | 'minus' | 'term' | 'assign'
    nodes?: BaseNode | BiNode
    expr?: BaseNode
    identifier?: string
}

export interface TermNode extends BaseNode {
    termType: 'multi' | 'div' | 'factor'
    nodes?: BaseNode | BiNode
}

export interface FactorNode extends BaseNode {
    facrorType: 'number' | 'ID' | 'minusSign' | 'paran'
    value?: number | string,
    node?: BaseNode
}

export class Parser {

    private readonly tokens: Token[];
    private currentPos: number = -1;
    private currentToken: Token = undefined;


    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.advance()
    }

    private advance() {
        this.currentPos++;
        if (this.currentPos >= 0 && this.currentPos < this.tokens.length) {
            this.currentToken = this.tokens[this.currentPos];
        } else {
            this.currentToken = undefined;
        }
    }

    private moveBack() {
        this.currentPos--;
        if (this.currentPos >= 0 && this.currentPos < this.tokens.length) {
            this.currentToken = this.tokens[this.currentPos];
        } else {
            this.currentToken = undefined;
        }
    }

    public parse(): StatementNode {
        const state: StatementNode = this.statement()

        if (this.currentToken && this.currentToken.type !== TokenType.TT_EOF) {
            console.log('Invalid syntax');
            return null;
        }

        return state;
    }

    private statement(): StatementNode {
        let state: StatementNode;
        if (this.currentToken.type === TokenType.TT_KEYWORD && this.currentToken.keword === KeywordType.KW_VAR) {
            // this is a decleation...
            this.currentToken = null
            this.advance();
            if (this.currentToken.type === TokenType.TT_IDENTIFIER) {
                const id = this.currentToken.value;
                this.currentToken = null
                this.advance()
                if (this.currentToken.type === TokenType.TT_EQ) {
                    this.advance()
                    state = { type: NodeType.NT_STATE, statementType: 'declear', identifier: id, expr: this.expr() }
                } else {
                    throw new Error('No Equal sign after \'var\' keyword...');
                }
            } else {
                throw new Error('No identifier after \'var\' keyword...');
            }
        } else {
            state = { type: NodeType.NT_STATE, statementType: 'expr', expr: this.expr() }
        }

        return state;
    }

    private expr(): ExprNode {
        if (this.currentToken.type === TokenType.TT_IDENTIFIER) {
            const id = this.currentToken.value;
            this.currentToken = null
            this.advance()
            if (this.currentToken.type === TokenType.TT_EQ) {
                this.advance()
                return { type: NodeType.NT_EXPR, exprType: 'assign', identifier: id, expr: this.expr() }
            } else {
                this.moveBack()
            }
        }

        let expr: ExprNode = { type: NodeType.NT_EXPR, exprType: 'term', nodes: this.term() }

        while (this.currentToken.type === TokenType.TT_PLUS || this.currentToken.type === TokenType.TT_MINUS) {
            let token = this.currentToken;
            this.advance()
            expr = {
                type: NodeType.NT_EXPR,
                exprType: token.type === TokenType.TT_PLUS ? 'plus' : 'minus',
                nodes: { left: expr, right: this.term() }
            };
        }

        return expr;
    }

    private term(): TermNode {
        let term: TermNode = { type: NodeType.NT_TERM, termType: 'factor', nodes: this.factor() }

        while (this.currentToken.type === TokenType.TT_DIV || this.currentToken.type === TokenType.TT_MULTY) {
            let token = this.currentToken;
            this.advance()
            term = {
                type: NodeType.NT_TERM,
                termType: token.type === TokenType.TT_MULTY ? 'multi' : 'div',
                nodes: { left: term, right: this.factor() }
            };
        }

        return term;
    }

    private factor(): FactorNode {
        let factor: FactorNode;

        if (this.currentToken.type === TokenType.TT_MINUS) {
            this.advance();
            factor = { type: NodeType.NT_FACTOR, facrorType: 'minusSign', node: this.factor() };
        } else if (this.currentToken.type === TokenType.TT_INT || this.currentToken.type === TokenType.TT_FLOAT) {
            factor = { type: NodeType.NT_FACTOR, facrorType: 'number', value: this.currentToken.value };
            this.advance();
        } else if (this.currentToken.type === TokenType.TT_IDENTIFIER) {
            factor = { type: NodeType.NT_FACTOR, facrorType: 'ID', value: this.currentToken.value };
            this.advance();
        } else if (this.currentToken.type === TokenType.TT_L_PARAN) {
            this.currentToken = null // Added to hide typeScript warring...
            this.advance()
            let expr = this.expr();
            if (this.currentToken.type === TokenType.TT_R_PARAN) {
                this.advance();
            } else {
                console.log('Invalid syntax: No closing paran.');
            }
            factor = { type: NodeType.NT_FACTOR, facrorType: 'paran', node: expr };
        }

        return factor;
    }

}