import * as ast from "../ast.ts";
import { Kind, Token } from "../token.ts";
import { Parser } from "../parser.ts";

import { parseExpression } from "./exprparser.ts";
import { parseArguments } from "./argsparser.ts";
import { parseBody } from "./bodyparser.ts";
import { parseList } from "./listparser.ts";

export function parseAsmStatement(parser: Parser) : ast.AsmStatement {
    const asmToken: Token = parser.buf.expect(Kind.ASM);
    const exprs: ast.Expression[] = parseList(parser, Kind.OPEN_BRACE, Kind.COMMA, parseExpression);

    //moves the buffer back one because parseBody requires an open brace and parseList moves the buffer too forward
    //other solution is making parseList optionally move the buffer over the closeKind or stay on closeKind
    parser.buf.back(); 
    
    const args: ast.Identifier[] = [];
    //Make sure that arguments are only identifiers
    for(const arg of exprs) {
        if(!(arg instanceof ast.Identifier)) {
            parser.err.error(asmToken, "You can only have an identifier passed in the asm statement!");
        }
        else {
            args.push(arg);
        }
    }
    const asmInstrs: ast.AsmInstruction[] = [];
    const body: ast.Body = parseBody(parser);
    for(const stmt of body.content) {
        if(!(stmt instanceof ast.AsmInstruction)) {
            parser.err.error(asmToken, "You can only have assembly instructions in the asm body!");
        }
        else {
            asmInstrs.push(stmt);
        }
    }
    // for(const asmInstr of asmInstrs) {
    //     console.log(asmInstr);
    // }
    return new ast.AsmStatement(asmToken, args, new ast.AsmBody(body.start, asmInstrs));
}