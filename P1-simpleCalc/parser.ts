import { Token, TokenType } from './tokens.js'

export enum NodeType {
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


export interface ExprNode extends BaseNode {
    exprType: 'plus' | 'minus' | 'term'
    nodes?: BaseNode | BiNode
}

export interface TermNode extends BaseNode {
    termType: 'multi' | 'div' | 'factor'
    nodes?: BaseNode | BiNode
}

export interface FactorNode extends BaseNode {
    facrorType: 'number' | 'minusSign' | 'paran'
    value?: number,
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
        if (this.currentPos < this.tokens.length) {
            this.currentToken = this.tokens[this.currentPos];
        } else {
            this.currentToken = undefined;
        }
    }


    public parse(): ExprNode {
        const expr: ExprNode = this.expr()

        if (this.currentToken && this.currentToken.type !== TokenType.TT_EOF) {
            console.log('Invalid syntax');
            return null;
        }

        return expr;
    }

    private expr(): ExprNode {
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