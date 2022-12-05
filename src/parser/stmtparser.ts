import {Token, Kind} from "../token.ts";
import * as ast from "../ast.ts";
import {Parser} from "../parser.ts"
import {parseDeclaration} from "./decparser.ts";
import {parseAssignment} from "./assignparser.ts"
import {parseBody} from "./bodyparser.ts";
import { parseIfStatement } from "./ifparser.ts";
import { parseWhileStatement } from "./whileparser.ts";
import { parseExpression } from "./exprparser.ts";
import { parseMacro } from "./macroparser.ts";
import { parseMacroCall } from "./macrocallparser.ts";

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

export function parseStatement(parser: Parser) : ast.Statement {
    switch (parser.buf.current.kind) {
        case Kind.IF: return parseIfStatement(parser);
        case Kind.WHILE: return parseWhileStatement(parser);
        case Kind.MACRO: return parseMacro(parser);
        case Kind.MACROCALL: return parseMacroCall(parser);
        case Kind.OPEN_BRACE: return parseBody(parser);
        case Kind.IDENTIFIER: {
            const ident = new ast.Identifier(parser.buf.current);
            const type = parseIsVarOrArray(parser);
            if (parser.buf.current.eq(Kind.IDENTIFIER)) {
                ident.token.kind = Kind.VAR_TYPE;
                return parseDeclaration(parser, type);
            }
            else {
                return parseAssignment(parser, ident, type);
            }
        }
        default: parser.err.throw(parser.buf.current, "")
    }
}