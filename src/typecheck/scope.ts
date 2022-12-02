import { Type } from "../type.ts";
import { Variable } from "./variable.ts";

export class Scopes {
  top = new Scope();
  put(name: string, type: Type): void | Variable {
    return this.top.put(name, type);
  }
  get(name: string): void | Variable {
    return this.top.get(name);
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
  variables: Record<string, Variable | void> = {}; 
  constructor(readonly parent?: Scope) {}

  put(name: string, type: Type): void | Variable {
    if (this.get(name)) {
      return undefined;
    }
    const variable = new Variable(this, type);
    this.variables[name] = variable;
  }

  get(name: string): void | Variable {
    return this.variables[name] ?? this.parent?.get(name);
  }
}