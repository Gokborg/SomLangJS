import * as ast from "../ast.ts";
import { Kind } from "../token.ts";
import { Parser } from "../parser.ts";

import { parseBody } from "./bodyparser.ts";
import { parseArguments } from "./argsparser.ts";

export function parseMacro(parser: Parser) : ast.MacroDeclaration {
    parser.buf.expect(Kind.MACRO);
    const name: ast.Identifier = new ast.Identifier(parser.buf.expect(Kind.IDENTIFIER));
    const args = parseArguments(parser);
    const body = parseBody(parser);

    return new ast.MacroDeclaration(name, args, body);
}