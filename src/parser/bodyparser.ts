import * as ast from "../ast.ts";
import {Kind} from "../token.ts";
import { Parser } from "../parser.ts";
import { parseStatement } from "./stmtparser.ts";

export function parseBody(parser: Parser) : ast.Body{
    const open = parser.buf.current;
    parser.buf.expect(Kind.OPEN_BRACE);
    const content: ast.Statement[] = []
    while (!parser.buf.done && !parser.buf.current.eq(Kind.CLOSE_BRACE)) {
        const before = parser.buf.current;
        const statement = parseStatement(parser);
        if (statement) {
            content.push(statement);
        }
        if (parser.buf.current === before) {
            parser.buf.next();
        }
    }
    parser.buf.expect(Kind.CLOSE_BRACE);
    return new ast.Body(open, content);
}