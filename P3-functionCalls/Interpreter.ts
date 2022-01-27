import {
    BaseNode, BiNode, ExprNode,
    FactorNode, FnArgsNode, NodeType,
    StatementNode, TermNode
} from './parser.js'


export type built_in_func = (...arg) => any

export interface BuiltInFunc {
    name: string,
    func: built_in_func
}

class Context {

    private variables: Record<string, number> = {}
    private built_in_functions: Record<string, BuiltInFunc> = {}

    constructor() {

    }

    //--------------- FUNCTIONS ------------------//

    public addBuiltInFunctions(funcs: BuiltInFunc[]) {
        funcs.forEach((func) => {
            this.built_in_functions[func.name] = func
        })
    }

    public callFunc(name: string, args: any[]) {
        if (name in this.built_in_functions) {
            return this.built_in_functions[name].func(...args);
        }
        throw new Error(`Function "${name}" is not defined in this context.`);
    }


    //--------------- VARIABLES ------------------//

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

    public addBuiltInFunctions(funcs: BuiltInFunc[]) {
        this.context.addBuiltInFunctions(funcs)
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
            case NodeType.NT_FN_ARGS:
                return this.visit_fn_args(node as FnArgsNode)
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
            case 'func_call':
                const args_res = this.visit(node.node)
                return this.context.callFunc(node.value as string, args_res)
        }

    }



    private visit_fn_args(node: FnArgsNode) {
        const res = []

        node.nodes.forEach((val) => {
            res.push(this.visit(val))
        })

        return res;
    }

}