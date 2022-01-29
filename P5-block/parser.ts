import { KeywordType, Token, TokenType } from './tokens.js'

export enum NodeType {
    NT_BLOCK = 'NT_BLOCK',
    NT_STATE = 'NT_STATE',
    NT_ASSIGN = 'NT_ASSIGN',
    NT_LOGICAL = 'NT_LOGICAL',
    NT_COMPR = 'NT_COMPR',
    NT_EXPR = 'NT_EXPR',
    NT_TERM = 'NT_TERM',
    NT_FACTOR = 'NT_FACTOR',
    NT_FN_ARGS = 'NT_FN_ARGS',
}



export interface Node {
    type: NodeType,
    statementType?: 'declear' | 'expr'
    assignmentType?: 'assign' | 'logical'
    logicalType?: 'NOT' | 'AND' | 'OR' | 'compr'
    compr_type?: 'equal' | 'not_equal' | 'less_than' | 'greater_than' | 'expr'
    exprType?: 'plus' | 'minus' | 'term'
    termType?: 'multi' | 'div' | 'factor'
    facrorType?: 'number' | 'ID' | 'minusSign' | 'paran' | 'func_call'
    // expr?: Node
    identifier?: string,
    // left?: Node,
    // right?: Node,
    nodes?: Node | Node[] | BiNode
    value?: number | string
}

export interface BiNode {
    left: Node,
    right: Node
}


// export interface StatementNode extends Node {
//     statementType: 'declear' | 'expr'
//     expr?: Node
//     identifier?: string
// }

// export interface ExprNode extends Node {
//     exprType: 'plus' | 'minus' | 'term' | 'assign'
//     nodes?: Node | BiNode
//     expr?: Node
//     identifier?: string
// }

// export interface TermNode extends Node {
//     termType: 'multi' | 'div' | 'factor'
//     nodes?: Node | BiNode
// }

// export interface FactorNode extends Node {
//     facrorType: 'number' | 'ID' | 'minusSign' | 'paran' | 'func_call'
//     value?: number | string,
//     node?: Node
// }

