
export type Type = IType & (Prim | ArrayType | Pointer);
export interface IType {
  toString(): string;
  eq(other: Type): boolean;
  par_eq(other: Type): boolean;
}

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

export class Prim implements IType {
  private constructor(private name: string) {

  }
  par_eq(other: Type): boolean {
    return this === Prim.ERROR || this.eq(other);
  }
  eq(other: Type): boolean {
    return this === other;
  }
  static ERROR = new Prim("ERROR");
  static UINT = new Prim("UINT");
  static CHAR = new Prim("CHAR");
  static BOOL = new Prim("BOOL");

  toString(): string {
    return this.name;
  }
}


export const NoType = Prim.ERROR;
export type NoType = typeof NoType;