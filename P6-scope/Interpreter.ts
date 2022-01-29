import {
    Node, BiNode, NodeType
} from './parser.js'


export type built_in_func = (...arg) => any

export interface BuiltInFunc {
    name: string,
    func: built_in_func
}

class Context {

    private variables: Record<string, number> = {}
    private built_in_functions: Record<string, BuiltInFunc> = {}
    private parent: Context;

    constructor(parent: Context) {
        this.parent = parent;
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
        } else if (this.parent) {
            return this.parent.callFunc(name, args)
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
        } else if (this.parent) {
            return this.parent.getVar(name);
        }
        throw new Error(`Variable ${name} is not defined in this context.`);
    }

    public setVar(name: string, value: number) {
        if (name in this.variables) {
            this.variables[name] = value
        }
        else if (this.parent) {
            this.parent.setVar(name, value);
        }
        else {
            throw new Error(`Variable ${name} is not defined in this context.`);
        }
    }
}

export class Interpreter {

    private _ast: Node;
    private context: Context = new Context(null);

    public set ast(value: Node) {
        this._ast = value;
        // this.context = new Context();
    }



    constructor(ast: Node) {
        this.ast = ast;
    }

    public addBuiltInFunctions(funcs: BuiltInFunc[]) {
        this.context.addBuiltInFunctions(funcs)
    }


    public Solve(): number {
        return this.visit(this._ast, this.context);
    }

    private visit(node: Node, context: Context): number | any {
        switch (node.type) {
            case NodeType.NT_BLOCK:
                return this.visit_block(node, context)
            case NodeType.NT_STATE:
                return this.visit_statement(node, context);
            case NodeType.NT_ASSIGN:
                return this.visit_assignment(node, context);
            case NodeType.NT_LOGICAL:
                return this.visit_logical(node, context);
            case NodeType.NT_COMPR:
                return this.visit_compr(node, context);
            case NodeType.NT_EXPR:
                return this.visit_expr(node, context);
            case NodeType.NT_TERM:
                return this.visit_term(node, context);
            case NodeType.NT_FACTOR:
                return this.visit_factor(node, context);
            case NodeType.NT_FN_ARGS:
                return this.visit_fn_args(node, context)
        }
    }



    private visit_block(node: Node, context: Context) {
        const m_context: Context = new Context(context);

        (node.nodes as Node[]).forEach((child_node) => {
            this.visit(child_node, m_context)
        })

    }


    private visit_statement(node: Node, context: Context) {
        switch (node.statementType) {
            case 'expr':
                return this.visit(node.nodes as Node, context);
            case 'declear': {
                const val = this.visit(node.nodes as Node, context);
                this.context.addVar(node.identifier, val)
                return val;
            }
        }
    }

    private visit_assignment(node: Node, context: Context): any {

        switch (node.assignmentType) {
            case 'assign': {
                const val = this.visit(node.nodes as Node, context);
                this.context.setVar(node.identifier, val)
                return val;
            }
            case 'logical':
                return this.visit(node.nodes as Node, context)
        }


    }


    private visit_logical(node: Node, context: Context): any {
        let result: boolean
        switch (node.logicalType) {
            case 'NOT': {
                const res = this.visit(node.nodes as Node, context)
                result = !res;
            } break;

            case 'AND': {
                let nodes = node.nodes as BiNode
                result = this.visit(nodes.left, context) && this.visit(nodes.right, context);
            } break;

            case 'OR': {
                let nodes = node.nodes as BiNode
                result = this.visit(nodes.left, context) || this.visit(nodes.right, context);
            } break;

            case 'compr': {
                return this.visit(node.nodes as Node, context)
            }

        }

        // return !!result; // to turn it into boolean (1, 0)
        return Boolean(result);
    }


    private visit_compr(node: Node, context: Context): any {
        let result: boolean;
        switch (node.compr_type) {

            case 'expr': {
                return this.visit(node.nodes as Node, context);
            }


            case 'equal': {
                let nodes = node.nodes as BiNode
                result = this.visit(nodes.left, context) === this.visit(nodes.right, context);
            } break;

            case 'not_equal': {
                let nodes = node.nodes as BiNode
                result = this.visit(nodes.left, context) !== this.visit(nodes.right, context);
            } break;

            case 'less_than': {
                let nodes = node.nodes as BiNode
                result = this.visit(nodes.left, context) < this.visit(nodes.right, context);
            } break;

            case 'greater_than': {
                let nodes = node.nodes as BiNode
                result = this.visit(nodes.left, context) > this.visit(nodes.right, context);
            } break;
        }

        return Boolean(result)
    }


    private visit_expr(node: Node, context: Context): number {

        switch (node.exprType) {
            case 'term':
                return this.visit(node.nodes as Node, context);
            case 'plus': {
                let nodes = node.nodes as BiNode
                return this.visit(nodes.left, context) + this.visit(nodes.right, context);
            }
            case 'minus': {
                let nodes = node.nodes as BiNode
                return this.visit(nodes.left, context) - this.visit(nodes.right, context);
            }
        }

    }

    private visit_term(node: Node, context: Context): number {

        switch (node.termType) {
            case 'factor':
                return this.visit(node.nodes as Node, context);
            case 'multi': {
                let nodes = node.nodes as BiNode
                return this.visit(nodes.left, context) * this.visit(nodes.right, context);
            }
            case 'div': {
                let nodes = node.nodes as BiNode
                return this.visit(nodes.left, context) / this.visit(nodes.right, context);
            }
        }

    }

    private visit_factor(node: Node, context: Context): number {

        switch (node.facrorType) {
            case 'number':
                return node.value as number;
            case 'minusSign':
                return -this.visit(node.nodes as Node, context);
            case 'paran':
                return this.visit(node.nodes as Node, context);
            case 'ID':
                return context.getVar(node.value as string)
            case 'func_call':
                const args_res = this.visit(node.nodes as Node, context)
                return context.callFunc(node.value as string, args_res)
        }

    }



    private visit_fn_args(node: Node, context: Context) {
        const res = [];

        (node.nodes as Node[]).forEach((val) => {
            res.push(this.visit(val, context))
        })

        return res;
    }

}