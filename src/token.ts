export const enum Kind {
  VAR_TYPE = "VAR_TYPE",

  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  EQUAL = "EQUAL",
  PLUS = "PLUS",
  MINUS = "MINUS",
  MULT = "MULT",
  DIV = "DIV",

  AND = "AND",

  MACROCALL = "MACROCALL",

  COMMENT = "COMMENT",

  OPEN_BRACE = "OPEN_BRACE",
  CLOSE_BRACE = "CLOSE_BRACE",
  IF = "IF",
  ELSE = "ELSE",
  ELIF = "ELIF",
  WHILE = "WHILE",
  MACRO = "MACRO",
  COND_G = "COND_G",
  COND_L = "COND_L",
  COND_E = "COND_E",
  COND_LE = "COND_LE",
  COND_NE = "COND_NE",
  COND_GE = "COND_GE",
  COMMA = "COMMA",
  CONSTANT = "CONSTANT",
  ASM = "ASM",
  ASMINSTR = "ASMINSTR",
  HASHTAG = "HASHTAG",

  EXCLAMATION = "EXCLAMATION",
  PERIOD = "PERIOD",

  WHITESPACE = "WHITESPACE",

  OPEN_PARAN = "OPEN_PARAN",
  CLOSE_PARAN = "CLOSE_PARAN",

  OPEN_SQUARE = "OPEN_SQUARE",
  CLOSE_SQUARE = "CLOSE_SQUARE",

  SEMICOLON = "SEMICOLON",

  EOF = "EOF",
}

export class Token {
  constructor(
    public kind: Kind,
    public value: string,
    public line: string,
    public lineno: number,
    public start: number,
  ){}

  eq(kind: Kind): boolean {
    return this.kind == kind;
  }

  toString(): string {
    return `Token(${this.kind} ${this.lineno}:${this.start} ${JSON.stringify(this.value)})`;
  }
}