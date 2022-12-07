import { Parser } from "../parser.ts";
import * as ast from "../ast.ts";
import { Kind } from "../token.ts";
import { parseList } from "./listparser.ts";
import { parseIsVarOrArray } from "./stmtparser.ts";
import { parseBody } from "./bodyparser.ts";

export function parseFunction(parser: Parser, type: ast.TypeNode): ast.FunctionDeclaration {
    console.log(type);
    const name = new ast.Identifier(parser.buf.expect(Kind.IDENTIFIER));
    parser.buf.expect(Kind.OPEN_PARAN);
    const args = parseList(parser, Kind.CLOSE_PARAN, Kind.COMMA, parseFuncArg);
    const body = parseBody(parser);
    return new ast.FunctionDeclaration(type, name, args, body);
}

function parseFuncArg(parser: Parser) {
    const type = parseIsVarOrArray(parser);
    const name = new ast.Identifier(parser.buf.expect(Kind.IDENTIFIER));
    return new ast.FunctionArgument(type, name);
}