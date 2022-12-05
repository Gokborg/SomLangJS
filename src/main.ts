import {lex} from "./lexer.ts"
import {Token} from "./token.ts"

import { Parser } from "./parser.ts";
import { CodeGeneration, Asm } from "./codegen.ts";
const tokens = lex(`
uint[5] a;
a[1] = 5;
`.split("\n"));
console.log(tokens);
const parser: Parser = new Parser();
const ast_nodes = parser.parse(tokens);
console.log(ast_nodes);

const codegen: CodeGeneration = new CodeGeneration(7);
console.log(codegen.gen(ast_nodes).toString());
//console.log(asm);

