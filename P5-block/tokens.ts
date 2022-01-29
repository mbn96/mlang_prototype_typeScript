

export enum TokenType {
    TT_PLUS,
    TT_MINUS,
    TT_MULTY,
    TT_DIV,
    TT_L_PARAN,
    TT_R_PARAN,
    TT_INT,
    TT_FLOAT,
    TT_ASSIGN,
    TT_COMMA,
    TT_EQ,
    TT_NOT_EQ,
    TT_LOGICAL_NOT,
    TT_LOGIC_AND,
    TT_LOGIC_OR,
    TT_LESS,
    TT_GREATER,
    TT_KEYWORD,
    TT_IDENTIFIER,
    TT_ILLIGAL,
    TT_EOF
}

export enum KeywordType {
    KW_VAR = 'KW_VAR',
    KW_IF = 'KW_IF'
}

export interface Token {
    type: TokenType,
    value?: any,
    keword?: KeywordType
}


export const Keywords = {
    var: KeywordType.KW_VAR,
    if: KeywordType.KW_IF
}