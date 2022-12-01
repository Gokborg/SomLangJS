import {Token, Kind} from "./token.ts";
import { Type } from "./type.ts";

//Statements
//=============================================
export type Statement = Body | IfStatement | WhileStatement
    | MacroDeclaration | MacroCall | Declaration | Assignment;

export interface IStatement {}

export class Body implements IStatement {
    constructor(public content: IStatement[]) {}
}

export class IfStatement implements IStatement {
    constructor(
        public condition: IExpression,
        public body: Body,
        public child: Body | IfStatement
    ) {
    }
}

export class WhileStatement implements IStatement {
    constructor(public condition: IExpression, public body: Body) {}
}

export class MacroDeclaration implements IStatement {
    constructor(
        public name: Identifier,
        public args: IExpression[],
        public body: Body
    ) {}
}

export class MacroCall implements IStatement {
    constructor(public name: Identifier, public args: IExpression[]) {}
}

export class Declaration implements IStatement {
    constructor(
        public vartype: VarType,
        public name: Identifier,
        public expr: IExpression
    ) {}
}

export class Assignment implements IStatement {
    constructor(public name: Identifier, public expr: IExpression) {}
}

export class VarType {
    constructor(public type: Type, public token: Token) {}
}

//Expressions
//=============================================
export type Expression = Number | Identifier | BinaryOp | ArrayLiteral | ArrayAccess;
export interface IExpression {}

export class Number implements IExpression {
    constructor(public token: Token) {}
}

export class Identifier implements IExpression {
    constructor(public token: Token) {}
}

export class BinaryOp implements IExpression {
    constructor(
        public expr1: IExpression,
        public op: Token,
        public expr2: IExpression
    ) {}
}

export class ArrayLiteral implements IExpression {
    constructor(public items: IExpression[]) {}
}

export class ArrayAccess implements IExpression {
    constructor(public array: Identifier, public index: IExpression) {}
}