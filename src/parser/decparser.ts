import * as ast from "../ast.ts";
import { ErrorContext } from "../errors.ts";
import {Token, Kind} from "../token.ts";
import * as Type from "../type.ts";
import { Parser } from "../parser.ts";

import { parseExpression } from "./exprparser.ts";
import { parseAssignment } from "./assignparser.ts";

export function parseDeclaration(parser: Parser, vartype: ast.TypeNode) {
  const identifier: ast.Identifier = new ast.Identifier(parser.buf.expect(Kind.IDENTIFIER));
  if (parser.buf.next_if(Kind.EQUAL)) {
      const expr: ast.Expression = parseExpression(parser);
      parser.buf.try_expect(Kind.SEMICOLON);
      return new ast.Declaration(vartype, identifier, expr);
  }
  else {
    if(vartype instanceof ast.VarArray) {
      if(vartype.size == undefined) {
        parser.err.error_msg("You need to put a size when declaring an array'" + identifier + "'");
      }
    }
  }
  return new ast.Declaration(vartype, identifier);
}