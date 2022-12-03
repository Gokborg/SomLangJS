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
    constructor(private open: Token, public content: Statement[]) {}

    get start(): Token {
        return this.open;
    }

    toString() {
      return `Body {\n${this.content.join("\n")}\n}`;
    }
}

export class IfStatement implements IStatement {
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
    constructor(public condition: Expression, public body: Body) {}

    get start(): Token {
        return this.condition.start;
    }

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

    get start(): Token {
        return this.name.start;
    }

    toString() {
      return `MacroDecl(${this.name} ${this.args.join(", ")};\n${this.body})`;
    }
  }
  
export class MacroCall implements IStatement {
    constructor(public name: Identifier, public args: IExpression[]) {}

    get start(): Token {
        return this.name.start;
    }

    toString() {
      return `MacroCall(${this.name} ${this.args.join(", ")}})`;
    }
}

export class Declaration implements IStatement {
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
    constructor(public vartype: TypeNode, public name: Identifier, public expr: Expression) {}

    get start(): Token {
        return this.name.start;
    }

    toString() {
      return `Assignment(${this.vartype} ${this.name} = ${this.expr})`;
    }
}

export type TypeNode = VarArray | VarType;
export class VarType implements AstNode {
    constructor(public token: Token) {}

    get start(): Token {
        return this.token;
    }

    toString() {
      return `VarType(${this.token})`;
    }
}

export class VarArray implements AstNode {
  constructor(public iner: TypeNode, public size?: Expression) {}

  get start(): Token {
    return this.iner.start;
  }
  toString() {
    return `${this.iner}[${this.size ?? ""}]`;
  }
}

export class VarPointer implements AstNode {
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
export type Expression = Number | Identifier | BinaryOp | ArrayLiteral | ArrayAccess;
export interface IExpression extends AstNode {}

export class Number implements IExpression {
    constructor(public token: Token) {}

    get start(): Token {
        return this.token;
    }

    toString() {
      return `Number(${this.token})`
    }
}

export class Identifier implements IExpression {
    constructor(public token: Token) {}

    get start(): Token {
        return this.token;
    }

    toString() {
      return `Identifier(${this.token})`;
    }
}

export class BinaryOp implements IExpression {
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
    constructor(private open: Token, public items: Expression[]) {}

    get start(): Token {
        return this.open;
    }

    toString() {
      return `ArrayLit(${this.items.join(", ")})`;
    }
  }
  
export class ArrayAccess implements IExpression {
    constructor(public array: Identifier, public index: Expression) {}

    get start(): Token {
        return this.array.start;
    }

    toString() {
      return `ArrayAccess(${this.array} ${this.index})`;
    }
}