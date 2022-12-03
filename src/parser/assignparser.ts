import * as ast from "../ast.ts";
import {Token, Kind} from "../token.ts";
import { Parser } from "../parser.ts";

import { parseExpression } from "./exprparser.ts";

export function parseAssignment(parser: Parser, identifier: ast.Identifier, vartype: ast.TypeNode) {
    const operators: Kind[] = [Kind.PLUS, Kind.MINUS, Kind.MULT, Kind.DIV];
    let op: undefined | Token;
    if(operators.includes(parser.buf.current.kind)) {
        op = parser.buf.current;
        parser.buf.next();
    }
    parser.buf.expect(Kind.EQUAL);
    let expr: ast.Expression = parseExpression(parser);
    if(op != undefined) {
        expr = new ast.BinaryOp(identifier, op, expr);
    }
    parser.buf.expect(Kind.SEMICOLON);
    return new ast.Assignment(vartype, identifier, expr);
}