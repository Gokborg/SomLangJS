import {Kind} from "../token.ts";
import * as ast from "../ast.ts";
import {Parser} from "../parser.ts"
import {parseDeclaration} from "./decparser.ts";
import {parseAssignment} from "./assignparser.ts"
import {parseBody} from "./bodyparser.ts";
import { parseIfStatement } from "./ifparser.ts";
import { parseWhileStatement } from "./whileparser.ts";


export function parseStatement(parser: Parser) : ast.Statement {
    switch (parser.buf.current.kind) {
        case Kind.VAR_TYPE: return parseDeclaration(parser);
        case Kind.IDENTIFIER: return parseAssignment(parser);
        case Kind.IF: return parseIfStatement(parser);
        case Kind.WHILE: return parseWhileStatement(parser);
        case Kind.OPEN_BRACE: return parseBody(parser);
        default: parser.err.throw(parser.buf.current, "")
    }
}