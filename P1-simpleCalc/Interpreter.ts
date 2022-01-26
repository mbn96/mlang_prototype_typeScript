import { BaseNode, BiNode, ExprNode, FactorNode, NodeType, TermNode } from './parser.js'


export class Interpreter {

    private _ast: ExprNode;

    public set ast(value: ExprNode) {
        this._ast = value;
    }



    constructor(ast: ExprNode) {
        this.ast = ast;
    }


    public Solve(): number {
        return this.visit(this._ast);
    }

    private visit(node: BaseNode): number {
        switch (node.type) {
            case NodeType.NT_EXPR:
                return this.visit_expr(node as ExprNode);
            case NodeType.NT_TERM:
                return this.visit_term(node as TermNode);
            case NodeType.NT_FACTOR:
                return this.visit_factor(node as FactorNode);
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
                return node.value;
            case 'minusSign':
                return -this.visit(node.node);
            case 'paran':
                return this.visit(node.node);
        }

    }
}