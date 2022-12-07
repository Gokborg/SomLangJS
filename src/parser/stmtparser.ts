import {Token, Kind} from "../token.ts";
import * as ast from "../ast.ts";
import {Parser} from "../parser.ts"
import {parseDeclaration} from "./decparser.ts";
import {parseAssignment, parseDerefAssignment} from "./assignparser.ts"
import {parseBody} from "./bodyparser.ts";
import { parseIfStatement } from "./ifparser.ts";
import { parseWhileStatement } from "./whileparser.ts";
import { parseExpression } from "./exprparser.ts";
import { parseMacro } from "./macroparser.ts";
import { parseMacroCall } from "./macrocallparser.ts";
import { parseFunction } from "./functionparser.ts";
import { parseAsmStatement } from "./asmparser.ts";
import { parseAsmInstruction } from "./asminstrparser.ts";

export function parseIsVarOrArray(parser: Parser): ast.TypeNode  {
    const typeToken: Token = parser.buf.expect(Kind.IDENTIFIER);
    let type: ast.TypeNode = new ast.VarType(typeToken);
    while (true) {
      switch (parser.buf.current.kind) {
        case Kind.OPEN_SQUARE: {
            if (parser.buf.next().eq(Kind.CLOSE_SQUARE)) {
                parser.buf.next();
                type = new ast.VarArray(type);
            } else {
                const expr = parseExpression(parser);
                parser.buf.expect(Kind.CLOSE_SQUARE)
                type = new ast.VarArray(type, expr);
            }
        } break
        case Kind.MULT: {
            parser.buf.next();
            type = new ast.VarPointer(type);
        } break;
        default: return type;
      }
    }
}

export function parseStatement(parser: Parser): undefined | ast.Statement {
    // TODO: don't throw exceptions in the parser functions
    try {
    switch (parser.buf.current.kind) {
        case Kind.IF: return parseIfStatement(parser);
        case Kind.WHILE: return parseWhileStatement(parser);
        case Kind.ASM: return parseAsmStatement(parser);
        case Kind.MACRO: return parseMacro(parser);
        case Kind.MACROCALL: return parseMacroCall(parser);
        case Kind.OPEN_BRACE: return parseBody(parser);
        case Kind.ASMINSTR: return parseAsmInstruction(parser);
        case Kind.MULT: return parseDerefAssignment(parser);
        case Kind.IDENTIFIER: {
            const typeIdent = new ast.Identifier(parser.buf.current);
            const type = parseIsVarOrArray(parser);
            if (parser.buf.current.eq(Kind.IDENTIFIER)) {
                typeIdent.token.kind = Kind.VAR_TYPE;
                if (parser.buf.peek(1).kind === Kind.OPEN_PARAN) {
                    return parseFunction(parser, type);
                }
                return parseDeclaration(parser, type);
            }
            else {
                return parseAssignment(parser, typeIdent, type);
            }
        }
        default: parser.err.error(parser.buf.current, "Unexpected token");
    }
    } catch(e) {

    }
}