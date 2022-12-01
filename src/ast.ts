import {Token, Kind} from "./token.ts";
import { Type } from "./type.ts";

export interface AstNode {

}

//Statements
//=============================================
export type Statement = Body | IfStatement | WhileStatement
    | MacroDeclaration | MacroCall | Declaration | Assignment;

export interface IStatement extends AstNode {}

export class Body implements IStatement {
    constructor(public content: Statement[]) {}

    toString() {
      return `Body {\n${this.content.join("\n")}\n}`;
    }
}

export class IfStatement implements IStatement {
    constructor(
        public condition: IExpression,
        public body: Body,
        public child: Body | IfStatement | undefined
    ) {
    }

    toString() {
      return `If(\n\t${this.condition} \n\t${this.body} else \n\t${this.child ?? "nothing"})`;
    }
  }

  export class WhileStatement implements IStatement {
    constructor(public condition: IExpression, public body: Body) {}

    toString() {
      return `While(\n\t${this.condition} \n\t${this.body})`;
    }
  }
  
export class MacroDeclaration implements IStatement {
    constructor(
        public name: Identifier,
        public args: Expression[],
        public body: Body
    ) {}

    toString() {
      return `MacroDecl(${this.name} ${this.args.join(", ")};\n${this.body})`;
    }
  }
  
  export class MacroCall implements IStatement {
    constructor(public name: Identifier, public args: IExpression[]) {}
    toString() {
      return `MacroCall(${this.name} ${this.args.join(", ")}})`;
    }
}

export class Declaration implements IStatement {
    constructor(
        public vartype: VarType,
        public name: Identifier,
        public expr?: IExpression
    ) {}

    toString() {
      return `Declaration(${this.vartype} ${this.name} = ${this.expr})`;
    }
}

export class Assignment implements IStatement {
    constructor(public name: Identifier, public expr: IExpression) {}
    toString() {
      return `Assignment(${this.name} = ${this.expr})`;
    }
}

export class VarType {
    constructor(public type: Type, public token: Token) {}
    toString() {
      return `VarType(${this.type} ${this.token})`;
    }
}

//Expressions
//=============================================
export type Expression = Number | Identifier | BinaryOp | ArrayLiteral | ArrayAccess;
export interface IExpression {}

export class Number implements IExpression {
    constructor(public token: Token) {}
    toString() {
      return `Number(${this.token})`
    }
}

export class Identifier implements IExpression {
    constructor(public token: Token) {}
    toString() {
      return `Identifier(${this.token})`;
    }
}

export class BinaryOp implements IExpression {
    constructor(
        public expr1: IExpression,
        public op: Token,
        public expr2: IExpression
    ) {}

    toString() {
      return `BinOp(${this.expr1} ${this.op} ${this.expr2})`;
    }
}

export class ArrayLiteral implements IExpression {
    constructor(public items: IExpression[]) {}
    toString() {
      return `ArrayLit(${this.items.join(", ")})`;
    }
  }
  
  export class ArrayAccess implements IExpression {
    constructor(public array: Identifier, public index: IExpression) {}
    toString() {
      return `ArrayAccess(${this.array} ${this.index})`;
    }
}