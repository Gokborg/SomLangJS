import {lex} from "./lexer.ts"
import {Token} from "./token.ts"

import { Parser } from "./parser.ts";
import { CodeGeneration, Asm } from "./codegen.ts";
const tokens = lex([
    "uint i = 5;",
    "i += 1;"
])
console.log(tokens);
const parser: Parser = new Parser();
const ast_nodes = parser.parse(tokens);
console.log(ast_nodes);

const codegen: CodeGeneration = new CodeGeneration(7);
codegen.gen(ast_nodes);
//console.log(asm);
