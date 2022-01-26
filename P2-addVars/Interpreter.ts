import {
    BaseNode, BiNode, ExprNode,
    FactorNode, NodeType,
    StatementNode, TermNode
} from './parser.js'


class Context {

    private variables: Record<string, number> = {}

    constructor() {

    }

    public addVar(name: string, value: number) {
        if (name in this.variables) {
            throw new Error(`Variable ${name} is already decleared in this context.`);
        }
        this.variables[name] = value
    }

    public getVar(name: string): number {
        if (name in this.variables) {
            return this.variables[name]
        }
        throw new Error(`Variable ${name} is not defined in this context.`);
    }

    public setVar(name: string, value: number) {
        if (name in this.variables) {
            this.variables[name] = value
        } else {
            throw new Error(`Variable ${name} is not defined in this context.`);
        }
    }
}

export class Interpreter {

    private _ast: StatementNode;
    private context: Context = new Context();

    public set ast(value: StatementNode) {
        this._ast = value;
        // this.context = new Context();
    }



    constructor(ast: StatementNode) {
        this.ast = ast;
    }


    public Solve(): number {
        return this.visit(this._ast);
    }

    private visit(node: BaseNode): number | any {
        switch (node.type) {
            case NodeType.NT_STATE:
                return this.visit_statement(node as StatementNode);
            case NodeType.NT_EXPR:
                return this.visit_expr(node as ExprNode);
            case NodeType.NT_TERM:
                return this.visit_term(node as TermNode);
            case NodeType.NT_FACTOR:
                return this.visit_factor(node as FactorNode);
        }
    }

    private visit_statement(node: StatementNode) {
        switch (node.statementType) {
            case 'expr':
                return this.visit(node.expr);
            case 'declear': {
                const val = this.visit(node.expr);
                this.context.addVar(node.identifier, val)
                return val;
            }
        }
    }

    private visit_expr(node: ExprNode): number {

        switch (node.exprType) {
            case 'term':
                return this.visit(node.nodes as BaseNode);
            case 'plus': {
                let nodes = node.nodes as BiNode
                return this.visit(nodes.left) + this.visit(nodes.right);
            }
            case 'minus': {
                let nodes = node.nodes as BiNode
                return this.visit(nodes.left) - this.visit(nodes.right);
            }
            case 'assign': {
                const val = this.visit(node.expr);
                this.context.setVar(node.identifier, val)
                return val;
            }
        }

    }

    private visit_term(node: TermNode): number {

        switch (node.termType) {
            case 'factor':
                return this.visit(node.nodes as BaseNode);
            case 'multi': {
                let nodes = node.nodes as BiNode
                return this.visit(nodes.left) * this.visit(nodes.right);
            }
            case 'div': {
                let nodes = node.nodes as BiNode
                return this.visit(nodes.left) / this.visit(nodes.right);
            }
        }

    }

    private visit_factor(node: FactorNode): number {

        switch (node.facrorType) {
            case 'number':
                return node.value as number;
            case 'minusSign':
                return -this.visit(node.node);
            case 'paran':
                return this.visit(node.node);
            case 'ID':
                return this.context.getVar(node.value as string)
        }

    }
}