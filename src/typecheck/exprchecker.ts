import * as ast from "../ast.ts";
import { Kind } from "../token.ts";
import { ArrayType, Prim, Type } from "../type.ts";
import { TypeChecker } from "./typechecker.ts";

export function checkExpr(checker: TypeChecker, node: ast.Expression): void | Type {
    if (node instanceof ast.BinaryOp) {
        checkBinaryOp(checker, node);
    } else if (node instanceof ast.Number) {
        return Prim.UINT;
    } else if (node instanceof ast.Identifier) {
        const variable = checker.scopes.get(node.token.value);
        console.log(checker.scopes);
        if (!variable) {
            checker.err.error(node.token, `Variable is undefined`);
            return undefined;
        }
        return variable.type;
    } else if (node instanceof ast.ArrayLiteral) {
        // fixme: infer the type depending on context
        if (node.items.length == 0) {
            checker.err.error(node.start, "Empty array");
            return;
        }
        const type = checkExpr(checker, node.items[0]);
        for (let i = 1; i < node.items.length; i++) {
            const other = checkExpr(checker, node.items[i]);
            if (type && other !== type) {
                checker.err.error(node.items[i].start, "Types should match within an array");
            }
        }
        if (!type) {
            return;
        }
        return new ArrayType(type);
    } else if (node instanceof ast.ArrayAccess) {
        const array = checkExpr(checker, node.array);
        if (!(array instanceof ArrayType)) {
            checker.err.error(node.array.start, "Value is not indexable");
        }
        const index = checkExpr(checker, node.index);
        if (index === Prim.UINT) {
            checker.err.error(node.index.start, "Index should be a uint");
        }
        if (array instanceof ArrayType) {
            return array.iner;
        }
    }
}


function checkBinaryOp(checker: TypeChecker, node: ast.BinaryOp): void | Type {
    const left = checkExpr(checker, node.expr1);
    const right = checkExpr(checker, node.expr2);
    if (left === undefined || right === undefined) {
        return;
    }
    if (left !== right) {
        checker.err.error(node.op, "Type of left and right-hand side do not match");
        return;
    }

    switch (node.op.kind) {
        case Kind.COND_E: case Kind.COND_NE:
        case Kind.COND_GE: case Kind.COND_G:
        case Kind.COND_LE: case Kind.COND_L: return Prim.Bool;

        default: return left;
    }
}