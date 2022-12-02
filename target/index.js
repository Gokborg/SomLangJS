var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/ast.ts
var Body = class {
  constructor(open, content) {
    this.open = open;
    this.content = content;
  }
  get start() {
    return this.open;
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
  get start() {
    return this.condition.start;
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
  get start() {
    return this.condition.start;
  }
  toString() {
    return `While(
	${this.condition} 
	${this.body})`;
  }
};
var MacroDeclaration = class {
  constructor(name, args, body) {
    this.name = name;
    this.args = args;
    this.body = body;
  }
  get start() {
    return this.name.start;
  }
  toString() {
    return `MacroDecl(${this.name} ${this.args.join(", ")};
${this.body})`;
  }
};
var MacroCall = class {
  constructor(name, args) {
    this.name = name;
    this.args = args;
  }
  get start() {
    return this.name.start;
  }
  toString() {
    return `MacroCall(${this.name} ${this.args.join(", ")}})`;
  }
};
var Declaration = class {
  constructor(vartype, name, expr) {
    this.vartype = vartype;
    this.name = name;
    this.expr = expr;
  }
  get start() {
    return this.vartype.start;
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
  get start() {
    return this.name.start;
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
  get start() {
    return this.token;
  }
  toString() {
    return `VarType(${this.type} ${this.token})`;
  }
};
var Number = class {
  constructor(token) {
    this.token = token;
  }
  get start() {
    return this.token;
  }
  toString() {
    return `Number(${this.token})`;
  }
};
var Identifier = class {
  constructor(token) {
    this.token = token;
  }
  get start() {
    return this.token;
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
  get start() {
    return this.expr1.start;
  }
  toString() {
    return `BinOp(${this.expr1} ${this.op} ${this.expr2})`;
  }
};
var ArrayLiteral = class {
  constructor(open, items) {
    this.open = open;
    this.items = items;
  }
  get start() {
    return this.open;
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
  get start() {
    return this.array.start;
  }
  toString() {
    return `ArrayAccess(${this.array} ${this.index})`;
  }
};

// src/codegen.ts
var Asm = class {
  constructor(source) {
    this.source = source;
    this.instrs = [];
  }
  instrs;
  toString() {
    return this.instrs.join("\n");
  }
  putLI(dest, value) {
    this.instrs.push("IMM R" + dest + " " + value);
  }
  putLOAD(reg, addr) {
    this.instrs.push("LOD R" + reg + " #" + addr);
  }
  putSTORE(addr, reg) {
    this.instrs.push("STR #" + addr + " R" + reg);
  }
  putADD(dest, srcA, srcB) {
    this.instrs.push("ADD R" + dest + " R" + srcA + " R" + srcB);
  }
  putSUB(dest, srcA, srcB) {
    this.instrs.push("SUB R" + dest + " R" + srcA + " R" + srcB);
  }
  putMULT(dest, srcA, srcB) {
    this.instrs.push("MULT R" + dest + " R" + srcA + " R" + srcB);
  }
  putDIV(dest, srcA, srcB) {
    this.instrs.push("DIV R" + dest + " R" + srcA + " R" + srcB);
  }
  putBRANCH(instr, label, left, right) {
    this.instrs.push(instr + " " + label + " R" + left + " R" + right);
  }
  putLABEL(label) {
    this.instrs.push(label);
  }
  putJMP(label) {
    this.instrs.push("JMP " + label);
  }
};
var CodeGeneration = class {
  allocator;
  label;
  asmList;
  constructor(maxRegisters) {
    this.asmList = [];
    this.allocator = new Allocator(maxRegisters);
    this.label = 0;
  }
  gen(astNodes) {
    for (const astNode of astNodes) {
      this.genStatement(astNode);
    }
    return this.asmList;
  }
  genStatement(statement) {
    const asm = new Asm(statement);
    if (statement instanceof Declaration) {
      this.genDeclaration(asm, statement);
      this.asmList.push(asm);
    } else if (statement instanceof Assignment) {
      this.genAssignment(asm, statement);
      this.asmList.push(asm);
    } else if (statement instanceof IfStatement) {
      this.genIfStatement(statement, void 0);
    } else if (statement instanceof WhileStatement) {
      this.genWhileStatement(asm, statement);
      this.asmList.push(asm);
    } else {
      return;
    }
  }
  genBody(body) {
    for (const statement of body.content) {
      this.genStatement(statement);
    }
  }
  genWhileStatement(asm, whileStatement) {
    const endLabel = this.genLabel();
    const startLabel = this.genLabel();
    const startAsm = new Asm(whileStatement.condition);
    startAsm.putLABEL(startLabel);
    this.genCondition(startAsm, whileStatement.condition, endLabel);
    this.asmList.push(startAsm);
    this.genBody(whileStatement.body);
    asm.putJMP(startLabel);
    asm.putLABEL(endLabel);
  }
  genIfStatement(ifStatement, endLabel) {
    let label = this.genLabel();
    if (ifStatement.child != void 0 && endLabel === void 0) {
      endLabel = this.genLabel();
    }
    if (ifStatement.child === void 0 && endLabel != void 0) {
      label = endLabel;
    }
    const condAsm = new Asm(ifStatement.condition);
    this.genCondition(condAsm, ifStatement.condition, label);
    this.asmList.push(condAsm);
    this.genBody(ifStatement.body);
    const asm = new Asm(ifStatement);
    if (ifStatement.child != void 0 && endLabel != void 0) {
      asm.putJMP(endLabel);
    }
    asm.putLABEL(label);
    this.asmList.push(asm);
    if (ifStatement.child instanceof IfStatement) {
      this.genIfStatement(ifStatement.child, endLabel);
    } else if (ifStatement.child instanceof Body) {
      this.genBody(ifStatement.child);
      const elseAsm = new Asm(ifStatement.child);
      if (endLabel != void 0) {
        elseAsm.putLABEL(endLabel);
        this.asmList.push(elseAsm);
      } else {
        console.log("ERROR");
      }
    }
  }
  genCondition(asm, condition, endLabel) {
    if (!(condition instanceof BinaryOp)) {
      return asm;
    }
    const reg1 = this.genExpression(asm, condition.expr1);
    const reg2 = this.genExpression(asm, condition.expr2);
    const op = condition.op.value;
    switch (op) {
      case ">": {
        asm.putBRANCH("BLE", endLabel, reg1, reg2);
        break;
      }
      case ">=": {
        asm.putBRANCH("BRL", endLabel, reg1, reg2);
        break;
      }
      case "<": {
        asm.putBRANCH("BGE", endLabel, reg1, reg2);
        break;
      }
      case "<=": {
        asm.putBRANCH("BRG", endLabel, reg1, reg2);
        break;
      }
      case "==": {
        asm.putBRANCH("BNE", endLabel, reg1, reg2);
        break;
      }
      case "!=": {
        asm.putBRANCH("BRE", endLabel, reg1, reg2);
        break;
      }
      default: {
      }
    }
    this.allocator.setFreeRegister(reg1);
    this.allocator.setFreeRegister(reg2);
    return asm;
  }
  genLabel() {
    this.label++;
    return ".LABEL_" + this.label;
  }
  genDeclaration(asm, dec) {
    const varType = dec.vartype;
    const varName = dec.name.token.value;
    const addr = this.allocator.addVariable(varName);
    if (dec.expr) {
      const reg = this.genExpression(asm, dec.expr);
      asm.putSTORE(addr, reg);
      this.allocator.setFreeRegister(reg);
    }
  }
  genAssignment(asm, assign) {
    const varName = assign.name.token.value;
    const addr = this.allocator.hasVariable(varName);
    if (addr == -1) {
      return;
    }
    const reg = this.genExpression(asm, assign.expr);
    asm.putSTORE(addr, reg);
    this.allocator.setFreeRegister(reg);
  }
  genExpression(asm, expr) {
    if (expr instanceof Number) {
      const reg = this.allocator.getFreeRegister();
      asm.putLI(reg, parseInt(expr.token.value, 10));
      return reg;
    } else if (expr instanceof Identifier) {
      const memAddr = this.allocator.addVariable(expr.token.value);
      const reg = this.allocator.getFreeRegister();
      asm.putLOAD(reg, memAddr);
      return reg;
    } else if (expr instanceof BinaryOp) {
      const reg1 = this.genExpression(asm, expr.expr1);
      const reg2 = this.genExpression(asm, expr.expr2);
      switch (expr.op.value) {
        case "+": {
          asm.putADD(reg1, reg1, reg2);
          break;
        }
        case "-": {
          asm.putSUB(reg1, reg1, reg2);
          break;
        }
        case "*": {
          asm.putMULT(reg1, reg1, reg2);
          break;
        }
        case "/": {
          asm.putDIV(reg1, reg1, reg2);
          break;
        }
        default: {
        }
      }
      this.allocator.setFreeRegister(reg2);
      return reg1;
    } else {
      return -1;
    }
  }
};
var Allocator = class {
  varToMemory;
  memory;
  registers;
  constructor(maxRegisters) {
    this.varToMemory = {};
    this.registers = new Array(maxRegisters);
    this.registers.fill(false);
    this.memory = new Array(512);
    this.memory.fill(false);
  }
  hasVariable(varName) {
    if (varName in this.varToMemory) {
      return this.varToMemory[varName];
    }
    return -1;
  }
  addVariable(varName) {
    if (varName in this.varToMemory) {
      return this.varToMemory[varName];
    }
    const addr = this.getFreeMemory();
    this.varToMemory[varName] = addr;
    return addr;
  }
  getFreeRegister() {
    const addr = this.registers.indexOf(false);
    this.registers[addr] = true;
    return addr + 1;
  }
  getFreeMemory() {
    const addr = this.memory.indexOf(false);
    this.memory[addr] = true;
    return addr + 1;
  }
  setFreeRegister(reg) {
    reg--;
    this.registers[reg] = false;
  }
  setFreeMemory(mem) {
    mem--;
    this.memory[mem] = false;
  }
};

// src/token.ts
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
  "]": "CLOSE_SQUARE" /* CLOSE_SQUARE */,
  " ": "WHITESPACE" /* WHITESPACE */
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
          const start = buf.pos;
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
            tokens.push(new Token(symbol_kind, line.substring(start), line, lineno, start));
          } else {
            tokens.push(new Token(symbol_kind, current, line, lineno, start));
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
var debug = true;
var Info = class {
  constructor(token, msg, level = "Error" /* Error */) {
    this.token = token;
    this.msg = msg;
    this.level = level;
    if (debug) {
      this.error = new Error();
    }
  }
  error;
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
      output += " ".repeat(this.token.start) + "^";
    }
    if (this.error) {
      console.error(this.error);
      output += "\n" + this.error.stack;
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
    this.errors.push(new Info(token, msg));
  }
  error_msg(msg) {
    this.errors.push(new Info(void 0, msg));
  }
  warn(token, msg) {
    this.warnings.push(new Info(token, msg, "Warning" /* Warning */));
  }
  warn_msg(msg) {
    this.warnings.push(new Info(void 0, msg, "Warning" /* Warning */));
  }
  info(token, msg) {
    this.infos.push(new Info(token, msg, "Info" /* Info */));
  }
  info_msg(msg) {
    this.infos.push(new Info(void 0, msg, "Info" /* Info */));
  }
  toString() {
    let messages = "";
    if (this.errors.length > 0) {
      messages += "[ERRORS]:\n";
    }
    for (const error of this.errors) {
      messages += error.toString() + "\n";
    }
    if (this.warnings.length > 0) {
      messages += "[WARNINGS]:\n";
    }
    for (const error of this.warnings) {
      messages += error.toString() + "\n";
    }
    if (this.warnings.length > 0) {
      messages += "[INFO]:\n";
    }
    for (const error of this.infos) {
      messages += error.toString() + "\n";
    }
    return messages;
  }
  print_errors() {
    console.error(this.toString());
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
__publicField(Prim, "ERROR", new _Prim("UINT"));
__publicField(Prim, "UINT", new _Prim("UINT"));
__publicField(Prim, "CHAR", new _Prim("CHAR"));
__publicField(Prim, "BOOL", new _Prim("BOOL"));
var NoType = Prim.ERROR;

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
        return new ArrayLiteral(current, items);
      }
      items.push(parseExpression(parser));
      while (!parser.buf.current.eq("CLOSE_SQUARE" /* CLOSE_SQUARE */)) {
        parser.buf.expect("COMMA" /* COMMA */);
        items.push(parseExpression(parser));
      }
      parser.buf.next();
      return new ArrayLiteral(current, items);
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
  const identifier = new Identifier(parser.buf.expect("IDENTIFIER" /* IDENTIFIER */));
  const operators = ["PLUS" /* PLUS */, "MINUS" /* MINUS */, "MULT" /* MULT */, "DIV" /* DIV */];
  let op;
  if (operators.includes(parser.buf.current.kind)) {
    op = parser.buf.current;
    parser.buf.next();
  }
  parser.buf.expect("EQUAL" /* EQUAL */);
  let expr = parseExpression(parser);
  if (op != void 0) {
    expr = new BinaryOp(identifier, op, expr);
  }
  parser.buf.expect("SEMICOLON" /* SEMICOLON */);
  return new Assignment(identifier, expr);
}

// src/parser/bodyparser.ts
function parseBody(parser) {
  const open = parser.buf.current;
  parser.buf.expect("OPEN_BRACE" /* OPEN_BRACE */);
  const content = [];
  while (!parser.buf.current.eq("CLOSE_BRACE" /* CLOSE_BRACE */)) {
    content.push(parseStatement(parser));
  }
  parser.buf.next();
  return new Body(open, content);
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
    const binop = new BinaryOp(condition, new Token("COND_NE" /* COND_NE */, "!=", condition.token.line, condition.token.lineno, condition.token.start), new Number(new Token("NUMBER" /* NUMBER */, "0", condition.token.line, condition.token.lineno, condition.token.start)));
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
    tokens = tokens.filter((token) => token.kind !== "WHITESPACE" /* WHITESPACE */ && token.kind !== "COMMENT" /* COMMENT */);
    const ast_nodes = [];
    this.buf.set(tokens);
    while (!this.buf.done) {
      ast_nodes.push(parseStatement(this));
    }
    return ast_nodes;
  }
};

// src/typecheck/variable.ts
var Variable = class {
  constructor(scope, type) {
    this.scope = scope;
    this.type = type;
  }
};

// src/typecheck/scope.ts
var Scopes = class {
  top = new Scope();
  put(name, type) {
    return this.top.put(name, type);
  }
  get(name) {
    return this.top.get(name);
  }
  push() {
    this.top = new Scope(this.top);
  }
  pop() {
    if (this.top.parent === void 0) {
      return false;
    }
    this.top = this.top.parent;
    return true;
  }
};
var Scope = class {
  constructor(parent) {
    this.parent = parent;
  }
  variables = {};
  put(name, type) {
    if (this.get(name)) {
      return void 0;
    }
    const variable = new Variable(this, type);
    this.variables[name] = variable;
  }
  get(name) {
    return this.variables[name] ?? this.parent?.get(name);
  }
};

// src/typecheck/exprchecker.ts
function checkCondition(checker, node) {
  checkExpr(checker, node);
  checker.expect(node, Prim.BOOL);
}
function checkExpr(checker, node) {
  if (node instanceof BinaryOp) {
    return checkBinaryOp(checker, node);
  } else if (node instanceof Number) {
    return checker.set(node, Prim.UINT);
  } else if (node instanceof Identifier) {
    const variable = checker.scopes.get(node.token.value);
    console.log(checker.scopes);
    if (!variable) {
      checker.err.error(node.token, `Variable is undefined`);
      return checker.set(node, NoType);
    }
    console.log(variable, node);
    return checker.set(node, variable.type);
  } else if (node instanceof ArrayLiteral) {
    return checkArrayLiteral(checker, node);
  } else if (node instanceof ArrayAccess) {
    return checkArrayAccess(checker, node);
  }
}
function checkArrayLiteral(checker, node) {
  if (node.items.length == 0) {
    checker.err.error(node.start, "Empty array");
    return checker.set(node, NoType);
  }
  const type = checkExpr(checker, node.items[0]);
  for (let i = 1; i < node.items.length; i++) {
    const other = checkExpr(checker, node.items[i]);
    if (type && other !== type) {
      checker.err.error(node.items[i].start, "Types should match within an array");
    }
  }
  if (!type) {
    return checker.set(node, NoType);
  }
  return checker.set(node, new ArrayType(type));
}
function checkArrayAccess(checker, node) {
  const array = checkExpr(checker, node.array);
  if (!(array instanceof ArrayType)) {
    checker.err.error(node.array.start, "Value is not indexable");
  }
  const index = checkExpr(checker, node.index);
  if (index === Prim.UINT) {
    checker.err.error(node.index.start, "Index should be a uint");
  }
  if (array instanceof ArrayType) {
    return checker.set(node, array.iner);
  }
  return checker.set(node, NoType);
}
function checkBinaryOp(checker, node) {
  const left = checkExpr(checker, node.expr1);
  const right = checkExpr(checker, node.expr2);
  if (left === NoType || right === NoType) {
    console.log(">>>>", checker.type(node.expr1), left, node.expr2, right);
    return checker.set(node, NoType);
  }
  if (left !== right) {
    checker.err.error(node.op, `Type ${left} and ${right} do not match`);
    return checker.set(node, NoType);
  }
  switch (node.op.kind) {
    case "COND_E" /* COND_E */:
    case "COND_NE" /* COND_NE */:
    case "COND_GE" /* COND_GE */:
    case "COND_G" /* COND_G */:
    case "COND_LE" /* COND_LE */:
    case "COND_L" /* COND_L */: {
      console.log("node", node);
      checker.expect(node.expr1, Prim.UINT, Prim.CHAR);
      checker.expect(node.expr2, Prim.UINT, Prim.CHAR);
      return checker.set(node, Prim.BOOL);
    }
    default:
      return checker.set(node, left);
  }
}

// src/typecheck/typechecker.ts
var TypeChecker = class {
  constructor(err) {
    this.err = err;
  }
  types = /* @__PURE__ */ new Map();
  scopes = new Scopes();
  popScope() {
    if (!this.scopes.pop()) {
      this.err.throw_msg("Poped last scope");
    }
  }
  check(tree) {
    for (const node of tree) {
      checkStatement(this, node);
    }
  }
  type(tree) {
    return this.types.get(tree);
  }
  set(tree, type) {
    this.types.set(tree, type);
    return type;
  }
  expect(tree, ...types) {
    const type = this.type(tree);
    if (type === void 0) {
      console.log("no type", tree);
      this.err.warn(tree.start, `Missing type on node ${tree}`);
      return this.set(tree, NoType);
    }
    for (const expect of types) {
      if (type.eq(expect)) {
        return type;
      }
    }
    return this.set(tree, NoType);
  }
};
function checkStatement(checker, node) {
  if (node instanceof Body) {
    checkBody(checker, node);
  } else if (node instanceof IfStatement) {
    checkIf(checker, node);
  } else if (node instanceof WhileStatement) {
    checkWhile(checker, node);
  } else if (node instanceof Assignment) {
    checkAssignment(checker, node);
  } else if (node instanceof Declaration) {
    checkDeclaration(checker, node);
  } else if (node instanceof MacroDeclaration) {
    checkMacroDeclaration(checker, node);
  } else if (node instanceof MacroCall) {
    checkMacroCall(checker, node);
  }
}
function checkBody(checker, tree) {
  checker.scopes.push();
  for (const statement of tree.content) {
    checkStatement(checker, statement);
  }
  checker.popScope();
}
function checkIf(checker, tree) {
  checkCondition(checker, tree.condition);
  checkBody(checker, tree.body);
  if (tree.child) {
    checkStatement(checker, tree.child);
  }
}
function checkWhile(checker, tree) {
  checkCondition(checker, tree.condition);
  checkStatement(checker, tree.body);
}
function checkAssignment(checker, tree) {
  checkExpr(checker, tree.expr);
}
function checkDeclaration(checker, tree) {
  checker.scopes.put(tree.name.token.value, Prim.UINT);
  if (tree.expr) {
    checkExpr(checker, tree.expr);
  }
}
function checkMacroDeclaration(checker, tree) {
}
function checkMacroCall(checker, tree) {
}

// web/editor/l.ts
function l(tagOrElement = "DIV", attributes = {}, ...children) {
  const element = typeof tagOrElement === "string" ? document.createElement(tagOrElement) : tagOrElement;
  attribute(element, attributes);
  element.append(...children);
  return element;
}
function attribute(element, attributes) {
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === "object") {
      attribute(element[key], value);
    } else {
      element[key] = value;
    }
  }
}

// web/editor/editor.ts
var Editor_Window = class extends HTMLElement {
  line_nrs;
  code;
  input;
  colors;
  profiled = [];
  profile_present = false;
  lines = [];
  tab_width = 4;
  constructor() {
    super();
    l(this, {}, this.line_nrs = l("div", { className: "line-nrs" }), this.code = l("div", { className: "code" }, this.input = l("textarea", { spellcheck: false }), this.colors = l("code", { className: "colors" })));
    this.input.addEventListener("input", this.input_cb.bind(this));
    this.input.addEventListener("keydown", this.keydown_cb.bind(this));
    const resize_observer = new ResizeObserver(() => this.render_lines());
    resize_observer.observe(this);
    this.onscroll = () => this.render_lines();
  }
  get value() {
    return this.input.value;
  }
  set value(value) {
    this.input.value = value;
    this.input_cb();
  }
  pc_line = 0;
  set_pc_line(line) {
    const old = this.line_nrs.children[this.pc_line];
    if (old) {
      old.classList.remove("pc-line");
    }
    const child = this.line_nrs.children[line];
    if (child) {
      child.classList.add("pc-line");
    }
    this.pc_line = line;
  }
  keydown_cb(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      let start = this.input.selectionStart;
      let end = this.input.selectionEnd;
      if (!event.shiftKey && start === end) {
        const value = this.input.value;
        const line_offset = start - line_start(value, start);
        const add_count = this.tab_width - line_offset % this.tab_width || this.tab_width;
        this.input.value = str_splice(value, start, 0, " ".repeat(add_count));
        this.input.selectionStart = this.input.selectionEnd = start + add_count;
      }
      this.input_cb();
    }
  }
  input_cb() {
    this.render_lines();
    this.call_input_listeners();
  }
  render_lines() {
    this.input.style.height = "0px";
    const height = this.input.scrollHeight;
    this.input.style.height = height + "px";
    this.input.style.width = "0px";
    this.input.style.width = this.input.scrollWidth + "px";
    const lines = this.input.value.split("\n");
    this.lines = lines;
    {
      const width = (lines.length + "").length;
      const start_lines = this.line_nrs.children.length;
      const delta_lines = lines.length - start_lines;
      if (delta_lines > 0) {
        for (let i = 0; i < delta_lines; i++) {
          const div2 = this.line_nrs.appendChild(document.createElement("div"));
          div2.textContent = ("" + (start_lines + i + 1)).padStart(width);
        }
      } else {
        for (let i = 0; i < -delta_lines; i++) {
          this.line_nrs.lastChild?.remove();
        }
      }
    }
    const ch = this.input.scrollHeight / Math.max(1, this.lines.length);
    const pixel_start = this.scrollTop;
    const pixel_end = Math.min(pixel_start + this.clientHeight, this.input.scrollHeight);
    const start = Math.floor(pixel_start / ch);
    const end = Math.min(this.lines.length, Math.ceil(pixel_end / ch));
    this.colors.style.top = start * ch + "px";
    let div = this.colors.firstElementChild;
    const all_tokens = lex(this.lines);
    console.log(all_tokens);
    let token_i = 0;
    for (let i = start; i < end; i++) {
      const line = this.lines[i].replaceAll("\r", "");
      if (div === null) {
        div = document.createElement("div");
        this.colors.appendChild(div);
      }
      div.innerHTML = "";
      let start2 = 0;
      let span = div.firstElementChild;
      if (line.length == 0) {
        div.innerHTML = "<span> </span>";
      } else {
        while (token_i < all_tokens.length) {
          const token = all_tokens[token_i];
          if (token.lineno > i + 1) {
            break;
          }
          console.log(token.start, start2);
          if (token.start > start2 - 1) {
            document.title = "wtf";
            if (span === null) {
              span = document.createElement("span");
              div.appendChild(span);
            }
            span.textContent = " ".repeat(token.start - start2);
            span.className = "white";
            span = span.nextElementSibling;
          }
          start2 = token.start + token.value.length;
          token_i += 1;
          if (span === null) {
            span = document.createElement("span");
            div.appendChild(span);
          }
          span.textContent = token.value;
          span.className = token.kind;
          span = span.nextElementSibling;
        }
      }
      while (span !== null) {
        const next = span.nextElementSibling;
        div.removeChild(span);
        span = next;
      }
      div = div.nextElementSibling;
    }
    while (div !== null) {
      const next = div.nextElementSibling;
      this.colors.removeChild(div);
      div = next;
    }
  }
  call_input_listeners() {
    for (const listener of this.input_listeners) {
      listener.call(this, new Event("input"));
    }
  }
  input_listeners = [];
  set oninput(cb) {
    this.input_listeners.push(cb);
  }
};
customElements.define("editor-window", Editor_Window);
function str_splice(string, index, delete_count, insert) {
  return string.slice(0, index) + insert + string.slice(index + delete_count);
}
function line_start(string, index) {
  let i = 0, line_start2 = 0;
  for (; i <= index; i = string.indexOf("\n", i) + 1 || string.length) {
    line_start2 = i;
    if (i >= string.length) {
      line_start2 + 1;
      break;
    }
  }
  return line_start2;
}

// web/index.ts
console.log("hello world");
{
  let select = function(select2) {
    for (let i = 0; i < divs.length; i++) {
      if (i === select2) {
        divs[i].classList.remove("hidden");
      } else {
        divs[i].classList.add("hidden");
      }
    }
  };
  const output_container = document.getElementById("outputs");
  const buttons = output_container.querySelectorAll("nav button");
  const divs = output_container.querySelectorAll("div");
  select(2);
  buttons.forEach((button, i) => {
    button.onclick = (e) => select(i);
  });
}
{
  let oninput = function() {
    errorOutput.value = "";
    lexOutput.value = "";
    parseOutput.value = "";
    error_button.classList.remove("error");
    try {
      const results = lex(code.value.split("\n"));
      let lexString = "";
      for (const r of results) {
        lexString += r + "\n";
      }
      lexOutput.value = lexString;
      const parser = new Parser();
      const parseResults = parser.parse(results);
      let parseString = "";
      for (const r of parseResults) {
        console.log(r);
        parseString += r.toString() + "\n";
      }
      parseOutput.value = parseString;
      const checkResults = new TypeChecker(parser.err).check(parseResults);
      const codegen = new CodeGeneration(7);
      const asms = codegen.gen(parseResults);
      let result = "";
      for (const asm of asms) {
        console.log(asm);
        const token = asm.source.start;
        let instrsInAsm = asm.instrs;
        for (const instr of instrsInAsm) {
          result += instr + "\n";
        }
        result += "\n";
      }
      console.log(result);
      console.log(codegenOutput);
      codegenOutput.value = result;
      console.log(parser.err);
      if (parser.err.has_error()) {
        errorOutput.value = parser.err.toString();
        error_button.classList.add("error");
      }
    } catch (e) {
      if (e instanceof Error) {
        errorOutput.value = "[ERROR]:\n" + e.message;
      }
      error_button.classList.add("error");
    }
  };
  const code = document.getElementById("code");
  const errorOutput = document.getElementById("error");
  const lexOutput = document.getElementById("lexer");
  const parseOutput = document.getElementById("parser");
  const codegenOutput = document.getElementById("urcl");
  const error_button = document.getElementById("error-button");
  code.oninput = oninput;
  ;
  oninput();
}
//# sourceMappingURL=index.js.map
