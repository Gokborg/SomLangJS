import { AstNode } from "../ast.ts";
import { Type } from "../type.ts";
import { Variable } from "./variable.ts";
export class Scopes {
  top = new Scope();
  get_top(name: string): undefined | Variable {
    return this.top.get_top(name);
  }
  put(name: string, type: Type, node?: AstNode): Variable {
    return this.top.put(name, type, node);
  }
  get(name: string): undefined | Variable {
    return this.top.get(name);
  }

  put_type(name: string, type: Type) {
    return this.top.put_type(name, type);
  }
  
  top_type(name: string): undefined | Type {
    return this.top.top_type(name);
  }

  get_type(name: string): undefined | Type {
    return this.top.get_type(name);
  }

  push() {
    this.top = new Scope(this.top);
  }
  pop(): boolean {
    if (this.top.parent === undefined) {
      return false
    }
    this.top = this.top.parent;
    return true;
  }
}

export class Scope {
  variables: Record<string, Variable | undefined> = {}; 
  types: Record<string, Type> = {}
  constructor(readonly parent?: Scope) {}

  get_top(name: string): undefined | Variable {
    return this.variables[name];
  }

  put(name: string, type: Type, node?: AstNode): Variable {
    const variable = new Variable(this, type, node);
    this.variables[name] = variable;
    return variable;
  }

  get(name: string): undefined | Variable {
    return this.variables[name] ?? this.parent?.get(name);
  }

  put_type(name: string, type: Type) {
    this.types[name] = type;
  }

  top_type(name: string): undefined | Type {
    return this.types[name];
  }

  get_type(name: string): undefined | Type {
    return this.types[name] ?? this.parent?.get_type(name);
  }
}