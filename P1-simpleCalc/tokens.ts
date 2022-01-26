

export enum TokenType {
    TT_PLUS,
    TT_MINUS,
    TT_MULTY,
    TT_DIV,
    TT_L_PARAN,
    TT_R_PARAN,
    TT_INT,
    TT_FLOAT,
    TT_EOF
}

export interface Token {
    type: TokenType,
    value?: any
}