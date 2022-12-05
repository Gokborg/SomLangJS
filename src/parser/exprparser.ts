import * as ast from "../ast.ts";
import { Kind, Token } from "../token.ts";
import { Parser } from "../parser.ts";

export function parseExpression(parser: Parser) {
    return genericParseBinOp(
        parser,
        parseExprL3, 
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

function parseExprL3(parser: Parser) : ast.Expression {
    return genericParseBinOp(
        parser,
        parseExprL2,
        [Kind.PLUS, Kind.MINUS]
    );
}

function parseExprL2(parser: Parser) : ast.Expression {
    return genericParseBinOp(
        parser,
        parseExprL1,
        [Kind.MULT, Kind.DIV]
    );
}

function parseExprL1(parser: Parser) : ast.Expression {
    const current: Token = parser.buf.current;
    parser.buf.next();
    switch(current.kind) {
        case Kind.AND: {
            return new ast.Reference(current, parseExprL1(parser));
        }
        case Kind.MULT: {
            return new ast.Dereference(current, parseExprL1(parser));
        }
        case Kind.NUMBER: { return new ast.Number(current); }
        case Kind.IDENTIFIER: {
            const identifier: ast.Identifier = new ast.Identifier(current);
            if(parser.buf.next_if(Kind.OPEN_SQUARE)) {
                const expr: ast.Expression = parseExpression(parser); 
                parser.buf.expect(Kind.CLOSE_SQUARE);
                return new ast.ArrayAccess(identifier, expr);
            }
            return identifier;
        }
        case Kind.OPEN_SQUARE: {
            const items: ast.Expression[] = [];
            if(parser.buf.next_if(Kind.CLOSE_SQUARE)) {
              return new ast.ArrayLiteral(current, items);
            }
            items.push(parseExpression(parser));
            while(!parser.buf.current.eq(Kind.CLOSE_SQUARE)) {
                parser.buf.expect(Kind.COMMA);
                items.push(parseExpression(parser));
            }
            parser.buf.next();
            return new ast.ArrayLiteral(current, items);
        }
        case Kind.OPEN_PARAN: {
            const expr: ast.Expression = parseExpression(parser);
            parser.buf.expect(Kind.CLOSE_PARAN);
            return expr;
        }
        default: {
            parser.err.throw(current, "Failed to parser ExprL1")
        }
    }
}