import {Token, Kind} from "./token.ts";
import { Type } from "./type.ts";

export interface AstNode {
    readonly start: Token,
}

//Statements
//=============================================
export type Statement = Body | IfStatement | WhileStatement
    | MacroDeclaration | MacroCall | Declaration | Assignment;

export interface IStatement extends AstNode {}

export class Body implements IStatement {
    declare private _: undefined; // Hack to disable duck typing
    constructor(private open: Token, public content: Statement[]) {}

    get start(): Token {
        return this.open;
    }

    toString() {
      return `Body {\n${this.content.join("\n")}\n}`;
    }
}

export class IfStatement implements IStatement {
    declare private _: undefined; // Hack to disable duck typing
    constructor(
        public condition: Expression,
        public body: Body,
        public child: Body | IfStatement | undefined
    ) {
    }
    get start(): Token {
        return this.condition.start;
    }

    toString() {
      return `If(\n\t${this.condition} \n\t${this.body} else \n\t${this.child ?? "nothing"})`;
    }
}

export class WhileStatement implements IStatement {
    declare private _: undefined; // Hack to disable duck typing
    constructor(public condition: Expression, public body: Body) {}

    get start(): Token {
        return this.condition.start;
    }

    toString() {
      return `While(\n\t${this.condition} \n\t${this.body})`;
    }
}
  
export class MacroDeclaration implements IStatement {
    declare private _: undefined; // Hack to disable duck typing
    constructor(
        public name: Identifier,
        public args: Expression[],
        public body: Body
    ) {}

    get start(): Token {
        return this.name.start;
    }

    toString() {
      return `MacroDecl(${this.name} ${this.args.join(", ")};\n${this.body})`;
    }
}

export class MacroCall implements IStatement {
    declare private _: undefined; // Hack to disable duck typing
    constructor(public name: Identifier, public args: IExpression[]) {}

    get start(): Token {
        return this.name.start;
    }

    toString() {
      return `MacroCall(${this.name} ${this.args.join(", ")}})`;
    }
}

export class Declaration implements IStatement {
    declare private _: undefined; // Hack to disable duck typing
    constructor(
        public vartype: TypeNode,
        public name: Identifier,
        public expr?: Expression
    ) {}

    get start(): Token {
        return this.vartype.start;
    }

    toString() {
      return `Declaration(${this.vartype} ${this.name} = ${this.expr})`;
    }
}

export class Assignment implements IStatement {
    declare private _: undefined; // Hack to disable duck typing
    constructor(public vartype: TypeNode, public name: Identifier, public expr: Expression) {}

    get start(): Token {
        return this.name.start;
    }

    toString() {
      return `Assignment(${this.vartype} ${this.name} = ${this.expr})`;
    }
}

export type TypeNode = VarArray | VarPointer | VarType;
export class VarType implements AstNode {
    declare private _: undefined; // Hack to disable duck typing
    constructor(public token: Token) {}

    get start(): Token {
        return this.token;
    }

    toString() {
      return `VarType(${this.token})`;
    }
}

export class VarArray implements AstNode {
    declare private _: undefined; // Hack to disable duck typing
    constructor(public iner: TypeNode, public size?: Expression) {}

    get start(): Token {
        return this.iner.start;
    }
    toString() {
        return `${this.iner}[${this.size ?? ""}]`;
    }
}

export class VarPointer implements AstNode {
    declare private _: undefined; // Hack to disable duck typing
    constructor(public iner: TypeNode) {}

    get start(): Token {
        return this.iner.start;
    }
    toString() {
        return `${this.iner}*`;
    }
}

//Expressions
//=============================================
export type Expression = Number | Identifier | BinaryOp | ArrayLiteral | ArrayAccess | Reference | Dereference;
export interface IExpression extends AstNode {}

export class Number implements IExpression {
    declare private _: undefined; // Hack to disable duck typing
    constructor(public token: Token) {}

    get start(): Token {
        return this.token;
    }

    toString() {
      return `Number(${this.token})`
    }
}

export class Identifier implements IExpression {
    declare private _: undefined; // Hack to disable duck typing
    constructor(public token: Token) {}

    get start(): Token {
        return this.token;
    }

    toString() {
      return `Identifier(${this.token})`;
    }
}

export class BinaryOp implements IExpression {
    declare private _: undefined; // Hack to disable duck typing
    constructor(
        public expr1: Expression,
        public op: Token,
        public expr2: Expression
    ) {}

    get start(): Token {
        return this.expr1.start;
    }

    toString() {
      return `BinOp(${this.expr1} ${this.op} ${this.expr2})`;
    }
}

export class ArrayLiteral implements IExpression {
    declare private _: undefined; // Hack to disable duck typing
    constructor(private open: Token, public items: Expression[]) {}

    get start(): Token {
        return this.open;
    }

    toString() {
      return `ArrayLit(${this.items.join(", ")})`;
    }
  }
  
export class ArrayAccess implements IExpression {
    declare private _: undefined; // Hack to disable duck typing
    constructor(public array: Identifier, public index: Expression) {}

    get start(): Token {
        return this.array.start;
    }

    toString() {
      return `ArrayAccess(${this.array} ${this.index})`;
    }
}

export class Reference implements IExpression {
    declare private _: undefined; // Hack to disable duck typing
    constructor(public and: Token, public iner: Expression) {}

    get start(): Token {
        return this.and;
    }

    toString() {
      return `&${this.iner}`;
    }
}

export class Dereference implements IExpression {
    declare private _: undefined; // Hack to disable duck typing
    constructor(public star: Token, public iner: Expression) {}

    get start(): Token {
        return this.star;
    }

    toString() {
      return `*${this.iner}`;
    }
}