// export interface FnArgsNode extends Node {
//     nodes?: ExprNode[]
// }

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

    private checkTokenType(token: Token, ...types: TokenType[]) {
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            if (type === token.type) {
                return true;
            }
        }
        return false;
    }

    public parse(): Node {
        const block: Node = this.block();

        if (this.currentToken && this.currentToken.type !== TokenType.TT_EOF) {
            console.log('Invalid syntax');
            console.log(block);
            return null;
        }

        return block;
    }

    private block(): Node {
        const block: Node = { type: NodeType.NT_BLOCK, nodes: [] }

        while (this.currentToken && this.currentToken.type !== TokenType.TT_EOF) {
            const next_node = this.statement();
            if (!next_node) {
                console.log('Invalid syntax. In block method...');
                return block;
            }
            (block.nodes as Node[]).push(next_node);
        }

        return block;
    }

    private statement(): Node {
        let state: Node;
        if (this.currentToken.type === TokenType.TT_KEYWORD && this.currentToken.keword === KeywordType.KW_VAR) {
            // this is a decleation...
            this.currentToken = null
            this.advance();
            if (this.currentToken.type === TokenType.TT_IDENTIFIER) {
                const id = this.currentToken.value;
                this.currentToken = null
                this.advance()
                if (this.currentToken.type === TokenType.TT_ASSIGN) {
                    this.advance()
                    state = { type: NodeType.NT_STATE, statementType: 'declear', identifier: id, nodes: this.assignment() }
                } else {
                    throw new Error('No Equal sign after \'var\' keyword...');
                }
            } else {
                throw new Error('No identifier after \'var\' keyword...');
            }
        } else {
            state = { type: NodeType.NT_STATE, statementType: 'expr', nodes: this.assignment() }
        }

        return state;
    }

    private assignment(): Node {
        if (this.currentToken.type === TokenType.TT_IDENTIFIER) {
            const id = this.currentToken.value;
            this.currentToken = null
            this.advance()
            if (this.currentToken.type === TokenType.TT_ASSIGN) {
                this.advance()
                return { type: NodeType.NT_ASSIGN, assignmentType: 'assign', identifier: id, nodes: this.assignment() }
            } else {
                this.moveBack()
            }
        }


        let assignment: Node = { type: NodeType.NT_ASSIGN, assignmentType: 'logical', nodes: this.logical() }
        return assignment;
    }

    private logical(): Node {

        // if (this.currentToken.type === TokenType.TT_LOGICAL_NOT) {
        //     return { type: NodeType.NT_LOGICAL, logicalType: 'NOT', nodes: this.logical() }
        // }

        let logical: Node = { type: NodeType.NT_LOGICAL, logicalType: 'compr', nodes: this.compr() }

        while (this.checkTokenType(this.currentToken, TokenType.TT_LOGIC_AND, TokenType.TT_LOGIC_OR)) {
            let token = this.currentToken;
            this.advance()
            logical = {
                type: NodeType.NT_LOGICAL,
                logicalType: token.type === TokenType.TT_LOGIC_AND ? 'AND' : 'OR',
                nodes: { left: logical, right: this.compr() }
            };

        }

        return logical;
    }
    private compr(): Node {

        let compr: Node = { type: NodeType.NT_COMPR, compr_type: 'expr', nodes: this.expr() }

        while (this.checkTokenType(this.currentToken, TokenType.TT_EQ, TokenType.TT_NOT_EQ, TokenType.TT_LESS, TokenType.TT_GREATER)) {
            let token = this.currentToken;
            this.advance()
            compr = {
                type: NodeType.NT_COMPR,
                compr_type:
                    token.type === TokenType.TT_EQ ? 'equal' :
                        token.type === TokenType.TT_NOT_EQ ? 'not_equal' :
                            token.type === TokenType.TT_LESS ? 'less_than' : 'greater_than',
                nodes: { left: compr, right: this.expr() }
            };

        }

        return compr;
    }

    private expr(): Node {


        let expr: Node = { type: NodeType.NT_EXPR, exprType: 'term', nodes: this.term() }

        while (this.checkTokenType(this.currentToken, TokenType.TT_PLUS, TokenType.TT_MINUS)) {
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

    private term(): Node {
        let term: Node = { type: NodeType.NT_TERM, termType: 'factor', nodes: this.factor() }

        while (this.checkTokenType(this.currentToken, TokenType.TT_MULTY, TokenType.TT_DIV)) {
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

    private factor(): Node {
        let factor: Node;

        if (this.currentToken.type === TokenType.TT_MINUS) {
            this.advance();
            factor = { type: NodeType.NT_FACTOR, facrorType: 'minusSign', nodes: this.factor() };
        }

        //TODO: Decide if it should be LogicalType or FactorType...
        else if (this.currentToken.type === TokenType.TT_LOGICAL_NOT) {
            this.advance();
            factor = { type: NodeType.NT_LOGICAL, logicalType: 'NOT', nodes: this.factor() };
        }


        else if (this.checkTokenType(this.currentToken, TokenType.TT_INT, TokenType.TT_FLOAT)) {
            factor = { type: NodeType.NT_FACTOR, facrorType: 'number', value: this.currentToken.value };
            this.advance();
        } else if (this.currentToken.type === TokenType.TT_IDENTIFIER) {
            // factor = { type: NodeType.NT_FACTOR, facrorType: 'ID', value: this.currentToken.value };
            // this.advance();
            const id = this.currentToken.value;
            this.currentToken = null;
            this.advance()
            if (this.currentToken.type === TokenType.TT_L_PARAN) {
                this.currentToken = null;
                this.advance();
                const args = this.FnArgs();
                factor = { type: NodeType.NT_FACTOR, facrorType: 'func_call', value: id, nodes: args }

                if (this.currentToken.type === TokenType.TT_R_PARAN) {
                    this.advance();
                } else {
                    console.log('Invalid syntax: No closing paran.');
                }
            } else {
                factor = { type: NodeType.NT_FACTOR, facrorType: 'ID', value: id };
            }
        } else if (this.currentToken.type === TokenType.TT_L_PARAN) {
            this.currentToken = null // Added to hide typeScript warring...
            this.advance()
            let expr = this.assignment();
            if (this.currentToken.type === TokenType.TT_R_PARAN) {
                this.advance();
            } else {
                console.log('Invalid syntax: No closing paran.');
            }
            factor = { type: NodeType.NT_FACTOR, facrorType: 'paran', nodes: expr };
        }

        return factor;
    }


    private FnArgs(): Node {
        const args: Node = { type: NodeType.NT_FN_ARGS, nodes: [] };
        if (this.currentToken.type === TokenType.TT_R_PARAN) {
            return args;
        }

        (args.nodes as Node[]).push(this.assignment());

        while (this.currentToken.type === TokenType.TT_COMMA) {
            this.advance();
            (args.nodes as Node[]).push(this.assignment());
        }


        return args;
    }

}