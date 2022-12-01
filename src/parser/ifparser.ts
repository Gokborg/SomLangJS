import * as ast from "../ast.ts";
import { Kind, Token } from "../token.ts";
import { Parser } from "../parser.ts";

import { parseExpression } from "./exprparser.ts";
import { parseBody } from "./bodyparser.ts";

export function parseIfStatement(parser: Parser) : ast.IfStatement {
    parser.buf.next();
    const condition: ast.Expression = parseExpression(parser);
    const body: ast.Body = parseBody(parser);
    
    if(parser.buf.next_if(Kind.ELSE)) {
        const elseBody: ast.Body = parseBody(parser);
        return new ast.IfStatement(condition, body, elseBody);
    }
    else if(parser.buf.current.eq(Kind.ELIF)) {
        const elsePart: ast.IfStatement = parseIfStatement(parser);
        return new ast.IfStatement(condition, body, elsePart);
    }
    return new ast.IfStatement(condition, body, undefined);
}