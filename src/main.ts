import {lex} from "./lexer.ts"
import {Token} from "./token.ts"

import { Parser } from "./parser.ts";
import { CodeGeneration } from "./codegen/bettercodegen.ts";
import { Asm } from "./codegen/asm.ts";
const tokens = lex(`
uint a = 1;
`.split("\n"));
console.log(tokens);
const parser: Parser = new Parser();
const ast_nodes = parser.parse(tokens);
console.log(ast_nodes);

const codegen: CodeGeneration = new CodeGeneration(7);
console.log(codegen.gen(ast_nodes).toString());
//console.log(asm);

