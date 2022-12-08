import { Asm } from "./asm.ts";

export class URCLAsm extends Asm {
    putLI(dest: number, value: number) {
        this.add("IMM R" + dest + " " + value);
    }
    putLOAD(reg: number, addr: number) {
        this.add("LOD R" + reg + " #" + addr);
    }
    putLOADWITHREG(reg: number, reg2: number) {
        this.add("LOD R" + reg + " R" + reg2);
    }
    putSTORE(addr: number, reg: number) {
        this.add("STR #" + addr + " R" + reg);
    }
    putSTOREWITHREG(reg: number, reg2: number) {
        this.add("STR R" + reg + " R" + reg2);
    }
    putADD(dest: number, srcA: number, srcB: number) {
        this.add("ADD R" + dest + " R" + srcA + " R" + srcB);
    }
    putSUB(dest: number, srcA: number, srcB: number) {
        this.add("SUB R" + dest + " R" + srcA + " R" + srcB);
    }
    putMULT(dest: number, srcA: number, srcB: number) {
        this.add("MLT R" + dest + " R" + srcA + " R" + srcB);
    }
    putDIV(dest: number, srcA: number, srcB: number) {
        this.add("DIV R" + dest + " R" + srcA + " R" + srcB);
    }
    putBRANCH(instr: string, label: string, left: number, right: number) {
        this.add(instr + " " + label + " R" + left + " R" + right);
    }
    putLABEL(label: string) {
        this.add(label);
    }
    putOUT(port: number, reg: number) {
        this.add("OUT " + port + " R" + reg);
    }
    putIN(reg: number, port: number) {
        this.add("IN R" + reg + " " + port);
    }
    putJMP(label: string) {
        this.add("JMP " + label);
    }
}