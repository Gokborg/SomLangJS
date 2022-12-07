export abstract class Asm {
    private instrs: string[];

    constructor() {
        this.instrs = [];
    }

    add(instr: string) {
        this.instrs.push(instr);
    }

    toString() : string {
        return this.instrs.join("\n");
    }

    abstract putLI(dest: number, num: number) : void;
    abstract putLOAD(dest: number, addr: number) : void;
    abstract putLOADWITHREG(dest: number, srcA: number) : void;
    abstract putSTORE(dest: number, addr: number) : void;
    abstract putSTOREWITHREG(dest: number, srcA: number) : void;

    abstract putADD(dest: number, srcA: number, srcB: number) : void;
    abstract putSUB(dest: number, srcA: number, srcB: number) : void;
    abstract putMULT(dest: number, srcA: number, srcB: number) : void;
    abstract putDIV(dest: number, srcA: number, srcB: number) : void;

    abstract putBRANCH(instr: string, label: string, srcA: number, srcB: number) : void;
    abstract putLABEL(label: string) : void;
    abstract putOUT(port: number, reg: number) : void;
    abstract putIN(reg: number, port: number) : void;
    abstract putJMP(label: string) : void;
}