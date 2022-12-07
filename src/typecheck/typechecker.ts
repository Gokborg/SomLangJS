import { ErrorContext } from "../errors.ts";
import * as ast from "../ast.ts";
import { ArrayType, FunctionPointer, NoType, Pointer, Prim, Type } from "../type.ts";
import { Scopes } from "./scope.ts";
import { checkCondition, checkExpr } from "./exprchecker.ts";
import { Constant } from "./constant.ts";
import { Variable } from "./variable.ts";

export class TypeChecker {
    types = new Map<ast.AstNode, Type>();
    constants = new Map<ast.AstNode, Constant>();
    variables = new Map<ast.AstNode, Variable>();
    // TODO: check if a function is actually returned from
    returns = new Set<ast.AstNode>();
    scopes = new Scopes();

    constructor(public err: ErrorContext) {
        this.scopes.put_type("uint", Prim.UINT);
        this.scopes.put_type("bool", Prim.BOOL);
        this.scopes.put_type("char", Prim.CHAR);
        this.scopes.put_type("void", Prim.VOID);
    }


    popScope() {
        if (!this.scopes.pop()){
            this.err.throw_msg("Poped last scope");
        }
    }

    check(tree: ast.Statement[]) {
        for (const statement of tree) {
            collectStatementSymbol(this, statement);
        }
        for (const node of tree) {
            checkStatement(this, node);
        }
    }
    type(tree: ast.AstNode) {
        const type = this.types.get(tree);
        if (type === undefined) {
            this.err.warn(tree.start, `Missing type on node ${tree}`);
            return this.set(tree, NoType);
        }
        return type;
    }

    set(tree: ast.AstNode, type: Type): Type {
        this.types.set(tree, type);
        return type;
    }
    expect(tree: ast.AstNode, ...types: Type[]): Type {
        const type = this.type(tree);
        for (const expect of types) {
            if (type.eq(expect)) {
                return type;
            }
        }
        if (type !== NoType) {
            this.err.error(tree.start, `Expected Type ${types} but got ${type}`)
        }
        return this.set(tree, NoType);
    }


    toString() {
        let output = "Types:\n";
        for (const [key, value] of this.types) {
            output += `${value}: ${key}\n`;
        }
        output += "\nConstants:\n"
        for (const [key, value] of this.constants) {
            output += `${value}: ${key}\n`;
        }
        output += "\nVariables:\n"
        for (const [key, value] of this.variables) {
            output += `${value.type}: ${key}\n`;
        }

        output += "\nScopes:\n";
        output += this.scopes.toString();

        return output;
    }
}

function collectStatementSymbol(checker: TypeChecker, node: ast.Statement) {
    if (node instanceof ast.FunctionDeclaration) {
        const ret = checkTypeNode(checker, node.type);
        const args: Type[] = node.args.map(
            arg => checkTypeNode(checker, arg.type) 
        );
        const pointerType = new FunctionPointer(ret, args);

        const variable = checker.scopes.put(node.name.token.value, pointerType, node);
        checker.variables.set(node, variable);
    }
}

function checkStatement(checker: TypeChecker, node: ast.Statement) {
    if (node instanceof ast.Body) {
        checkBody(checker, node);
    } else if (node instanceof ast.IfStatement) {
        checkIf(checker, node);
    } else if (node instanceof ast.WhileStatement) {
        checkWhile(checker, node);
    } else if (node instanceof ast.Assignment) {
        checkAssignment(checker, node);
    } else if (node instanceof ast.Declaration) {
        checkDeclaration(checker, node);
    } else if (node instanceof ast.MacroDeclaration) {
        checkMacroDeclaration(checker, node);
    } else if (node instanceof ast.MacroCall) {
        checkMacroCall(checker, node);
    } else if (node instanceof ast.DerefAssignment) {
        checkDerefAssignment(checker, node);
    } else if (node instanceof ast.FunctionDeclaration) {
        const func = checker.variables.get(node);
        if (func === undefined) {
            checker.err.error(node.start, `Missing variable on ${node}`);
            return;
        }
        checker.scopes.push(func);
        for (const arg of node.args) {
            checker.scopes.put(arg.name.token.value, checker.type(arg.type), arg);
        }
        checkBody(checker, node.body);
        checker.scopes.pop();
    } else if (node instanceof ast.ReturnStatement) {
        checkExpr(checker, node.expr);
        const func = checker.scopes.func;
        if (!(func?.type instanceof FunctionPointer)) {
            checker.err.error(node.start, "Can't return outside of a function");
            return
        }
        checker.expect(node.expr, func.type.ret);
    } else if (node instanceof ast.ExpressionStatement) {
        const type = checkExpr(checker, node.expr);
        if (!type.par_eq(Prim.VOID)) {
            checker.err.warn(node.expr.start, "Expression result ignored");
        }
    }
}


