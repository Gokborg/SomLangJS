import { AstNode } from "../ast.ts";
import { Type } from "../type.ts";
import { Scope } from "./scope.ts";

export class Variable {
  constructor(public scope: Scope, public type: Type, public node?: AstNode) {

  }
}