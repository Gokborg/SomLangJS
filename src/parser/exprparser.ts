import * as ast from "../ast.ts";
import { Kind, Token } from "../token.ts";
import { Parser } from "../parser.ts";
import { parseList } from "./listparser.ts";
import { parseArguments } from "./argsparser.ts";

export function parseExpression(parser: Parser) {
    return genericParseBinOp(
        parser,
        parseExprL4, 
        [Kind.COND_E, Kind.COND_GE, Kind.COND_LE, Kind.COND_G, Kind.COND_L]
    );
}

function genericParseBinOp(parser: Parser, func: (parser: Parser) => ast.Expression, kinds: Kind[]): ast.Expression {
    let expr1 = func(parser);
    //xd shoudl work i think
    while (kinds.includes(parser.buf.current.kind)) {
        let op: Token = parser.buf.current;
        parser.buf.next();
        let expr2 = func(parser);
        expr1 = new ast.BinaryOp(expr1, op, expr2);
    }
    return expr1;
}

function parseExprL4(parser: Parser) : ast.Expression {
    return genericParseBinOp(
        parser,
        parseExprL3,
        [Kind.PLUS, Kind.MINUS]
    );
}

function parseExprL3(parser: Parser) : ast.Expression {
    return genericParseBinOp(
        parser,
        parseExpr2,
        [Kind.MULT, Kind.DIV]
    );
}

function parseExpr2(parser: Parser): ast.Expression {
    let iner = parseExprL1(parser);
    while (true) {
        if (parser.buf.next_if(Kind.OPEN_SQUARE)) {
            const expr: ast.Expression = parseExpression(parser); 
            parser.buf.expect(Kind.CLOSE_SQUARE);
            iner = new ast.ArrayAccess(iner, expr);
            continue;
        }
        if (parser.buf.current.eq(Kind.OPEN_PARAN)) {
            const args = parseArguments(parser);
            iner = new ast.FunctionCall(iner, args);
            continue;
        }
        break;
    }
    return iner;
}

function parseExprL1(parser: Parser) : ast.Expression {
    const current: Token = parser.buf.current;
    switch(current.kind) {
        case Kind.AND: {
            parser.buf.next();
            return new ast.Reference(current, parseExpression(parser));
        }
        case Kind.MULT: {
            parser.buf.next();
            return new ast.Dereference(current, parseExpression(parser));
        }
        case Kind.NUMBER: {
            parser.buf.next();
            return new ast.Number(current);
        }
        case Kind.IDENTIFIER: {
            const identifier: ast.Identifier = new ast.Identifier(current);
            parser.buf.next();
            return identifier;
        }
        case Kind.OPEN_SQUARE: {
            parser.buf.next();
            return new ast.ArrayLiteral(current, parseList(parser, Kind.CLOSE_SQUARE, Kind.COMMA, parseExpression));
        }
        case Kind.OPEN_PARAN: {
            parser.buf.next();
            const expr: ast.Expression = parseExpression(parser);
            parser.buf.expect(Kind.CLOSE_PARAN);
            return expr;
        }
        default: {
            parser.err.throw(current, "Failed to parser ExprL1")
        }
    }
}