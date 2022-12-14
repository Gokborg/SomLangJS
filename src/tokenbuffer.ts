import { ErrorContext } from "./errors.ts";
import { Kind, Token } from "./token.ts";

export class TokenBuffer {
  constructor(private err: ErrorContext) {}

  private pos!: number;
  private content!: Token[];
  public current!: Token;
  public lastToken!: Token;
  public done!: boolean;

  store(): number {
    return this.pos;
  }
  restore(pos: number) {
    this.pos = pos;
    this.current = this.content[pos];
    this.lastToken = pos > 1 ? this.content[pos-1] : this.current;
    this.done = pos >= this.content.length;
  }

  set(content: Token[]) {
    this.pos = 0;
    this.done = false;
    this.content = content;
    this.current = this.content[this.pos];
    // Saving last token for better errors so when the buffer
    // is finished we can see the last token it was working on
    this.lastToken = this.content[this.pos];
  }

  //I added cause of asmparser.ts, check it out see if u can think of something
  back() {
    if(this.pos > 0) {
      this.pos--;
    }
    this.current = this.content[this.pos];
    this.lastToken = this.current;
  }

  peek(amt: number) : Token {
    return this.content[this.pos + amt];
  }

  next(): Token {
    this.pos += 1
    if (this.pos < this.content.length) {
      this.current = this.content[this.pos]
      this.lastToken = this.current
    } else { 
      this.done = true
      this.current = new Token(
        Kind.EOF, this.lastToken.value,
        this.lastToken.line, this.lastToken.lineno,
        this.lastToken.start
      )
    }
    return this.current
  }

  next_if(kind: Kind): undefined | Token {
    const c = this.current
    if (c.eq(kind)) {
      this.next()
      return c
    }
    return undefined
  }
  try_expect(kind: Kind): undefined | Token {
    const c = this.current
    if (c.eq(kind)) {
      this.next()
      return c
    } else {
      this.err.error(
        c,
        "Expected token kind '" + kind + "', got '" + c.kind + "'")
    }
  }

  expect(kind: Kind): Token {
    const c = this.current
    if (c.eq(kind)) {
      this.next()
      return c
    } else {
      this.err.throw(
        c,
        "Expected token kind '" + kind + "', got '" + c.kind + "'")
    }
  }
}