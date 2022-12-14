import * as ast from "../ast.ts";
import { Kind } from "../token.ts";
import { ArrayType, FunctionPointer, NoType, Pointer, Prim, Type } from "../type.ts";
import { TypeChecker } from "./typechecker.ts";
import { Variable } from "./variable.ts";

export function checkCondition(checker: TypeChecker, node: ast.Expression): void {
    checkExpr(checker, node)
    // checker.expect(node, Prim.BOOL);
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
        variable.references.push(node);
        checker.variables.set(node.token, variable);
        return checker.set(node, variable.type);
    } else if (node instanceof ast.ArrayLiteral) {
        return checkArrayLiteral(checker, node);
    } else if (node instanceof ast.ArrayAccess) {
        return checkArrayAccess(checker, node);
    } else if (node instanceof ast.Reference) {
        return checkReference(checker, node);
    } else if (node instanceof ast.Dereference) {
        return checkDereference(checker, node);
    } else if (node instanceof ast.FunctionCall) {
        const type = checkExpr(checker, node.func);
        for (const arg of node.args){
            checkExpr(checker, arg);
        }
        if (!(type instanceof FunctionPointer)) {
            if (type !== Prim.NoType) {
                checker.err.error(node.func.start, `Expected function type but got ${type}`);
            }
            return checker.set(node, NoType);
        } else {
            for (let i = 0; i < Math.min(node.args.length, type.args.length); i++) {
                checker.expect(node.args[i], type.args[i]);
            }
            if (node.args.length !== type.args.length) {
                checker.err.error(node.start, `Expected ${type.args.length} arguments but got ${node.args.length}`);
            }
        }
        return checker.set(node, type.ret);
    }
    const a: never = node;
    return NoType;
}

function checkArrayLiteral(checker: TypeChecker, node: ast.ArrayLiteral): Type {
    // fixme: infer the type depending on context
    const type = node.items.length == 0 ? NoType : checkExpr(checker, node.items[0]);
    for (let i = 1; i < node.items.length; i++) {
        const other = checkExpr(checker, node.items[i]);
        if (type !== NoType && !other.eq(type)) {
            checker.err.error(node.items[i].start, `Expected type ${type} but got ${other}, Types should match within an array`);
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

// FIXME: references should be checked differently
function checkReference(checker: TypeChecker, node: ast.Reference): Type {
    checkExpr(checker, node.iner);
    const variable = checker.variables.get(node.iner.start);
    if (!variable) {
        checker.err.error(node.iner.start, `Expected variable`);
        return NoType;
    }
    return checker.set(node, new Pointer(variable.type));
}

function checkDereference(checker: TypeChecker, node: ast.Dereference): Type {
    const type = checkExpr(checker, node.iner);
    if (!(type instanceof Pointer)) {
        if (type !== NoType) {
            checker.err.error(node.iner.start, `Expected pointer type but got ${type}`);
        }
        return checker.set(node, NoType);
    }

    return type.iner;
}

function checkBinaryOp(checker: TypeChecker, node: ast.BinaryOp): Type {
    const left = checkExpr(checker, node.expr1);
    const right = checkExpr(checker, node.expr2);
    if (left === NoType || right === NoType) {
        return checker.set(node, NoType);
    }
    // allow for pointer arithmetic
    if ((node.op.kind === Kind.PLUS || node.op.kind === Kind.MINUS) && left instanceof Pointer) {
        checker.expect(node.expr2, Prim.UINT);
        return checker.set(node, left);
    }

    if (left !== right) {
        checker.err.error(node.op, `Type ${left} and ${right} do not match`);
        return checker.set(node, NoType);
    }

    const c1 = checker.constants.get(node.expr1), c2 = checker.constants.get(node.expr2);
    if (node.op.kind === Kind.DIV && c2 === 0) {
        checker.err.error(node.op, "Division by 0");
    }
    if (c1 !== undefined && c2 !== undefined) {
        switch (node.op.kind) {
            case Kind.PLUS: checker.constants.set(node, c1 + c2); break;
            case Kind.MINUS: checker.constants.set(node, c1 - c2); break;
            case Kind.MULT: checker.constants.set(node, c1 * c2); break;
            case Kind.DIV: if (c2 !== 0) {
                checker.constants.set(node, Math.floor(c1 / c2));
            } break;
        }
    }

    switch (node.op.kind) {
        case Kind.COND_E: case Kind.COND_NE:
        case Kind.COND_GE: case Kind.COND_G:
        case Kind.COND_LE: case Kind.COND_L: {
            checker.expect(node.expr1, Prim.UINT, Prim.CHAR);
            checker.expect(node.expr2, Prim.UINT, Prim.CHAR);
            return checker.set(node, Prim.BOOL);
        }

        default: return checker.set(node, left);
    }
}