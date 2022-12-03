import {Token, Kind} from "../token.ts";
import * as ast from "../ast.ts";
import {Parser} from "../parser.ts"
import {parseDeclaration} from "./decparser.ts";
import {parseAssignment} from "./assignparser.ts"
import {parseBody} from "./bodyparser.ts";
import { parseIfStatement } from "./ifparser.ts";
import { parseWhileStatement } from "./whileparser.ts";
import { parseExpression } from "./exprparser.ts";

export function parseIsVarOrArray(parser: Parser): ast.TypeNode  {
    const typeToken: Token = parser.buf.expect(Kind.IDENTIFIER);
    switch (parser.buf.current.kind) {
      case Kind.OPEN_SQUARE: {
        console.log(">>>>", parser.buf.current);
        if (parser.buf.next().eq(Kind.CLOSE_SQUARE)) {
          parser.buf.next();
          return new ast.VarArray(new ast.VarType(typeToken));
        }
        const expr = parseExpression(parser);
        parser.buf.expect(Kind.CLOSE_SQUARE)
        return new ast.VarArray(new ast.VarType(typeToken), expr);
      }
    }
    return new ast.VarType(typeToken);
  }

export function parseStatement(parser: Parser) : ast.Statement {
    switch (parser.buf.current.kind) {
        case Kind.IF: return parseIfStatement(parser);
        case Kind.WHILE: return parseWhileStatement(parser);
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