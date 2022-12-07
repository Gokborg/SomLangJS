import { AstNode } from "../ast.ts";
import { Type } from "../type.ts";
import { Variable } from "./variable.ts";
export class Scopes {
  top = new Scope();
  scopes: Scope[] = [this.top];
  get func() {
    return this.top.func;
  }

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

  push(func?: Variable) {
    this.top = new Scope(this.top, func);
    this.scopes.push(this.top);
  }
  pop(): boolean {
    if (this.top.parent === undefined) {
      return false
    }
    this.top = this.top.parent;
    return true;
  }

  toString() {
    return new ScopeFormatter(this.scopes).format(0);
  }
}

export class Scope {
  variables: Record<string, Variable | undefined> = {}; 
  types: Record<string, Type> = {}
  constructor(readonly parent?: Scope, private _func?: Variable) {}

  get func(): Variable | undefined {
    return this._func || this.parent?.func;
  }

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


  get level(): number {
    return 1 + (this.parent?.level ?? -1)
  }
}
const indent = "  ";
class ScopeFormatter {
  constructor (public scopes: Scope[]) {}
  output = "";
  index = 0;
  format(level: number) {
    const scope = this.scopes[this.index];
    if (level > 0) {
      this.output += indent.repeat(level-1) + "{\n";
    }
    for (const [name, variable] of Object.entries(scope.variables)) {
      this.output += indent.repeat(level) + `${variable?.type} ${name}\n`;
    }
    this.index++;
    while (this.index < this.scopes.length) {
      const child = this.scopes[this.index];
      if (child.parent !== scope) {
        break;
      }
      this.format(level + 1);
    }
    
    if (level > 0) {
      this.output += indent.repeat(level-1) + "}\n";
    }
    return this.output;
  }
}