import { ErrorContext } from "../errors.ts";
import * as ast from "../ast.ts";
import { NoType, Prim, Type } from "../type.ts";
import { Scopes } from "./scope.ts";
import { checkCondition, checkExpr } from "./exprchecker.ts";

export class TypeChecker {
    constructor(public err: ErrorContext) {}

    types = new Map<ast.AstNode, Type>();
    scopes = new Scopes();

    popScope() {
        if (!this.scopes.pop()){
            this.err.throw_msg("Poped last scope");
        }
    }

    check(tree: ast.Statement[]) {
        for (const node of tree) {
            checkStatement(this, node);
        }
    }
    type(tree: ast.AstNode) {
        return this.types.get(tree);
    }

    set(tree: ast.AstNode, type: Type): Type {
        this.types.set(tree, type);
        return type;
    }
    expect(tree: ast.AstNode, ...types: Type[]): Type {
        const type = this.type(tree);
        if (type === undefined) {
            console.log("no type", tree);
            this.err.warn(tree.start, `Missing type on node ${tree}`);
            return this.set(tree, NoType);
        }
        for (const expect of types) {
            if (type.eq(expect)) {
                return type;
            }
        }
        return this.set(tree, NoType);

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
    }
}


function checkBody(checker: TypeChecker, tree: ast.Body) {
    checker.scopes.push();
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

function checkAssignment(checker: TypeChecker, tree: ast.Assignment) {
    checkExpr(checker, tree.expr);
}
function checkDeclaration(checker: TypeChecker, tree: ast.Declaration) {
    checker.scopes.put(tree.name.token.value, Prim.UINT);

    if (tree.expr) {
        checkExpr(checker, tree.expr);
    }
}
function checkMacroDeclaration(checker: TypeChecker, tree: ast.MacroDeclaration) {

}
function checkMacroCall(checker: TypeChecker, tree: ast.MacroCall) {

}