import * as ast from "../ast.ts";
import { Kind, Token } from "../token.ts";
import { Parser } from "../parser.ts";

import { parseExpression } from "./exprparser.ts";
import { parseBody } from "./bodyparser.ts";

export function parseWhileStatement(parser: Parser) : ast.WhileStatement {
    parser.buf.expect(Kind.WHILE);
    const condition: ast.Expression = parseExpression(parser);
    // this should probably be done in codegen not here lol
    if(condition instanceof ast.Number || condition instanceof ast.Identifier) {
        const binop: ast.BinaryOp = new ast.BinaryOp(
            condition,
            new Token(Kind.COND_NE, "!=", condition.token.line, condition.token.lineno, condition.token.start),
            new ast.Number(new Token(Kind.NUMBER, "0", condition.token.line, condition.token.lineno, condition.token.start))
        )
    }
    //assert isinstance(condition, ast.BinaryOp)
    const body: ast.Body = parseBody(parser);
    return new ast.WhileStatement(condition, body);
}