function checkBody(checker: TypeChecker, tree: ast.Body) {
    checker.scopes.push();
    for (const statement of tree.content) {
        collectStatementSymbol(checker, statement);
    }
    for (const statement of tree.content) {
        checkStatement(checker, statement);
    }
    checker.popScope();
}

function checkIf(checker: TypeChecker, tree: ast.IfStatement) {
    checkCondition(checker, tree.condition);
    checkBody(checker, tree.body);
    if (tree.child) {
        checkStatement(checker, tree.child);
    }
}
function checkWhile(checker: TypeChecker, tree: ast.WhileStatement) {
    checkCondition(checker, tree.condition);
    checkStatement(checker, tree.body);
}

function checkTarget(checker: TypeChecker, tree: ast.TypeNode, type: Type): Type {
    if (tree instanceof ast.VarArray) {
        if (type instanceof ArrayType) {
            return checkTarget(checker, tree.iner, type.iner);
        } else {
            checker.err.error(tree.start, "Expected array");
            return NoType;
        }
    } else if (tree instanceof ast.VarType) {
        return type;
    } else if (tree instanceof ast.VarPointer) {
        checker.err.error(tree.start, "Syntax error");
        return NoType;
    }
    const a: never = tree;
    return NoType;
}

function checkAssignment(checker: TypeChecker, tree: ast.Assignment) {
    const type = checkTarget(checker, tree.vartype, checkExpr(checker, tree.name));
    checkExpr(checker, tree.expr)
    checker.expect(tree.expr, type);
}

function checkDerefAssignment(checker: TypeChecker, tree: ast.DerefAssignment) {
    let type = checkExpr(checker, tree.target);
    if (!(type instanceof Pointer)) {
        checker.err.error(tree.target.start, `Expected pointer type but got ${type}`);
        type = NoType;
    } else {
        type = type.iner;
    }
    checkExpr(checker, tree.expr)
    checker.expect(tree.expr, type);
}

function checkTypeNode(checker: TypeChecker, tree: ast.TypeNode): Type {
    return checker.set(tree, checkTypeNodeR(checker, tree));
}

function checkTypeNodeR(checker: TypeChecker, tree: ast.TypeNode): Type {
    if (tree instanceof ast.VarType) {
        const type = checker.scopes.get_type(tree.token.value);
        if (type === undefined) {
            checker.err.error(tree.token, "Type is not defined");
            return NoType;
        }
        return type;
    } else if (tree instanceof ast.VarArray) {
        const iner = checkTypeNodeR(checker, tree.iner);
        if (tree.size) {
            const sizeType = checkExpr(checker, tree.size);
            const size = checker.constants.get(tree.size);
            if (size === undefined) {
                checker.err.error(tree.size.start, "Not a constant");
                return new ArrayType(iner);
            }
            return new ArrayType(iner, size);
        } else {
            return new ArrayType(iner);
        }
    } else if (tree instanceof ast.VarPointer) {
        const iner = checkTypeNodeR(checker, tree.iner);
        return new Pointer(iner);
    }
    const a: never = tree;
    return NoType;
}

function checkDeclaration(checker: TypeChecker, tree: ast.Declaration) {
    let type = checkTypeNode(checker, tree.vartype);
    expr:
    if (tree.expr) {
        const expr = checkExpr(checker, tree.expr);
        if (type.par_eq(expr)) {
            type = expr;
        } else if (expr !== NoType) {
            checker.err.error(tree.expr.start, `Expected Type ${type} but got ${expr}`)
        }
    }
    const old = checker.scopes.get_top(tree.name.token.value);
    if (old) {
        checker.err.error(tree.name.token, "Redefined variable");
    } else {
        checker.scopes.put(tree.name.token.value, type, tree.name);
    }
    checker.set(tree.name, type);
}
function checkMacroDeclaration(checker: TypeChecker, tree: ast.MacroDeclaration) {

}
function checkMacroCall(checker: TypeChecker, tree: ast.MacroCall) {

}