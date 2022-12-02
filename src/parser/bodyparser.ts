import * as ast from "../ast.ts";
import {Kind} from "../token.ts";
import { Parser } from "../parser.ts";
import { parseStatement } from "./stmtparser.ts";

export function parseBody(parser: Parser) : ast.Body{
    const open = parser.buf.current;
    parser.buf.expect(Kind.OPEN_BRACE);
    const content: ast.Statement[] = []
    while (!parser.buf.current.eq(Kind.CLOSE_BRACE)) {
        content.push(parseStatement(parser));
    }
    parser.buf.next();
    return new ast.Body(open, content);
}