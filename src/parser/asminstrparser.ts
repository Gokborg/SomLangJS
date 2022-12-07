
import * as ast from "../ast.ts";
import { ErrorContext } from "../errors.ts";
import {Token, Kind} from "../token.ts";
import * as Type from "../type.ts";
import { Parser } from "../parser.ts";

import { parseExpression } from "./exprparser.ts";
import { parseAssignment } from "./assignparser.ts";

export function parseAsmInstruction(parser: Parser) : ast.AsmInstruction {
    const asmInstrToken: Token = parser.buf.expect(Kind.ASMINSTR);
    const args: ast.Expression[] = parseAsmArgs(parser);
    return new ast.AsmInstruction(asmInstrToken, new ast.Identifier(asmInstrToken), args);
}
//This function is disgusting
function parseAsmArgs(parser: Parser) : ast.Expression[] {
    const asmArgs: ast.Expression[] = [];
    while(parser.buf.current.eq(Kind.IDENTIFIER) || parser.buf.current.eq(Kind.NUMBER) || parser.buf.current.eq(Kind.HASHTAG)) {
        const firstCharacter = parser.buf.current.value.charAt(0);
        //They typed e.g R0 R1 R2
        if(firstCharacter === 'R') {
            asmArgs.push(new ast.AsmRegister(parser.buf.current, parseInt(parser.buf.current.value.charAt(1), 10)));
            parser.buf.next();
        }
        else if(firstCharacter === '#') {
            parser.buf.expect(Kind.HASHTAG);
            
            if(parser.buf.current.eq(Kind.NUMBER) || parser.buf.current.eq(Kind.IDENTIFIER)) {
                
                asmArgs.push(new ast.AsmMemory(parser.buf.current));
                parser.buf.next();
            }
            else {
                parser.err.throw(parser.buf.current, "Must have a number/variable as a memory argument in an asm instruction");
            }
        }
        else {
            const numToken: Token =  parser.buf.expect(Kind.NUMBER);
            asmArgs.push(new ast.Number(numToken));
        }

        if(parser.buf.current.eq(Kind.COMMA)) {
            parser.buf.next();
        }
    }
    return asmArgs;
}