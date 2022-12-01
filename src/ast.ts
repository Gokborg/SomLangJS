import {Token, Kind} from "./token.ts";
import { Type } from "./type.ts";

//Statements
//=============================================
interface Statement {}

class Body implements Statement {
    content: Statement[];
    constructor(content: Statement[]) {
        this.content = content;
    }
}

class IfStatement implements Statement {
    condition: Expression;
    body: Body;
    child: Body | IfStatement;
    constructor(condition: Expression, body: Body, child: Body | IfStatement) {
        this.condition = condition;
        this.body = body;
        this.child = child;
    }
}

class WhileStatement implements Statement {
    condition: Expression;
    body: Body;
    constructor(condition: Expression, body: Body) {
        this.condition = condition;
        this.body = body;
    }
}

class MacroDeclaration implements Statement {
    name: Identifier;
    args: Expression[];
    body: Body;
    constructor(name: Identifier, args: Expression[], body: Body) {
        this.name = name;
        this.args = args;
        this.body = body;
    }
}

class MacroCall implements Statement {
    name: Identifier;
    args: Expression[];
    constructor(name: Identifier, args: Expression[]) {
        this.name = name;
        this.args = args;
    }
}

class Declaration implements Statement {
    vartype: VarType;
    name: Identifier;
    expr: Expression;
    constructor(vartype: VarType, name: Identifier, expr: Expression) {
        this.vartype = vartype;
        this.name = name;
        this.expr = expr;
    }
}

class Assignment implements Statement {
    name: Identifier;
    expr: Expression;
    constructor(name: Identifier, expr: Expression) {
        this.name = name;
        this.expr = expr;
    }
}

class VarType {
    type: Type;
    token: Token;
    constructor(type: Type, token: Token) {
        this.type = type;
        this.token = token;
    }
}

//Expressions
//=============================================
interface Expression {}

class Number implements Expression {
    token: Token;
    constructor(token: Token) {
        this.token = token;
    }
}

class Identifier implements Expression {
    token: Token;
    constructor(token: Token) {
        this.token = token;
    }
}

class BinaryOp implements Expression {
    expr1: Expression;
    op: Token;
    expr2: Expression;
    constructor(expr1: Expression, op: Token, expr2: Expression) {
        this.expr1 = expr1;
        this.op = op;
        this.expr2 = expr2;
    }
}

class ArrayLiteral implements Expression {
    items: Expression[];
    constructor(items: Expression[]) {
        this.items = items;
    }
}

class ArrayAccess implements Expression {
    array: Identifier;
    index: Expression;
    constructor(array: Identifier, index: Expression) {
        this.array = array;
        this.index = index;
    }
}