import {lex} from "./lexer.ts"
import {Token} from "./token.ts"

import { Parser } from "./parser.ts";
const tokens = lex([
    "uint a = 5 + 5;"
])
console.log(tokens);
const parser: Parser = new Parser();
const ast_nodes = parser.parse(tokens);
console.log(ast_nodes);
