import * as ast from "../ast.ts";
import {Token, Kind} from "../token.ts";
import { Parser } from "../parser.ts";

import { parseExpression, parseExprL2 } from "./exprparser.ts";

export function parseAssignment(parser: Parser, identifier: ast.Identifier, vartype: ast.TypeNode): ast.Assignment {
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

export function parseDerefAssignment(parser: Parser): ast.DerefAssignment {
    const star = parser.buf.expect(Kind.MULT);
    const target = parseExprL2(parser);

    const operators: Kind[] = [Kind.PLUS, Kind.MINUS, Kind.MULT, Kind.DIV];
    let op: undefined | Token;
    if(operators.includes(parser.buf.current.kind)) {
        op = parser.buf.current;
        parser.buf.next();
    }
    
    parser.buf.expect(Kind.EQUAL);
    let expr: ast.Expression = parseExpression(parser);
    if(op != undefined) {
        expr = new ast.BinaryOp(target, op, expr);
    }
    parser.buf.expect(Kind.SEMICOLON);
    return new ast.DerefAssignment(star, target, expr);
}