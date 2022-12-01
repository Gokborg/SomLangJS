import { ErrorContext } from "../errors.ts";
import * as ast from "../ast.ts";
import { Type } from "../type.ts";
import { Scopes } from "./scope.ts";

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
    tree.condition
}
function checkWhile(checker: TypeChecker, tree: ast.WhileStatement) {

}

function checkAssignment(checker: TypeChecker, tree: ast.Assignment) {
    
}
function checkDeclaration(checker: TypeChecker, tree: ast.Declaration) {

}
function checkMacroDeclaration(checker: TypeChecker, tree: ast.MacroDeclaration) {

}
function checkMacroCall(checker: TypeChecker, tree: ast.MacroCall) {

}