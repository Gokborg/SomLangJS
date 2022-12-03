
export type Type = IType & (Prim | ArrayType | Pointer);
export interface IType {
  toString(): string;
  eq(other: Type): boolean;
}

export class ArrayType implements IType {
  constructor(public iner: Type){}
  eq(other: Type): boolean {
    return other instanceof ArrayType && this.iner.eq(other.iner);
  }
  toString(): string {
      return `${this.iner.toString()}[]`;
  }
}

export class Pointer implements IType {
  constructor(public iner: Type){}
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
  eq(other: Type): boolean {
    return this === other;
  }
  static ERROR = new Prim("UINT");
  static UINT = new Prim("UINT");
  static CHAR = new Prim("CHAR");
  static BOOL = new Prim("BOOL");

  toString(): string {
    return this.name;
  }
}


export const NoType = Prim.ERROR;
export type NoType = typeof NoType;