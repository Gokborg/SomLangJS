import * as ast from "../ast.ts";
import {Token, Kind} from "../token.ts";
import { Parser } from "../parser.ts";

import { parseExpression } from "./exprparser.ts";

export function parseAssignment(parser: Parser) {
    const identifier: Token = parser.buf.expect(Kind.IDENTIFIER);
    parser.buf.expect(Kind.EQUAL);
    const expr: ast.Expression = parseExpression(parser);
    parser.buf.expect(Kind.SEMICOLON);
    return new ast.Assignment(new ast.Identifier(identifier), expr);
}