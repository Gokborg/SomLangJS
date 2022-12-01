import {lex} from "./lexer.ts"
import {Token} from "./token.ts"

const tokens = lex([
    "uint a = 5;"
])
console.log(tokens);