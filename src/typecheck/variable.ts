import { AstNode } from "../ast.ts";
import { Type } from "../type.ts";
import { Scope } from "./scope.ts";

export class Variable {
  references: AstNode[] = [];
  constructor(public scope: Scope, public type: Type, public definition?: AstNode) {

  }
}