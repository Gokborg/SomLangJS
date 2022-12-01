import { Assignment, Identifier } from "./ast.ts";
import { Kind, Token } from "./token.ts";

class Parser<T> {
  constructor (
    private start: Kind[]
  ) {}
}

function and<Ts extends readonly any[], T>(f: (...args: Ts)=>T, ...parsers: {[K in keyof Ts]: Parser<Ts[K]>}): Parser<T> {
 return new Parser([]);
}
function or<Ts extends readonly any[]>(...parsers: {[K in keyof Ts]: Parser<Ts[K]>}): Parser<Ts[number]> {
  return new Parser([]);
}

function tor<T>(kinds: Kind[], f: (t: Token)=>T): Parser<T> {
  return new Parser(kinds)
}
function sym(...kinds: Kind[]): Parser<void> {
  return new Parser(kinds);
}

// function


const id = tor([Kind.IDENTIFIER], t =>new Identifier(t));
const assign = and((id, a, expr, b) => new Assignment(id, expr), id, sym(Kind.EQUAL), id, sym(Kind.SEMICOLON));