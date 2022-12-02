import * as ast from "../ast.ts";
import { Kind } from "../token.ts";
import { Parser } from "../parser.ts";

import { parseArguments } from "./argsparser.ts";

export function parseMacroCall(parser: Parser) : ast.MacroCall {
    const name: ast.Identifier = new ast.Identifier(parser.buf.expect(Kind.MACROCALL));
    const args: ast.Expression[] = parseArguments(parser);
    parser.buf.expect(Kind.SEMICOLON);
    return new ast.MacroCall(name, args);
}