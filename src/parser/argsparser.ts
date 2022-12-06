import * as ast from "../ast.ts";
import { Kind, Token } from "../token.ts";
import { Parser } from "../parser.ts";

import { parseExpression } from "./exprparser.ts";
import { parseBody } from "./bodyparser.ts";
import { parseList } from "./listparser.ts";

export function parseArguments(parser: Parser) : ast.Expression[] {
    parser.buf.expect(Kind.OPEN_PARAN)
    return parseList(parser, Kind.CLOSE_PARAN, Kind.COMMA, parseExpression);
}