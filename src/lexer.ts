import {Token, Kind} from "./token.ts";

class Buffer {
    current!: string
    pos!: number
    done!: boolean
    line!: string
    set(line: string) {
        this.current = line[0]
        this.pos = 0
        this.done = false
        this.line = line
    }

    next(): string {
        this.pos += 1
        if (this.pos < this.line.length) {
            this.current = this.line[this.pos]
        } else {
            this.done = true
            this.current = '\0'
        }
        return this.current
    }
}

const keywords: Record<string, Kind> = {
    "uint": Kind.VAR_TYPE,
    "char": Kind.VAR_TYPE,
    "if": Kind.IF,
    "else": Kind.ELSE,
    "elif": Kind.ELIF,
    "while": Kind.WHILE,
    "macro": Kind.MACRO,
}

const symbols : Record<string, Kind> = {
    '=': Kind.EQUAL,
    ';': Kind.SEMICOLON,
    '{': Kind.OPEN_BRACE,
    '}': Kind.CLOSE_BRACE,
    '>': Kind.COND_G,
    '<': Kind.COND_L,
    '+': Kind.PLUS,
    '-': Kind.MINUS,
    '*': Kind.MULT,
    '(': Kind.OPEN_PARAN,
    ')': Kind.CLOSE_PARAN,
    ',': Kind.COMMA,
    '/': Kind.DIV,
    '[': Kind.OPEN_SQUARE,
    ']': Kind.CLOSE_SQUARE,
}

const double_symbols: Record<string, Kind> = {
    "==": Kind.COND_E,
    ">=": Kind.COND_GE,
    "<=": Kind.COND_LE,
    "!=": Kind.COND_NE,
    "//": Kind.COMMENT,
}

export function lex(lines: string[], file_name = "<eval>") : Token[]{
    const tokens: Token[] = []
    const buf: Buffer = new Buffer()
    let lineno = 0;
    for (const line of lines) {
        lineno++;
        buf.set(line);
        while (!buf.done) {
            if (isDigit(buf.current)) {
                const start: number = buf.pos;
                let num: string = buf.current;
                while (isDigit(buf.next())) {
                    num += buf.current;
                }
                tokens.push(
                    new Token(Kind.NUMBER, num, line, lineno, start)
                );
            }
            else if(isAlpha(buf.current)) {
                const start: number = buf.pos;
                let word: string = buf.current;
                while (isAlpha(buf.next())) {
                    word += buf.current 
                }
                let kind: Kind = Kind.IDENTIFIER;
                if (word in keywords) {
                    kind = keywords[word];
                }
                if (buf.current === "!") {
                    buf.next();
                    kind = Kind.MACROCALL;
                }
                tokens.push(
                    new Token(kind, word, line, lineno, start)
                );
            }
            else {
                if (buf.current in symbols) {
                    let current: string = buf.current;
                    let symbol_kind: Kind = symbols[current];
                    buf.next();
                    const double_symbol = buf.current + current;
                    if (double_symbol in double_symbols) {
                        symbol_kind = double_symbols[double_symbol];
                        current = double_symbol;
                        buf.next();
                    }

                    if (symbol_kind === Kind.COMMENT) {
                        buf.done = true;
                    } else {
                        tokens.push(
                            new Token(symbol_kind, current, line, lineno, buf.pos)
                        );
                    }
                }
                else
                {
                    buf.next();
                }
            }
        }
    }
    return tokens;
}

function isDigit(x: string) {
    return "0123456789".includes(x);
}

function isAlpha(x: string) {
    return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(x);
}

function isAlphaNum(x: string) {
    return isDigit(x) || isAlpha(x);
}