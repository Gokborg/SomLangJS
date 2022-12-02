import {lex} from "./lexer.ts"
import {Token} from "./token.ts"

import { Parser } from "./parser.ts";
import { CodeGeneration, Asm } from "./codegen.ts";
const tokens = lex([
    "uint a = 5 + 5;",
    "uint b = a;",
    "b = 1;",
    "a = b;"
])
console.log(tokens);
const parser: Parser = new Parser();
const ast_nodes = parser.parse(tokens);
console.log(ast_nodes);

const codegen: CodeGeneration = new CodeGeneration(7);
const asm: Asm = codegen.gen(ast_nodes);
console.log(asm.instrs);
