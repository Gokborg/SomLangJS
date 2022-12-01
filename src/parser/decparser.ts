import * as ast from "../ast.ts";
import { ErrorContext } from "../errors.ts";
import {Token, Kind} from "../token.ts";
import * as Type from "../type.ts";
import { Parser } from "../parser.ts";

import { parseExpression } from "./exprparser.ts";

export function parseDeclaration(parser: Parser) {
  const typeToken: Token = parser.buf.expect(Kind.VAR_TYPE);
  let iner: Type.Type; 
  if(typeToken.value == "uint") {
      iner = Type.Prim.UINT;
  }
  else {
    parser.err.throw(typeToken, "Unknown type");
      //Generate error here
  }

  if(parser.buf.next_if(Kind.OPEN_SQUARE)) {
    parser.buf.expect(Kind.CLOSE_SQUARE);
      iner = new Type.ArrayType(iner);
  }

  const vartype: ast.VarType = new ast.VarType(iner, typeToken);
  const identifier: Token = parser.buf.expect(Kind.IDENTIFIER);
  if (parser.buf.next_if(Kind.EQUAL)) {
      const expr: ast.Expression = parseExpression(parser);
      parser.buf.try_expect(Kind.SEMICOLON);
      return new ast.Declaration(vartype, new ast.Identifier(identifier), expr);
  }
  return new ast.Declaration(vartype, new ast.Identifier(identifier));
}