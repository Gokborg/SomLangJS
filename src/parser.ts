import * as ast from "./ast.ts";
import {Kind, Token} from "./token.ts";
import {TokenBuffer} from "./tokenbuffer.ts";
import { ErrorContext } from "./errors.ts";

import { parseStatement } from "./parser/stmtparser.ts";
export class Parser {
    err: ErrorContext; 
    buf: TokenBuffer;

    constructor() {
        this.err = new ErrorContext();
        this.buf = new TokenBuffer(this.err);
    }

    parse(tokens: Token[]) : ast.Statement[] {
        tokens = tokens.filter(token => 
            token.kind !== Kind.WHITESPACE && token.kind !== Kind.COMMENT
        );
        const ast_nodes: ast.Statement[] = [];
        this.buf.set(tokens);
        while(!this.buf.done) {
            const statement = parseStatement(this);
            if (statement) {
                ast_nodes.push(statement);
            }
        }
        return ast_nodes;
    }
}