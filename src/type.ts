
export type Type = IType & (Prim | ArrayType | Pointer | FunctionPointer);
export interface IType {
  toString(): string;
  eq(other: Type): boolean;
  par_eq(other: Type): boolean;
}

export class Prim implements IType {
  private constructor(private name: string) {

  }
  par_eq(other: Type): boolean {
    return this === Prim.NoType || this.eq(other);
  }
  eq(other: Type): boolean {
    return this === other;
  }
  static NoType = new Prim("NOTYPE");
  static UINT = new Prim("UINT");
  static CHAR = new Prim("CHAR");
  static BOOL = new Prim("BOOL");

  toString(): string {
    return this.name;
  }
}


export const NoType = Prim.NoType;
export type NoType = typeof NoType;


export class ArrayType implements IType {
  constructor(public iner: Type, public size?: number){}
  par_eq(other: Type): boolean {
    return other instanceof ArrayType
      && (this.size === undefined || this.size === other.size)
      && this.iner.par_eq(other.iner);
  }
  eq(other: Type): boolean {
    return other instanceof ArrayType && this.iner.eq(other.iner) && (this.size === undefined || this.size === other.size);
  }
  toString(): string {
      return `${this.iner.toString()}[${this.size ?? ""}]`;
  }
}

export class Pointer implements IType {
  constructor(public iner: Type){}
  par_eq(other: Type): boolean {
    return other instanceof Pointer && this.iner.par_eq(other.iner);
  }
  eq(other: Type): boolean {
    return other instanceof Pointer && this.iner.eq(other.iner);
  }
  toString(): string {
      return `${this.iner.toString()}*`;
  }
}

export class FunctionPointer implements IType {
  constructor(public ret: Type, public args: Type[]){}
  
  eq(other: Type): boolean {
    if (!(other instanceof FunctionPointer)) {
      return false;
    }
    if (this.args.length !== other.args.length){return false;}
    for (let i = 0; i < this.args.length; i++) {
      if (!(this.args[i].eq(other.args[i]))){
        return false;
      }
    }
    return this.ret.eq(other.ret);
  }
  par_eq(other: Type): boolean {
    if (other.eq(NoType)){return true;}
    if (!(other instanceof FunctionPointer)) {
      return false;
    }
    if (this.args.length !== other.args.length){return false;}
    for (let i = 0; i < this.args.length; i++) {
      if (!(this.args[i].par_eq(other.args[i]))){
        return false;
      }
    }
    return this.ret.par_eq(other.ret);
  }
  toString(): string {
    return `${this.ret}(${this.args.join(", ")})`;
  }
}