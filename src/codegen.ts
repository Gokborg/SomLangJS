import * as ast from "./ast.ts";

export class Asm {
    instrs: string[];
    constructor() {
        this.instrs = [];
    }
    toString() {
        return this.instrs.join("\n");
    }
    putLI(dest: number, value: number) {
        this.instrs.push("IMM R" + dest + " " + value);
    }
    putLOAD(reg: number, addr: number) {
        this.instrs.push("LOD R" + reg + " #" + addr);
    }
    putSTORE(addr: number, reg: number) {
        this.instrs.push("STR #" + addr + " R" + reg);
    }
    putADD(dest: number, srcA: number, srcB: number) {
        this.instrs.push("ADD R" + dest + " R" + srcA + " R" + srcB);
    }
    putSUB(dest: number, srcA: number, srcB: number) {
        this.instrs.push("SUB R" + dest + " R" + srcA + " R" + srcB);
    }
    putMULT(dest: number, srcA: number, srcB: number) {
        this.instrs.push("MULT R" + dest + " R" + srcA + " R" + srcB);
    }
    putDIV(dest: number, srcA: number, srcB: number) {
        this.instrs.push("DIV R" + dest + " R" + srcA + " R" + srcB);
    }
    putBRANCH(instr: string, label: string, left: number, right: number) {
        this.instrs.push(instr + " " + label + " " + left + " " + right);
    }
    putLABEL(label: string) {
        this.instrs.push(label);
    }
    putJMP(label: string) {
        this.instrs.push("JMP " + label);
    }

}

export class CodeGeneration {
    asm: Asm;
    allocator: Allocator;
    label: number;

    constructor(maxRegisters: number) {
        this.asm = new Asm();
        this.allocator = new Allocator(maxRegisters);
        this.label = 0;
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
            this.genAssignment(statement);
        }
        else if(statement instanceof ast.IfStatement) {
            this.genIfStatement(statement, undefined, undefined);
        }
        else if(statement instanceof ast.WhileStatement) {

        }
        else {
            //No code gen for this statement
            return;
        }
    }

    genBody(body: ast.Body) {
        for(const statement of body.content) {
            this.genStatement(statement);
        }
    }

    genWhileStatement(whileStatement: ast.WhileStatement) {
        const endLabel: string = this.genLabel();
        const startLabel: string = this.genLabel();
        this.asm.putLABEL(startLabel);
        this.genCondition(whileStatement.condition, endLabel);
        this.genBody(whileStatement.body);
        this.asm.putJMP(startLabel);
        this.asm.putLABEL(endLabel);
    }

    genIfStatement(ifStatement: ast.IfStatement, label: undefined | string, endLabel: undefined | string) {
        if(label == undefined) {
            label = this.genLabel();
        }
        else if(endLabel == undefined && ifStatement.child != undefined) {
            endLabel = this.genLabel();
        }
        this.genCondition(ifStatement.condition, label);
        this.genBody(ifStatement.body);
        if(endLabel != undefined) {
            this.asm.putJMP(endLabel);
        }
        this.asm.putLABEL(label);
        if(ifStatement.child instanceof ast.Body) {
            for(const statement of ifStatement.child.content) {
                this.genStatement(statement);
            }
            if(endLabel != undefined) {
                this.asm.putLABEL(endLabel);
            }
            else {
                //Generate error 
            }
        }
        else if(ifStatement.child instanceof ast.IfStatement) {
            this.genIfStatement(ifStatement.child, undefined, endLabel);
        }
    }

    genCondition(condition: ast.Expression, endLabel: string) {
        if(!(condition instanceof ast.BinaryOp)) {
            //generate an error here probably
            return;
        }
        const reg1: number = this.genExpression(condition.expr1);
        const reg2: number = this.genExpression(condition.expr2);
        const op: string = condition.op.value
        switch(op) {
            case ">": {
                this.asm.putBRANCH("BLE", endLabel, reg1, reg2); break;
            }
            case ">=": {
                this.asm.putBRANCH("BRL", endLabel, reg1, reg2); break;
            }
            case "<": {
                this.asm.putBRANCH("BGE", endLabel, reg1, reg2); break;
            }
            case "<=": {
                this.asm.putBRANCH("BRG", endLabel, reg1, reg2); break;
            }
            case "==": {
                this.asm.putBRANCH("BNE", endLabel, reg1, reg2); break;
            }
            case "!=": {
                this.asm.putBRANCH("BRE", endLabel, reg1, reg2); break;
            }
            default: {
                //Generate error here, invalid condition op
            }
        }
        this.allocator.setFreeRegister(reg1);
        this.allocator.setFreeRegister(reg2);
    }

    genLabel() : string{
        this.label++;
        return ".LABEL_" + this.label;
    }

    genDeclaration(dec: ast.Declaration) {
        const varType: ast.VarType = dec.vartype;
        const varName: string = dec.name.token.value;
        const addr: number = this.allocator.addVariable(varName);
        if(dec.expr) {
            const reg: number = this.genExpression(dec.expr);
            this.asm.putSTORE(addr, reg)
            this.allocator.setFreeRegister(reg);
        }
    }

    genAssignment(assign: ast.Assignment) {
        const varName: string = assign.name.token.value;
        const addr: number = this.allocator.hasVariable(varName);
        if(addr == -1) {
            //generate error, variable was never declared
            return;
        }
        const reg: number = this.genExpression(assign.expr);
        this.asm.putSTORE(addr, reg);
        this.allocator.setFreeRegister(reg);
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
                    this.asm.putADD(reg1, reg1, reg2); break;
                }
                case "-": {
                    this.asm.putSUB(reg1, reg1, reg2); break;
                }
                case "*": {
                    this.asm.putMULT(reg1, reg1, reg2); break;
                }
                case "/": {
                    this.asm.putDIV(reg1, reg1, reg2); break;
                }
                default : {
                    //Generate error - operator token is incorrect
                }
            }
            this.allocator.setFreeRegister(reg2);
            return reg1;
        }
        else {
            //Generate error - the expr token is incorrect
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

    hasVariable(varName: string) : number {
        if(varName in this.varToMemory) {
            return this.varToMemory[varName];
        }
        return -1;
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