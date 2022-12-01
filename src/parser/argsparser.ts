import * as ast from "../ast.ts";
import { Kind, Token } from "../token.ts";
import { Parser } from "../parser.ts";

import { parseExpression } from "./exprparser.ts";
import { parseBody } from "./bodyparser.ts";

export function parseArguments(parser: Parser) : ast.Expression[] {
    const args: ast.Expression[] = [];
    parser.buf.expect(Kind.OPEN_PARAN);
    if(parser.buf.next_if(Kind.CLOSE_PARAN)) {
        return args;
    }
    args.push(parseExpression(parser));
    while(!parser.buf.current.eq(Kind.CLOSE_PARAN)) {
        parser.buf.expect(Kind.COMMA);
        args.push(parseExpression(parser));
    }
    return args;
}