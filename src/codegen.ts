import * as ast from "./ast.ts";

export class Asm {
    instrs: string[];
    constructor() {
        this.instrs = [];
    }

    putLI(dest: number, value: number) {
        this.instrs.push("IMM R" + dest + " " + value);
    }
    putLOAD(reg: number, addr: number) {
        this.instrs.push("LOAD R" + reg + " $" + addr);
    }
    putSTORE(addr: number, reg: number) {
        this.instrs.push("STORE $" + addr + " R" + reg);
    }
    putADD(dest: number, srcA: number, srcB: number) {
        this.instrs.push("ADD R" + dest + " R" + srcA + " R" + srcB);
    }
}

export class CodeGeneration {
    asm: Asm
    allocator: Allocator;
    constructor(maxRegisters: number) {
        this.asm = new Asm();
        this.allocator = new Allocator(maxRegisters);
    }

    gen(astNodes: ast.Statement[]) : Asm {
        for(const astNode of astNodes) {
            this.genStatement(astNode);
        }
        return this.asm;
    }

    genStatement(statement: ast.Statement) {
        if(statement instanceof ast.Declaration) {
            this.genDeclaration(statement);
        }
        else if(statement instanceof ast.Assignment) {

        }
        else if(statement instanceof ast.IfStatement) {

        }
        else if(statement instanceof ast.WhileStatement) {

        }
        else {
            //No code gen for this statement
            return;
        }
    }

    genDeclaration(dec: ast.Declaration) {
        const varType: ast.VarType = dec.vartype;
        const varName: string = dec.name.token.value;
        const addr: number = this.allocator.addVariable(varName);
        if(dec.expr) {
            const reg: number = this.genExpression(dec.expr);
            this.asm.putSTORE(addr, reg)
        }
    }

    genExpression(expr: ast.Expression) : number{
        if(expr instanceof ast.Number) {
            const reg: number = this.allocator.getFreeRegister();
            this.asm.putLI(reg, parseInt(expr.token.value, 10))
            return reg;
        }
        else if(expr instanceof ast.Identifier) {
            const memAddr: number = this.allocator.addVariable(expr.token.value);
            const reg: number = this.allocator.getFreeRegister();
            this.asm.putLOAD(reg, memAddr);
            return reg;
        }
        else if(expr instanceof ast.BinaryOp) {
            const reg1: number = this.genExpression(expr.expr1);
            const reg2: number = this.genExpression(expr.expr2);
            switch(expr.op.value) {
                case "+": {
                    this.asm.putADD(reg1, reg1, reg2);
                    break;
                }
            }
            this.allocator.setFreeRegister(reg2);
            return reg1;
        }
        else {
            //Generate error 
            return -1;
        }
    }
}

class Allocator {
    varToMemory: Record<string, number>;
    memory: boolean[];
    registers: boolean[];

    constructor(maxRegisters: number) {
        this.varToMemory = {};
        this.registers = new Array(maxRegisters);
        this.registers.fill(false);
        this.memory = new Array(512);
        this.memory.fill(false);
    }

    addVariable(varName: string) : number {
        if(varName in this.varToMemory) {
            return this.varToMemory[varName];
        }
        const addr: number = this.getFreeMemory();
        this.varToMemory[varName] = addr;
        return addr;
    }

    getFreeRegister() : number {
        const addr: number = this.registers.indexOf(false);
        this.registers[addr] = true;
        return addr;
    }

    getFreeMemory() : number {
        const addr: number = this.memory.indexOf(false);
        this.memory[addr] = true;
        return addr;
    }

    setFreeRegister(reg: number) {
        this.registers[reg] = false;
    }

    setFreeMemory(mem: number) {
        this.memory[mem] = false;
    }
}