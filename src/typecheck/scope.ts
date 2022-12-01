import { Type } from "../type.ts";
import { Variable } from "./variable.ts";

export class Scopes {
  top = new Scope();
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

  put(name: string, type: Type): Optional<Variable> {
    if (!this.get(name)) {
      return undefined;
    }
    const variable = new Variable(this, type);
    this.variables[name] = variable;
  }

  get(name: string): Optional<Variable> {
    return this.variables[name] ?? this.parent?.get(name);
  }
}