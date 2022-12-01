// src/token.ts
var Kind = /* @__PURE__ */ ((Kind2) => {
  Kind2["VAR_TYPE"] = "VAR_TYPE";
  Kind2["IDENTIFIER"] = "IDENTIFIER";
  Kind2["NUMBER"] = "NUMBER";
  Kind2["EQUAL"] = "EQUAL";
  Kind2["PLUS"] = "PLUS";
  Kind2["MINUS"] = "MINUS";
  Kind2["MULT"] = "MULT";
  Kind2["DIV"] = "DIV";
  Kind2["MACROCALL"] = "MACROCALL";
  Kind2["COMMENT"] = "COMMENT";
  Kind2["OPEN_BRACE"] = "OPEN_BRACE";
  Kind2["CLOSE_BRACE"] = "CLOSE_BRACE";
  Kind2["IF"] = "IF";
  Kind2["ELSE"] = "ELSE";
  Kind2["ELIF"] = "ELIF";
  Kind2["WHILE"] = "WHILE";
  Kind2["MACRO"] = "MACRO";
  Kind2["COND_G"] = "COND_G";
  Kind2["COND_L"] = "COND_L";
  Kind2["COND_E"] = "COND_E";
  Kind2["COND_LE"] = "COND_LE";
  Kind2["COND_NE"] = "COND_NE";
  Kind2["COND_GE"] = "COND_GE";
  Kind2["COMMA"] = "COMMA";
  Kind2["OPEN_PARAN"] = "OPEN_PARAN";
  Kind2["CLOSE_PARAN"] = "CLOSE_PARAN";
  Kind2["OPEN_SQUARE"] = "OPEN_SQUARE";
  Kind2["CLOSE_SQUARE"] = "CLOSE_SQUARE";
  Kind2["SEMICOLON"] = "SEMICOLON";
  Kind2["NONE"] = "NONE";
  return Kind2;
})(Kind || {});
var Token = class {
  constructor(kind, value, line, lineno, start, file_name) {
    this.kind = kind;
    this.value = value;
    this.line = line;
    this.lineno = lineno;
    this.start = start;
    this.file_name = file_name;
  }
  eq(kind) {
    return this.kind == kind;
  }
  toString() {
    return `Token${JSON.stringify(this)}`;
  }
};

// src/lexer.ts
var Buffer = class {
  current;
  pos;
  done;
  line;
  set(line) {
    this.current = line[0];
    this.pos = 0;
    this.done = false;
    this.line = line;
  }
  next() {
    this.pos += 1;
    if (this.pos < this.line.length) {
      this.current = this.line[this.pos];
    } else {
      this.done = true;
      this.current = "\0";
    }
    return this.current;
  }
};
var keywords = {
  "uint": "VAR_TYPE" /* VAR_TYPE */,
  "char": "VAR_TYPE" /* VAR_TYPE */,
  "if": "IF" /* IF */,
  "else": "ELSE" /* ELSE */,
  "elif": "ELIF" /* ELIF */,
  "while": "WHILE" /* WHILE */,
  "macro": "MACRO" /* MACRO */
};
var symbols = {
  "=": "EQUAL" /* EQUAL */,
  ";": "SEMICOLON" /* SEMICOLON */,
  "{": "OPEN_BRACE" /* OPEN_BRACE */,
  "}": "CLOSE_BRACE" /* CLOSE_BRACE */,
  ">": "COND_G" /* COND_G */,
  "<": "COND_L" /* COND_L */,
  "+": "PLUS" /* PLUS */,
  "-": "MINUS" /* MINUS */,
  "*": "MULT" /* MULT */,
  "(": "OPEN_PARAN" /* OPEN_PARAN */,
  ")": "CLOSE_PARAN" /* CLOSE_PARAN */,
  ",": "COMMA" /* COMMA */,
  "/": "DIV" /* DIV */,
  "[": "OPEN_SQUARE" /* OPEN_SQUARE */,
  "]": "CLOSE_SQUARE" /* CLOSE_SQUARE */
};
var double_symbols = {
  "==": "COND_E" /* COND_E */,
  ">=": "COND_GE" /* COND_GE */,
  "<=": "COND_LE" /* COND_LE */,
  "!=": "COND_NE" /* COND_NE */,
  "//": "COMMENT" /* COMMENT */
};
function lex(lines, file_name = "<eval>") {
  const tokens = [];
  const buf = new Buffer();
  let lineno = 0;
  for (const line of lines) {
    lineno++;
    buf.set(line);
    while (!buf.done) {
      if (isDigit(buf.current)) {
        const start = buf.pos;
        let num = buf.current;
        while (isDigit(buf.next())) {
          num += buf.current;
        }
        tokens.push(new Token("NUMBER" /* NUMBER */, num, line, lineno, start, file_name));
      } else if (isAlpha(buf.current)) {
        const start = buf.pos;
        let word = buf.current;
        while (isAlpha(buf.next())) {
          word += buf.current;
        }
        let kind = "IDENTIFIER" /* IDENTIFIER */;
        if (word in keywords) {
          kind = keywords[word];
        }
        if (buf.current === "!") {
          buf.next();
          kind = "MACROCALL" /* MACROCALL */;
        }
        tokens.push(new Token(kind, word, line, lineno, start, file_name));
      } else {
        if (buf.current in symbols) {
          let current = buf.current;
          let symbol_kind = symbols[current];
          buf.next();
          const double_symbol = buf.current + current;
          if (double_symbol in double_symbols) {
            symbol_kind = double_symbols[double_symbol];
            current = double_symbol;
            buf.next();
          }
          if (symbol_kind === "COMMENT" /* COMMENT */) {
            buf.done = true;
          } else {
            tokens.push(new Token(symbol_kind, current, line, lineno, buf.pos, file_name));
          }
        } else {
          buf.next();
        }
      }
    }
  }
  return tokens;
}
function isDigit(x) {
  return "0123456789".includes(x);
}
function isAlpha(x) {
  return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(x);
}
export {
  Kind,
  Token,
  lex
};
//# sourceMappingURL=compiler.js.map
