// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

var Kind;
(function(Kind) {
    Kind["VAR_TYPE"] = "VAR_TYPE";
    Kind["IDENTIFIER"] = "IDENTIFIER";
    Kind["NUMBER"] = "NUMBER";
    Kind["EQUAL"] = "EQUAL";
    Kind["PLUS"] = "PLUS";
    Kind["MINUS"] = "MINUS";
    Kind["MULT"] = "MULT";
    Kind["DIV"] = "DIV";
    Kind["MACROCALL"] = "MACROCALL";
    Kind["COMMENT"] = "COMMENT";
    Kind["OPEN_BRACE"] = "OPEN_BRACE";
    Kind["CLOSE_BRACE"] = "CLOSE_BRACE";
    Kind["IF"] = "IF";
    Kind["ELSE"] = "ELSE";
    Kind["ELIF"] = "ELIF";
    Kind["WHILE"] = "WHILE";
    Kind["MACRO"] = "MACRO";
    Kind["COND_G"] = "COND_G";
    Kind["COND_L"] = "COND_L";
    Kind["COND_E"] = "COND_E";
    Kind["COND_LE"] = "COND_LE";
    Kind["COND_NE"] = "COND_NE";
    Kind["COND_GE"] = "COND_GE";
    Kind["COMMA"] = "COMMA";
    Kind["OPEN_PARAN"] = "OPEN_PARAN";
    Kind["CLOSE_PARAN"] = "CLOSE_PARAN";
    Kind["OPEN_SQUARE"] = "OPEN_SQUARE";
    Kind["CLOSE_SQUARE"] = "CLOSE_SQUARE";
    Kind["SEMICOLON"] = "SEMICOLON";
    Kind["NONE"] = "NONE";
})(Kind || (Kind = {}));
class Token {
    constructor(kind, value, line, lineno, start){
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
    kind;
    value;
    line;
    lineno;
    start;
}
export { Kind as Kind };
export { Token as Token };
class Buffer {
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
            this.current = '\0';
        }
        return this.current;
    }
}
const keywords = {
    "uint": Kind.VAR_TYPE,
    "char": Kind.VAR_TYPE,
    "if": Kind.IF,
    "else": Kind.ELSE,
    "elif": Kind.ELIF,
    "while": Kind.WHILE,
    "macro": Kind.MACRO
};
const symbols = {
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
    ']': Kind.CLOSE_SQUARE
};
const double_symbols = {
    "==": Kind.COND_E,
    ">=": Kind.COND_GE,
    "<=": Kind.COND_LE,
    "!=": Kind.COND_NE,
    "//": Kind.COMMENT
};
function lex(lines, file_name = "<eval>") {
    const tokens = [];
    const buf = new Buffer();
    let lineno = 0;
    for (const line of lines){
        lineno++;
        buf.set(line);
        while(!buf.done){
            if (isDigit(buf.current)) {
                const start = buf.pos;
                let num = buf.current;
                while(isDigit(buf.next())){
                    num += buf.current;
                }
                tokens.push(new Token(Kind.NUMBER, num, line, lineno, start));
            } else if (isAlpha(buf.current)) {
                const start1 = buf.pos;
                let word = buf.current;
                while(isAlpha(buf.next())){
                    word += buf.current;
                }
                let kind = Kind.IDENTIFIER;
                if (word in keywords) {
                    kind = keywords[word];
                }
                if (buf.current === "!") {
                    buf.next();
                    kind = Kind.MACROCALL;
                }
                tokens.push(new Token(kind, word, line, lineno, start1));
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
                    if (symbol_kind === Kind.COMMENT) {
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
export { lex as lex };
class TokenBuffer {
    constructor(err){
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
            this.current = new Token(Kind.NONE, this.lastToken.value, this.lastToken.line, this.lastToken.lineno, this.lastToken.start);
        }
        return this.current;
    }
    next_if(kind) {
        const c = this.current;
        if (c.eq(kind)) {
            this.next();
            return c;
        }
        return undefined;
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
    err;
}
var ErrorLevel;
(function(ErrorLevel) {
    ErrorLevel["Info"] = "Info";
    ErrorLevel["Warning"] = "Warning";
    ErrorLevel["Error"] = "Error";
})(ErrorLevel || (ErrorLevel = {}));
class Info {
    constructor(token, msg, level = "Error"){
        this.token = token;
        this.msg = msg;
        this.level = level;
    }
    static msg(msg) {
        return new Info(undefined, msg);
    }
    toString(file_name = "<eval>") {
        let output = "";
        if (this.token) {
            output += `${file_name}:${this.token.lineno}:${this.token.start}: `;
        }
        output += `${this.level}: ${this.msg}\n`;
        if (this.token) {
            output += `${this.token.line}\n`;
            output += ' '.repeat(this.token.start) + '^';
        }
        return output;
    }
    token;
    msg;
    level;
}
class ErrorContext {
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
        throw new Error(new Info(undefined, msg).toString());
    }
    error(token, msg) {
        this.errors.push(new Info(token, msg));
    }
    error_msg(msg) {
        this.errors.push(new Info(undefined, msg));
    }
    warn(token, msg) {
        this.warnings.push(new Info(token, msg, "Warning"));
    }
    warn_msg(msg) {
        this.warnings.push(new Info(undefined, msg, "Warning"));
    }
    info(token, msg) {
        this.infos.push(new Info(token, msg, "Info"));
    }
    info_msg(msg) {
        this.infos.push(new Info(undefined, msg, "Info"));
    }
    toString() {
        let messages = "";
        if (this.errors.length > 0) {
            messages += "[ERRORS]:\n";
        }
        for (const error of this.errors){
            messages += error.toString() + "\n";
        }
        if (this.warnings.length > 0) {
            messages += "[WARNINGS]:\n";
        }
        for (const error1 of this.warnings){
            messages += error1.toString() + "\n";
        }
        if (this.warnings.length > 0) {
            messages += "[INFO]:\n";
        }
        for (const error2 of this.infos){
            messages += error2.toString() + "\n";
        }
        return messages;
    }
    print_errors() {
        console.error(this.toString());
    }
}
class Body {
    constructor(open, content){
        this.open = open;
        this.content = content;
    }
    get start() {
        return this.open;
    }
    toString() {
        return `Body {\n${this.content.join("\n")}\n}`;
    }
    open;
    content;
}
class IfStatement {
    constructor(condition, body, child){
        this.condition = condition;
        this.body = body;
        this.child = child;
    }
    get start() {
        return this.condition.start;
    }
    toString() {
        return `If(\n\t${this.condition} \n\t${this.body} else \n\t${this.child ?? "nothing"})`;
    }
    condition;
    body;
    child;
}
class WhileStatement {
    constructor(condition, body){
        this.condition = condition;
        this.body = body;
    }
    get start() {
        return this.condition.start;
    }
    toString() {
        return `While(\n\t${this.condition} \n\t${this.body})`;
    }
    condition;
    body;
}
class MacroDeclaration {
    constructor(name, args, body){
        this.name = name;
        this.args = args;
        this.body = body;
    }
    get start() {
        return this.name.start;
    }
    toString() {
        return `MacroDecl(${this.name} ${this.args.join(", ")};\n${this.body})`;
    }
    name;
    args;
    body;
}
class MacroCall {
    constructor(name, args){
        this.name = name;
        this.args = args;
    }
    get start() {
        return this.name.start;
    }
    toString() {
        return `MacroCall(${this.name} ${this.args.join(", ")}})`;
    }
    name;
    args;
}
class Declaration {
    constructor(vartype, name, expr){
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
    vartype;
    name;
    expr;
}
class Assignment {
    constructor(name, expr){
        this.name = name;
        this.expr = expr;
    }
    get start() {
        return this.name.start;
    }
    toString() {
        return `Assignment(${this.name} = ${this.expr})`;
    }
    name;
    expr;
}
class VarType {
    constructor(type, token){
        this.type = type;
        this.token = token;
    }
    get start() {
        return this.token;
    }
    toString() {
        return `VarType(${this.type} ${this.token})`;
    }
    type;
    token;
}
class Number {
    constructor(token){
        this.token = token;
    }
    get start() {
        return this.token;
    }
    toString() {
        return `Number(${this.token})`;
    }
    token;
}
class Identifier {
    constructor(token){
        this.token = token;
    }
    get start() {
        return this.token;
    }
    toString() {
        return `Identifier(${this.token})`;
    }
    token;
}
class BinaryOp {
    constructor(expr1, op, expr2){
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
    expr1;
    op;
    expr2;
}
class ArrayLiteral {
    constructor(open, items){
        this.open = open;
        this.items = items;
    }
    get start() {
        return this.open;
    }
    toString() {
        return `ArrayLit(${this.items.join(", ")})`;
    }
    open;
    items;
}
class ArrayAccess {
    constructor(array, index){
        this.array = array;
        this.index = index;
    }
    get start() {
        return this.array.start;
    }
    toString() {
        return `ArrayAccess(${this.array} ${this.index})`;
    }
    array;
    index;
}
function parseExpression(parser) {
    return genericParseBinOp(parser, parseExprL3, [
        Kind.COND_E,
        Kind.COND_GE,
        Kind.COND_LE,
        Kind.COND_G,
        Kind.COND_L
    ]);
}
function genericParseBinOp(parser, func, kinds) {
    let expr1 = func(parser);
    while(kinds.includes(parser.buf.current.kind)){
        let op = parser.buf.current;
        parser.buf.next();
        let expr2 = func(parser);
        expr1 = new BinaryOp(expr1, op, expr2);
    }
    return expr1;
}
function parseExprL3(parser) {
    return genericParseBinOp(parser, parseExprL2, [
        Kind.PLUS,
        Kind.MINUS
    ]);
}
function parseExprL2(parser) {
    return genericParseBinOp(parser, parseExprL1, [
        Kind.MULT,
        Kind.DIV
    ]);
}
function parseExprL1(parser) {
    const current = parser.buf.current;
    parser.buf.next();
    switch(current.kind){
        case Kind.NUMBER:
            {
                return new Number(current);
            }
        case Kind.IDENTIFIER:
            {
                const identifier = new Identifier(current);
                if (parser.buf.next_if(Kind.OPEN_SQUARE)) {
                    const expr = parseExpression(parser);
                    parser.buf.expect(Kind.CLOSE_SQUARE);
                    return new ArrayAccess(identifier, expr);
                }
                return identifier;
            }
        case Kind.OPEN_SQUARE:
            {
                const items = [];
                if (parser.buf.next_if(Kind.CLOSE_SQUARE)) {
                    return new ArrayLiteral(current, items);
                }
                items.push(parseExpression(parser));
                while(!parser.buf.current.eq(Kind.CLOSE_SQUARE)){
                    parser.buf.expect(Kind.COMMA);
                    items.push(parseExpression(parser));
                }
                parser.buf.next();
                return new ArrayLiteral(current, items);
            }
        case Kind.OPEN_PARAN:
            {
                const expr1 = parseExpression(parser);
                parser.buf.expect(Kind.CLOSE_PARAN);
                return expr1;
            }
        default:
            {
                parser.err.throw(current, "Failed to parser ExprL1");
            }
    }
}
class ArrayType {
    constructor(iner){
        this.iner = iner;
    }
    eq(other) {
        return other instanceof ArrayType && this.iner.eq(other);
    }
    toString() {
        return `${this.iner.toString()}[]`;
    }
    iner;
}
class Prim {
    constructor(name){
        this.name = name;
    }
    eq(other) {
        return this === other;
    }
    static UINT = new Prim("UINT");
    static Char = new Prim("CHAR");
    static Bool = new Prim("BOOL");
    toString() {
        return this.name;
    }
    name;
}
function parseDeclaration(parser) {
    const typeToken = parser.buf.expect(Kind.VAR_TYPE);
    let iner;
    if (typeToken.value == "uint") {
        iner = Prim.UINT;
    } else {
        parser.err.throw(typeToken, "Unknown type");
    }
    if (parser.buf.next_if(Kind.OPEN_SQUARE)) {
        parser.buf.expect(Kind.CLOSE_SQUARE);
        iner = new ArrayType(iner);
    }
    const vartype = new VarType(iner, typeToken);
    const identifier = parser.buf.expect(Kind.IDENTIFIER);
    if (parser.buf.next_if(Kind.EQUAL)) {
        const expr = parseExpression(parser);
        parser.buf.try_expect(Kind.SEMICOLON);
        return new Declaration(vartype, new Identifier(identifier), expr);
    }
    return new Declaration(vartype, new Identifier(identifier));
}
function parseAssignment(parser) {
    const identifier = parser.buf.expect(Kind.IDENTIFIER);
    parser.buf.expect(Kind.EQUAL);
    const expr = parseExpression(parser);
    parser.buf.expect(Kind.SEMICOLON);
    return new Assignment(new Identifier(identifier), expr);
}
function parseStatement(parser) {
    switch(parser.buf.current.kind){
        case Kind.VAR_TYPE:
            return parseDeclaration(parser);
        case Kind.IDENTIFIER:
            return parseAssignment(parser);
        case Kind.IF:
            return parseIfStatement(parser);
        case Kind.WHILE:
            return parseWhileStatement(parser);
        case Kind.OPEN_BRACE:
            return parseBody(parser);
        default:
            parser.err.throw(parser.buf.current, "");
    }
}
function parseBody(parser) {
    const open = parser.buf.current;
    parser.buf.expect(Kind.OPEN_BRACE);
    const content = [];
    while(!parser.buf.current.eq(Kind.CLOSE_BRACE)){
        content.push(parseStatement(parser));
    }
    parser.buf.next();
    return new Body(open, content);
}
function parseIfStatement(parser) {
    parser.buf.next();
    const condition = parseExpression(parser);
    const body = parseBody(parser);
    if (parser.buf.next_if(Kind.ELSE)) {
        const elseBody = parseBody(parser);
        return new IfStatement(condition, body, elseBody);
    } else if (parser.buf.current.eq(Kind.ELIF)) {
        const elsePart = parseIfStatement(parser);
        return new IfStatement(condition, body, elsePart);
    }
    return new IfStatement(condition, body, undefined);
}
function parseWhileStatement(parser) {
    parser.buf.expect(Kind.WHILE);
    const condition = parseExpression(parser);
    if (condition instanceof Number || condition instanceof Identifier) {
        new BinaryOp(condition, new Token(Kind.COND_NE, "!=", condition.token.line, condition.token.lineno, condition.token.start), new Number(new Token(Kind.NUMBER, "0", condition.token.line, condition.token.lineno, condition.token.start)));
    }
    const body = parseBody(parser);
    return new WhileStatement(condition, body);
}
class Parser {
    err;
    buf;
    constructor(){
        this.err = new ErrorContext();
        this.buf = new TokenBuffer(this.err);
    }
    parse(tokens) {
        const ast_nodes = [];
        this.buf.set(tokens);
        while(!this.buf.done){
            ast_nodes.push(parseStatement(this));
        }
        return ast_nodes;
    }
}
export { Parser as Parser };
class Variable {
    constructor(scope, type){
        this.scope = scope;
        this.type = type;
    }
    scope;
    type;
}
class Scopes {
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
        if (this.top.parent === undefined) {
            return false;
        }
        this.top = this.top.parent;
        return true;
    }
}
class Scope {
    variables;
    constructor(parent){
        this.parent = parent;
        this.variables = {};
    }
    put(name, type) {
        if (this.get(name)) {
            return undefined;
        }
        const variable = new Variable(this, type);
        this.variables[name] = variable;
    }
    get(name) {
        return this.variables[name] ?? this.parent?.get(name);
    }
    parent;
}
function checkExpr(checker, node) {
    if (node instanceof BinaryOp) {
        checkBinaryOp(checker, node);
    } else if (node instanceof Number) {
        return Prim.UINT;
    } else if (node instanceof Identifier) {
        const variable = checker.scopes.get(node.token.value);
        console.log(checker.scopes);
        if (!variable) {
            checker.err.error(node.token, `Variable is undefined`);
            return undefined;
        }
        return variable.type;
    } else if (node instanceof ArrayLiteral) {
        if (node.items.length == 0) {
            checker.err.error(node.start, "Empty array");
            return;
        }
        const type = checkExpr(checker, node.items[0]);
        for(let i = 1; i < node.items.length; i++){
            const other = checkExpr(checker, node.items[i]);
            if (type && other !== type) {
                checker.err.error(node.items[i].start, "Types should match within an array");
            }
        }
        if (!type) {
            return;
        }
        return new ArrayType(type);
    } else if (node instanceof ArrayAccess) {
        const array = checkExpr(checker, node.array);
        if (!(array instanceof ArrayType)) {
            checker.err.error(node.array.start, "Value is not indexable");
        }
        const index = checkExpr(checker, node.index);
        if (index === Prim.UINT) {
            checker.err.error(node.index.start, "Index should be a uint");
        }
        if (array instanceof ArrayType) {
            return array.iner;
        }
    }
}
function checkBinaryOp(checker, node) {
    const left = checkExpr(checker, node.expr1);
    const right = checkExpr(checker, node.expr2);
    if (left === undefined || right === undefined) {
        return;
    }
    if (left !== right) {
        checker.err.error(node.op, "Type of left and right-hand side do not match");
        return;
    }
    switch(node.op.kind){
        case Kind.COND_E:
        case Kind.COND_NE:
        case Kind.COND_GE:
        case Kind.COND_G:
        case Kind.COND_LE:
        case Kind.COND_L:
            return Prim.Bool;
        default:
            return left;
    }
}
class TypeChecker {
    constructor(err){
        this.err = err;
        this.types = new Map();
        this.scopes = new Scopes();
    }
    types;
    scopes;
    popScope() {
        if (!this.scopes.pop()) {
            this.err.throw_msg("Poped last scope");
        }
    }
    check(tree) {
        for (const node of tree){
            checkStatement(this, node);
        }
    }
    err;
}
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
    for (const statement of tree.content){
        checkStatement(checker, statement);
    }
    checker.popScope();
}
function checkIf(checker, tree) {
    checkExpr(checker, tree.condition);
    checkBody(checker, tree.body);
    if (tree.child) {
        checkStatement(checker, tree.child);
    }
}
function checkWhile(checker, tree) {
    checkExpr(checker, tree.condition);
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
function checkMacroDeclaration(checker, tree) {}
function checkMacroCall(checker, tree) {}
export { TypeChecker as TypeChecker };
class Asm {
    instrs;
    constructor(){
        this.instrs = [];
    }
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
        this.instrs.push(instr + " " + label + " " + left + " " + right);
    }
    putLABEL(label) {
        this.instrs.push(label);
    }
    putJMP(label) {
        this.instrs.push("JMP " + label);
    }
}
class CodeGeneration {
    asm;
    allocator;
    label;
    constructor(maxRegisters){
        this.asm = new Asm();
        this.allocator = new Allocator(maxRegisters);
        this.label = 0;
    }
    gen(astNodes) {
        for (const astNode of astNodes){
            this.genStatement(astNode);
        }
        return this.asm;
    }
    genStatement(statement) {
        if (statement instanceof Declaration) {
            this.genDeclaration(statement);
        } else if (statement instanceof Assignment) {
            this.genAssignment(statement);
        } else if (statement instanceof IfStatement) {
            this.genIfStatement(statement, undefined, undefined);
        } else if (statement instanceof WhileStatement) {} else {
            return;
        }
    }
    genBody(body) {
        for (const statement of body.content){
            this.genStatement(statement);
        }
    }
    genWhileStatement(whileStatement) {
        const endLabel = this.genLabel();
        const startLabel = this.genLabel();
        this.asm.putLABEL(startLabel);
        this.genCondition(whileStatement.condition, endLabel);
        this.genBody(whileStatement.body);
        this.asm.putJMP(startLabel);
        this.asm.putLABEL(endLabel);
    }
    genIfStatement(ifStatement, label, endLabel) {
        if (label == undefined) {
            label = this.genLabel();
        } else if (endLabel == undefined && ifStatement.child != undefined) {
            endLabel = this.genLabel();
        }
        this.genCondition(ifStatement.condition, label);
        this.genBody(ifStatement.body);
        if (endLabel != undefined) {
            this.asm.putJMP(endLabel);
        }
        this.asm.putLABEL(label);
        if (ifStatement.child instanceof Body) {
            for (const statement of ifStatement.child.content){
                this.genStatement(statement);
            }
            if (endLabel != undefined) {
                this.asm.putLABEL(endLabel);
            } else {}
        } else if (ifStatement.child instanceof IfStatement) {
            this.genIfStatement(ifStatement.child, undefined, endLabel);
        }
    }
    genCondition(condition, endLabel) {
        if (!(condition instanceof BinaryOp)) {
            return;
        }
        const reg1 = this.genExpression(condition.expr1);
        const reg2 = this.genExpression(condition.expr2);
        const op = condition.op.value;
        switch(op){
            case ">":
                {
                    this.asm.putBRANCH("BLE", endLabel, reg1, reg2);
                    break;
                }
            case ">=":
                {
                    this.asm.putBRANCH("BRL", endLabel, reg1, reg2);
                    break;
                }
            case "<":
                {
                    this.asm.putBRANCH("BGE", endLabel, reg1, reg2);
                    break;
                }
            case "<=":
                {
                    this.asm.putBRANCH("BRG", endLabel, reg1, reg2);
                    break;
                }
            case "==":
                {
                    this.asm.putBRANCH("BNE", endLabel, reg1, reg2);
                    break;
                }
            case "!=":
                {
                    this.asm.putBRANCH("BRE", endLabel, reg1, reg2);
                    break;
                }
            default:
        }
        this.allocator.setFreeRegister(reg1);
        this.allocator.setFreeRegister(reg2);
    }
    genLabel() {
        this.label++;
        return ".LABEL_" + this.label;
    }
    genDeclaration(dec) {
        dec.vartype;
        const varName = dec.name.token.value;
        const addr = this.allocator.addVariable(varName);
        if (dec.expr) {
            const reg = this.genExpression(dec.expr);
            this.asm.putSTORE(addr, reg);
            this.allocator.setFreeRegister(reg);
        }
    }
    genAssignment(assign) {
        const varName = assign.name.token.value;
        const addr = this.allocator.hasVariable(varName);
        if (addr == -1) {
            return;
        }
        const reg = this.genExpression(assign.expr);
        this.asm.putSTORE(addr, reg);
        this.allocator.setFreeRegister(reg);
    }
    genExpression(expr) {
        if (expr instanceof Number) {
            const reg = this.allocator.getFreeRegister();
            this.asm.putLI(reg, parseInt(expr.token.value, 10));
            return reg;
        } else if (expr instanceof Identifier) {
            const memAddr = this.allocator.addVariable(expr.token.value);
            const reg1 = this.allocator.getFreeRegister();
            this.asm.putLOAD(reg1, memAddr);
            return reg1;
        } else if (expr instanceof BinaryOp) {
            const reg11 = this.genExpression(expr.expr1);
            const reg2 = this.genExpression(expr.expr2);
            switch(expr.op.value){
                case "+":
                    {
                        this.asm.putADD(reg11, reg11, reg2);
                        break;
                    }
                case "-":
                    {
                        this.asm.putSUB(reg11, reg11, reg2);
                        break;
                    }
                case "*":
                    {
                        this.asm.putMULT(reg11, reg11, reg2);
                        break;
                    }
                case "/":
                    {
                        this.asm.putDIV(reg11, reg11, reg2);
                        break;
                    }
                default:
            }
            this.allocator.setFreeRegister(reg2);
            return reg11;
        } else {
            return -1;
        }
    }
}
class Allocator {
    varToMemory;
    memory;
    registers;
    constructor(maxRegisters){
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
}
export { Asm as Asm };
export { CodeGeneration as CodeGeneration };
