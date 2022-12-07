import {Token, Kind} from "./token.ts";
import { Type } from "./type.ts";

export interface AstNode {
    readonly start: Token,
}

//Statements
//=============================================
export type Statement = Body | IfStatement | WhileStatement | FunctionDeclaration | DerefAssignment
    | MacroDeclaration | MacroCall | Declaration | Assignment | AsmStatement | AsmInstruction | AsmBody;

export interface IStatement extends AstNode {}

export class AsmBody implements IStatement {
    declare private _: undefined; //Hack to disable duck typing
    constructor(private open: Token, public content: AsmInstruction[]) {}

    get start(): Token {
        return this.open;
    }

    toString() {
        return `AsmBody {\n${this.content.join("\n")}\n}`
    }
}
//this would be like ADD R0, R1, R0
export class AsmInstruction implements IStatement {
    declare private _: undefined; //Hack to disable duck typing
    constructor(private open: Token, public instr: Identifier, public args: Expression[]) {}

    get start(): Token {
        return this.instr.start;
    }

    toString() {
      return `AsmInstruction(${this.instr} ${this.args})`;
    }
    
}

//this would be like asm {}
export class AsmStatement implements IStatement {
    declare private _: undefined; //Hack to disable duck typing
    constructor(private open: Token, public args: Identifier[], public body: AsmBody) {}

    get start(): Token {
        return this.open;
    }

    toString() {
      return `AsmStatement(\n\t${this.args}\n\t${this.body})`;
    }
}

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

export class FunctionDeclaration implements IStatement {
    declare private _: undefined; // Hack to disable duck typing
    constructor(
        public type: TypeNode,
        public name: Identifier,
        public args: FunctionArgument[],
        public body: Body
    ) {}

    get start(): Token {
        return this.name.start;
    }

    toString() {
      return `Function(${this.type} ${this.name} (${this.args.join(", ")}) ${this.body})`;
    }
}

export class FunctionArgument {
    declare private _: undefined; // Hack to disable duck typing
    constructor (public type: TypeNode, public name: Identifier) {}

    toString() {
        return `Arg(${this.type} ${this.name})`;
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

export class DerefAssignment implements IStatement {
    declare private _: undefined; // Hack to disable duck typing
    constructor(private star: Token, public target: Expression, public expr: Expression) {}

    get start(): Token {
        return this.star;
    }

    toString() {
      return `DerefAssignment(${this.target} = ${this.expr})`;
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
export type Expression = Number | Identifier | BinaryOp | ArrayLiteral | ArrayAccess | AsmRegister | AsmMemory | Reference | Dereference | FunctionCall;
export interface IExpression extends AstNode {}

export class AsmMemory implements IExpression {
    declare private _: undefined;
    constructor(public token: Token) {}

    get start(): Token {
        return this.token;
    }

    toString() {
        return `AsmMemory(${this.token})`
    }
}

export class AsmRegister implements IExpression {
    declare private _: undefined; //Hack to disable duck typing
    constructor(public token: Token, public reg: number) {}

    get start(): Token {
        return this.token;
    }

    toString() {
        return `AsmRegister(${this.token})`
    }
}

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
    constructor(public array: Expression, public index: Expression) {}

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
      return `Ref(${this.iner})`;
    }
}

export class Dereference implements IExpression {
    declare private _: undefined; // Hack to disable duck typing
    constructor(public star: Token, public iner: Expression) {}

    get start(): Token {
        return this.star;
    }

    toString() {
        return `Deref(${this.iner})`;
    }
}


export class FunctionCall implements IExpression {
    declare private _: undefined; // Hack to disable duck typing
    constructor(public func: Expression, public args: Expression[]){}
    get start(): Token {
        return this.func.start;
    }

    toString() {
        return `Call(${this.func} (${this.args.join(", ")}))`;
    }
}