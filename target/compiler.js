var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

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
  constructor(kind, value, line, lineno, start) {
    this.kind = kind;
    this.value = value;
    this.line = line;
    this.lineno = lineno;
    this.start = start;
  }
  eq(kind) {
    return this.kind == kind;
  }
  toString() {
    return `Token(${this.kind} ${this.lineno}:${this.start} ${JSON.stringify(this.value)})`;
  }
};

// src/lexer.ts
var Buffer2 = class {
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
  const buf = new Buffer2();
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
        tokens.push(new Token("NUMBER" /* NUMBER */, num, line, lineno, start));
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
        tokens.push(new Token(kind, word, line, lineno, start));
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
            tokens.push(new Token(symbol_kind, current, line, lineno, buf.pos));
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

// src/tokenbuffer.ts
var TokenBuffer = class {
  constructor(err) {
    this.err = err;
  }
  pos;
  content;
  current;
  lastToken;
  done;
  set(content) {
    this.pos = 0;
    this.done = false;
    this.content = content;
    this.current = this.content[this.pos];
    this.lastToken = this.content[this.pos];
  }
  next() {
    this.pos += 1;
    if (this.pos < this.content.length) {
      this.current = this.content[this.pos];
      this.lastToken = this.current;
    } else {
      this.done = true;
      this.current = new Token("NONE" /* NONE */, this.lastToken.value, this.lastToken.line, this.lastToken.lineno, this.lastToken.start);
    }
    return this.current;
  }
  next_if(kind) {
    const c = this.current;
    if (c.eq(kind)) {
      this.next();
      return c;
    }
    return void 0;
  }
  try_expect(kind) {
    const c = this.current;
    if (c.eq(kind)) {
      this.next();
      return c;
    } else {
      this.err.error(c, "Expected token kind '" + kind + "', got '" + c.kind + "'");
    }
  }
  expect(kind) {
    const c = this.current;
    if (c.eq(kind)) {
      this.next();
      return c;
    } else {
      this.err.throw(c, "Expected token kind '" + kind + "', got '" + c.kind + "'");
    }
  }
};

// src/errors.ts
var Info = class {
  constructor(token, msg, level = "Error" /* Error */) {
    this.token = token;
    this.msg = msg;
    this.level = level;
  }
  static msg(msg) {
    return new Info(void 0, msg);
  }
  toString(file_name = "<eval>") {
    let output = "";
    if (this.token) {
      output += `${file_name}:${this.token.lineno}:${this.token.start}: `;
    }
    output += `${this.level}: ${this.msg}
`;
    if (this.token) {
      output += `${this.token.line}
`;
      output += " ".repeat(this.token.start - 1) + "^";
    }
    return output;
  }
};
var ErrorContext = class {
  infos = [];
  warnings = [];
  errors = [];
  has_error() {
    return this.errors.length > 0;
  }
  throw(token, msg) {
    this.print_errors();
    throw new Error(new Info(token, msg).toString());
  }
  throw_msg(msg) {
    this.print_errors();
    throw new Error(new Info(void 0, msg).toString());
  }
  error(token, msg) {
    this.infos.push(new Info(token, msg));
  }
  error_msg(msg) {
    this.infos.push(new Info(void 0, msg));
  }
  warn(token, msg) {
    this.warnings.push(new Info(token, msg, "Warning" /* Warning */));
  }
  warn_msg(msg) {
    this.warnings.push(new Info(void 0, msg, "Warning" /* Warning */));
  }
  info(token, msg) {
    this.errors.push(new Info(token, msg, "Info" /* Info */));
  }
  info_msg(msg) {
    this.errors.push(new Info(void 0, msg, "Info" /* Info */));
  }
  toString() {
    let messages = "";
    if (this.errors) {
      messages += "[ERRORS]:\n";
    }
    for (const error of this.errors) {
      messages += error.toString();
    }
    if (this.warnings) {
      messages += "[WARNINGS]:\n";
    }
    for (const error of this.warnings) {
      messages += error.toString();
    }
    if (this.warnings) {
      messages += "[INFO]:\n";
    }
    for (const error of this.infos) {
      messages += error.toString();
    }
    return messages;
  }
  print_errors() {
    console.error(this.toString());
  }
};

// src/ast.ts
var Body = class {
  constructor(content) {
    this.content = content;
  }
  toString() {
    return `Body {
${this.content.join("\n")}
}`;
  }
};
var IfStatement = class {
  constructor(condition, body, child) {
    this.condition = condition;
    this.body = body;
    this.child = child;
  }
  toString() {
    return `If(
	${this.condition} 
	${this.body} else 
	${this.child ?? "nothing"})`;
  }
};
var WhileStatement = class {
  constructor(condition, body) {
    this.condition = condition;
    this.body = body;
  }
  toString() {
    return `While(
	${this.condition} 
	${this.body})`;
  }
};
var Declaration = class {
  constructor(vartype, name, expr) {
    this.vartype = vartype;
    this.name = name;
    this.expr = expr;
  }
  toString() {
    return `Declaration(${this.vartype} ${this.name} = ${this.expr})`;
  }
};
var Assignment = class {
  constructor(name, expr) {
    this.name = name;
    this.expr = expr;
  }
  toString() {
    return `Assignment(${this.name} = ${this.expr})`;
  }
};
var VarType = class {
  constructor(type, token) {
    this.type = type;
    this.token = token;
  }
  toString() {
    return `VarType(${this.type} ${this.token})`;
  }
};
var Number = class {
  constructor(token) {
    this.token = token;
  }
  toString() {
    return `Number(${this.token})`;
  }
};
var Identifier = class {
  constructor(token) {
    this.token = token;
  }
  toString() {
    return `Identifier(${this.token})`;
  }
};
var BinaryOp = class {
  constructor(expr1, op, expr2) {
    this.expr1 = expr1;
    this.op = op;
    this.expr2 = expr2;
  }
  toString() {
    return `BinOp(${this.expr1} ${this.op} ${this.expr2})`;
  }
};
var ArrayLiteral = class {
  constructor(items) {
    this.items = items;
  }
  toString() {
    return `ArrayLit(${this.items.join(", ")})`;
  }
};
var ArrayAccess = class {
  constructor(array, index) {
    this.array = array;
    this.index = index;
  }
  toString() {
    return `ArrayAccess(${this.array} ${this.index})`;
  }
};

// src/type.ts
var ArrayType = class {
  constructor(iner) {
    this.iner = iner;
  }
  eq(other) {
    return other instanceof ArrayType && this.iner.eq(other);
  }
  toString() {
    return `${this.iner.toString()}[]`;
  }
};
var _Prim = class {
  constructor(name) {
    this.name = name;
  }
  eq(other) {
    return this === other;
  }
  toString() {
    return this.name;
  }
};
var Prim = _Prim;
__publicField(Prim, "UINT", new _Prim("UINT"));
__publicField(Prim, "Char", new _Prim("CHAR"));
__publicField(Prim, "Bool", new _Prim("BOOL"));

// src/parser/exprparser.ts
function parseExpression(parser) {
  return genericParseBinOp(parser, parseExprL3, ["COND_E" /* COND_E */, "COND_GE" /* COND_GE */, "COND_LE" /* COND_LE */, "COND_G" /* COND_G */, "COND_L" /* COND_L */]);
}
function genericParseBinOp(parser, func, kinds) {
  let expr1 = func(parser);
  while (kinds.includes(parser.buf.current.kind)) {
    let op = parser.buf.current;
    parser.buf.next();
    let expr2 = func(parser);
    expr1 = new BinaryOp(expr1, op, expr2);
  }
  return expr1;
}
function parseExprL3(parser) {
  return genericParseBinOp(parser, parseExprL2, ["PLUS" /* PLUS */, "MINUS" /* MINUS */]);
}
function parseExprL2(parser) {
  return genericParseBinOp(parser, parseExprL1, ["MULT" /* MULT */, "DIV" /* DIV */]);
}
function parseExprL1(parser) {
  const current = parser.buf.current;
  parser.buf.next();
  switch (current.kind) {
    case "NUMBER" /* NUMBER */: {
      return new Number(current);
    }
    case "IDENTIFIER" /* IDENTIFIER */: {
      const identifier = new Identifier(current);
      if (parser.buf.next_if("OPEN_SQUARE" /* OPEN_SQUARE */)) {
        const expr = parseExpression(parser);
        parser.buf.expect("CLOSE_SQUARE" /* CLOSE_SQUARE */);
        return new ArrayAccess(identifier, expr);
      }
      return identifier;
    }
    case "OPEN_SQUARE" /* OPEN_SQUARE */: {
      const items = [];
      if (parser.buf.next_if("CLOSE_SQUARE" /* CLOSE_SQUARE */)) {
        return new ArrayLiteral(items);
      }
      items.push(parseExpression(parser));
      while (!parser.buf.current.eq("CLOSE_SQUARE" /* CLOSE_SQUARE */)) {
        parser.buf.expect("COMMA" /* COMMA */);
        items.push(parseExpression(parser));
      }
      parser.buf.next();
      return new ArrayLiteral(items);
    }
    case "OPEN_PARAN" /* OPEN_PARAN */: {
      const expr = parseExpression(parser);
      parser.buf.expect("CLOSE_PARAN" /* CLOSE_PARAN */);
      return expr;
    }
    default: {
      parser.err.throw(current, "Failed to parser ExprL1");
    }
  }
}

// src/parser/decparser.ts
function parseDeclaration(parser) {
  const typeToken = parser.buf.expect("VAR_TYPE" /* VAR_TYPE */);
  let iner;
  if (typeToken.value == "uint") {
    iner = Prim.UINT;
  } else {
    parser.err.throw(typeToken, "Unknown type");
  }
  if (parser.buf.next_if("OPEN_SQUARE" /* OPEN_SQUARE */)) {
    parser.buf.expect("CLOSE_SQUARE" /* CLOSE_SQUARE */);
    iner = new ArrayType(iner);
  }
  const vartype = new VarType(iner, typeToken);
  const identifier = parser.buf.expect("IDENTIFIER" /* IDENTIFIER */);
  if (parser.buf.next_if("EQUAL" /* EQUAL */)) {
    const expr = parseExpression(parser);
    parser.buf.try_expect("SEMICOLON" /* SEMICOLON */);
    return new Declaration(vartype, new Identifier(identifier), expr);
  }
  return new Declaration(vartype, new Identifier(identifier));
}

// src/parser/assignparser.ts
function parseAssignment(parser) {
  const identifier = parser.buf.expect("IDENTIFIER" /* IDENTIFIER */);
  parser.buf.expect("EQUAL" /* EQUAL */);
  const expr = parseExpression(parser);
  parser.buf.expect("SEMICOLON" /* SEMICOLON */);
  return new Assignment(new Identifier(identifier), expr);
}

// src/parser/bodyparser.ts
function parseBody(parser) {
  parser.buf.expect("OPEN_BRACE" /* OPEN_BRACE */);
  const content = [];
  while (!parser.buf.current.eq("CLOSE_BRACE" /* CLOSE_BRACE */)) {
    content.push(parseStatement(parser));
  }
  parser.buf.next();
  return new Body(content);
}

// src/parser/ifparser.ts
function parseIfStatement(parser) {
  parser.buf.next();
  const condition = parseExpression(parser);
  const body = parseBody(parser);
  if (parser.buf.next_if("ELSE" /* ELSE */)) {
    const elseBody = parseBody(parser);
    return new IfStatement(condition, body, elseBody);
  } else if (parser.buf.current.eq("ELIF" /* ELIF */)) {
    const elsePart = parseIfStatement(parser);
    return new IfStatement(condition, body, elsePart);
  }
  return new IfStatement(condition, body, void 0);
}

// src/parser/whileparser.ts
function parseWhileStatement(parser) {
  parser.buf.expect("WHILE" /* WHILE */);
  const condition = parseExpression(parser);
  if (condition instanceof Number || condition instanceof Identifier) {
    const binop = new BinaryOp(condition, new Token("COND_NE" /* COND_NE */, "!=", condition.token.line, condition.token.lineno, condition.token.start), new Token("NUMBER" /* NUMBER */, "0", condition.token.line, condition.token.lineno, condition.token.start));
  }
  const body = parseBody(parser);
  return new WhileStatement(condition, body);
}

// src/parser/stmtparser.ts
function parseStatement(parser) {
  switch (parser.buf.current.kind) {
    case "VAR_TYPE" /* VAR_TYPE */:
      return parseDeclaration(parser);
    case "IDENTIFIER" /* IDENTIFIER */:
      return parseAssignment(parser);
    case "IF" /* IF */:
      return parseIfStatement(parser);
    case "WHILE" /* WHILE */:
      return parseWhileStatement(parser);
    case "OPEN_BRACE" /* OPEN_BRACE */:
      return parseBody(parser);
    default:
      parser.err.throw(parser.buf.current, "");
  }
}

// src/parser.ts
var Parser = class {
  err;
  buf;
  constructor() {
    this.err = new ErrorContext();
    this.buf = new TokenBuffer(this.err);
  }
  parse(tokens) {
    const ast_nodes = [];
    this.buf.set(tokens);
    while (!this.buf.done) {
      ast_nodes.push(parseStatement(this));
    }
    return ast_nodes;
  }
};
export {
  Kind,
  Parser,
  Token,
  lex
};
//# sourceMappingURL=compiler.js.map
