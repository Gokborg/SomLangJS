import * as ast from "../ast.ts";
import { Kind } from "../token.ts";
import { ArrayType, NoType, Pointer, Prim, Type } from "../type.ts";
import { TypeChecker } from "./typechecker.ts";
import { Variable } from "./variable.ts";

export function checkCondition(checker: TypeChecker, node: ast.Expression): void {
    checkExpr(checker, node)
    checker.expect(node, Prim.BOOL);
}

export function checkExpr(checker: TypeChecker, node: ast.Expression): Type {
    if (node instanceof ast.BinaryOp) {
        return checkBinaryOp(checker, node);
    } else if (node instanceof ast.Number) {
        const number = Number(node.token.value);
        if (!Number.isInteger(number)) {
            checker.err.error(node.token, "Not an integer");
        }
        checker.constants.set(node, number);
        return checker.set(node, Prim.UINT);
    } else if (node instanceof ast.Identifier) {
        const variable = checker.scopes.get(node.token.value);
        if (!variable) {
            checker.err.error(node.token, `Variable is undefined`);
            return checker.set(node, NoType);
        }
        checker.variables.set(node, variable);
        return checker.set(node, variable.type);
    } else if (node instanceof ast.ArrayLiteral) {
        return checkArrayLiteral(checker, node);
    } else if (node instanceof ast.ArrayAccess) {
        return checkArrayAccess(checker, node);
    } else if (node instanceof ast.Reference) {
        return checkReference(checker, node);
    }
    return NoType;
}

function checkArrayLiteral(checker: TypeChecker, node: ast.ArrayLiteral): Type {
    // fixme: infer the type depending on context
    const type = node.items.length == 0 ? NoType : checkExpr(checker, node.items[0]);
    for (let i = 1; i < node.items.length; i++) {
        const other = checkExpr(checker, node.items[i]);
        if (type && other !== type) {
            checker.err.error(node.items[i].start, "Types should match within an array");
        }
    }
    if (!type) {
        return checker.set(node, NoType);
    }
    return checker.set(node, new ArrayType(type, node.items.length));
}

function checkArrayAccess(checker: TypeChecker, node: ast.ArrayAccess): Type {
    const array = checkExpr(checker, node.array);
    if (!(array instanceof ArrayType)) {
        checker.err.error(node.array.start, "Value is not indexable");
    }
    const index = checkExpr(checker, node.index);
    if (!index.eq(Prim.UINT)) {
        checker.err.error(node.index.start, `Index should be a ${Prim.UINT} but is ${index}`);
    }
    if (array instanceof ArrayType) {
        return checker.set(node, array.iner);
    }
    return checker.set(node, NoType);
}

function checkReference(checker: TypeChecker, node: ast.Reference): Type {
    checkExpr(checker, node.iner);
    const variable = checker.variables.get(node.iner);
    if (!variable) {
        checker.err.error(node.iner.start, `Expected variable`);
        return NoType;
    }
    return checker.set(node, new Pointer(variable.type));
}

function checkBinaryOp(checker: TypeChecker, node: ast.BinaryOp): Type {
    const left = checkExpr(checker, node.expr1);
    const right = checkExpr(checker, node.expr2);
    if (left === NoType || right === NoType) {
        console.log(">>>>", checker.type(node.expr1), left, node.expr2, right);
        return checker.set(node, NoType);
    }
    if (left !== right) {
        checker.err.error(node.op, `Type ${left} and ${right} do not match`);
        return checker.set(node, NoType);
    }

    switch (node.op.kind) {
        case Kind.COND_E: case Kind.COND_NE:
        case Kind.COND_GE: case Kind.COND_G:
        case Kind.COND_LE: case Kind.COND_L: {
            console.log("node", node);
            checker.expect(node.expr1, Prim.UINT, Prim.CHAR);
            checker.expect(node.expr2, Prim.UINT, Prim.CHAR);
            return checker.set(node, Prim.BOOL);
        }

        default: return checker.set(node, left);
    }
}