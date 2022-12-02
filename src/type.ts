
export type Type = IType & (Prim | ArrayType | Pointer);
export interface IType {
  toString(): string;
  eq(other: Type): boolean;
}

export class ArrayType implements IType {
  constructor(public iner: Type){}
  eq(other: Type): boolean {
    return other instanceof ArrayType && this.iner.eq(other);
  }
  toString(): string {
      return `${this.iner.toString()}[]`;
  }
}

export class Pointer implements IType {
  constructor(public iner: Type){}
  eq(other: Type): boolean {
    return other instanceof Pointer && this.iner.eq(other);
  }
  toString(): string {
      return `${this.iner.toString()}*`;
  }
}

export class Prim implements IType {
  constructor(private name: string) {

  }
  eq(other: Type): boolean {
    return this === other;
  }
  static UINT = new Prim("UINT");
  static Char = new Prim("CHAR");
  static Bool = new Prim("BOOL");

  toString(): string {
    return this.name;
  }
}