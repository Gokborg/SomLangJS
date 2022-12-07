import * as ast from "./ast.ts";
import { Kind } from "./token.ts";

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
    putLOADWITHREG(reg: number, reg2: number) {
        this.instrs.push("LOD R" + reg + " R" + reg2);
    }
    putSTORE(addr: number, reg: number) {
        this.instrs.push("STR #" + addr + " R" + reg);
    }
    putSTOREWITHREG(reg: number, reg2: number) {
        this.instrs.push("STR R" + reg + " R" + reg2);
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
        this.instrs.push(instr + " " + label + " R" + left + " R" + right);
    }
    putLABEL(label: string) {
        this.instrs.push(label);
    }
    putOUT(reg: number, output: number) {
        this.instrs.push("OUT R" + reg + " " + output);
    }

    putJMP(label: string) {
        this.instrs.push("JMP " + label);
    }
}

export class CodeGeneration {
    allocator: Allocator;
    label: number;
    asm: Asm;

    constructor(maxRegisters: number) {
        this.asm = new Asm();
        this.allocator = new Allocator(maxRegisters);
        this.label = 0;
    }

    gen(astNodes: ast.Statement[]) : Asm{
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
            this.genIfStatement(statement, undefined);
        }
        else if(statement instanceof ast.WhileStatement) {
            this.genWhileStatement(statement);
        }
        else if(statement instanceof ast.AsmStatement) {
            this.genAsmStatement(statement);
        }
        else {
            //error - No code gen for this statement
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

    genIfStatement(ifStatement: ast.IfStatement, endLabel: undefined | string) {
        let label = this.genLabel();
        if(ifStatement.child != undefined && endLabel === undefined) {
            endLabel = this.genLabel();
        }
        if(ifStatement.child === undefined && endLabel != undefined) {
            label = endLabel;
        }
        this.genCondition(ifStatement.condition, label);
        this.genBody(ifStatement.body);
        if(ifStatement.child != undefined && endLabel != undefined) {
            this.asm.putJMP(endLabel);
        }
        this.asm.putLABEL(label);

        if(ifStatement.child instanceof ast.IfStatement) {
            this.genIfStatement(ifStatement.child, endLabel);
        }
        else if(ifStatement.child instanceof ast.Body) {
            this.genBody(ifStatement.child);
            if(endLabel != undefined) {
                this.asm.putLABEL(endLabel);
            }
            else {
                console.log("ERROR");
            }
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
        const varType: ast.TypeNode = dec.vartype;
        const varName: string = dec.name.token.value;

        //Array generation
        if(varType instanceof ast.VarArray) {
            if(dec.expr instanceof ast.ArrayLiteral) {
                const memArray: number = this.genArrayLiteral(dec.expr);
                this.allocator.addVariableAndAddr(varName, memArray);
            }
            else {
                if(varType.size) {
                    //TODO: Make size compatible with an expression
                    //Only allows size to be a number, once constants are added a constant expr evaluator will have to be made
                    //Meaning right now all you can do is uint[5] a; You can't do uint[b] a where b is a constant
                    if(varType.size instanceof ast.Number) {
                        //TODO: Change allocation size based on the variable type
                        //Problem is this will only allocate one memory slot for each arrray item
                        //However, this won't work for items that use a type larger than a byte (one memory slot)
                        //For now, since no other types have been programmed and only uint/char are there this is ok
                        const arraySize: number = parseInt(varType.size.token.value, 10);
                        let arrayItemsMemory: number[] = [];
                        for(let i = 0; i < arraySize; i++) {
                            const memArrayAddr: number = this.allocator.getFreeMemory();
                            arrayItemsMemory.push(memArrayAddr);
                        }
                        this.allocator.addVariableAndAddr(varName, arrayItemsMemory[0]);
                    }
                }
            }
            return;
        }
        else {
            const varAddr: number = this.allocator.addVariable(varName);
            if(dec.expr) {
                const reg: number = this.genExpression(dec.expr);
                this.asm.putSTORE(varAddr, reg)
                this.allocator.setFreeRegister(reg);
            }
        }
    }

    genAssignment(assign: ast.Assignment) {
        const varName: string = assign.name.token.value;
        const addr: number = this.allocator.hasVariable(varName);
        if(addr == -1) {
            //generate error, variable was never declared
            return;
        }
        if(assign.vartype instanceof ast.VarArray && assign.vartype.size != undefined) {
            const regIndex: number = this.genExpression(assign.vartype.size);
            const regArray: number = this.allocator.getFreeRegister();
            this.asm.putLI(regArray, addr);
            this.asm.putADD(regIndex, regArray, regIndex);
            this.allocator.setFreeRegister(regArray);
            //regIndex now holds the index

            const regExpr: number = this.genExpression(assign.expr);
            this.asm.putSTOREWITHREG(regIndex, regExpr);
            this.allocator.setFreeRegister(regExpr);
            this.allocator.setFreeRegister(regIndex);
        }
        else {
            const reg: number = this.genExpression(assign.expr);
            this.asm.putSTORE(addr, reg);
            this.allocator.setFreeRegister(reg);
        }
    }

    genAsmStatement(asmStatement: ast.AsmStatement) {
        const varArgs: string[] = [];
        for(const arg of asmStatement.args) {
            varArgs.push(arg.token.value);
        }
        this.genAsmBody(asmStatement.body, varArgs);
    }

    genAsmBody(body: ast.AsmBody, varArgs: string[]) {
        for(const asmInstr of body.content) {
            this.genAsmInstruction(asmInstr, varArgs);
        }
    }

    genAsmInstruction(asmInstr: ast.AsmInstruction, varArgs: string[]) {
        //TODO: Use JS voodoo to make this smaller
        function getRegArg(index: number) : number {
            const regExpression: ast.Expression =  asmInstr.args[index];
            if(regExpression instanceof ast.AsmRegister) {
                return regExpression.reg;
            }
            //throw error
            return -1;
        }
        function getMemArg(allocator: Allocator, index: number) : number {
            const memExpression: ast.Expression = asmInstr.args[index];
            if(memExpression instanceof ast.AsmMemory) {
                if(memExpression.token.eq(Kind.IDENTIFIER) && varArgs.includes(memExpression.token.value)) {
                    //variable
                    return allocator.hasVariable(memExpression.token.value);
                }
                else {
                    return parseInt(memExpression.token.value, 10);
                }
            }
            //throw error
            return -1;
        }
        function getNumArg(index: number) : number {
            if(asmInstr.args[index] instanceof ast.Number) {
                return parseInt(asmInstr.args[index].start.value, 10);
            }
            //throw error
            return -1;
        }
        const args: ast.Expression[] = asmInstr.args;
        switch(asmInstr.instr.token.value) {
            case "ADD": {
                this.asm.putADD(getRegArg(0), getRegArg(1), getRegArg(2))
                break;
            }
            case "SUB": {
                this.asm.putSUB(getRegArg(0), getRegArg(1), getRegArg(2))
                break;
            }
            case "MULT": {
                this.asm.putMULT(getRegArg(0), getRegArg(1), getRegArg(2))
                break;
            }
            case "DIV": {
                this.asm.putDIV(getRegArg(0), getRegArg(1), getRegArg(2))
                break;
            }
            case "OUT": {
                this.asm.putOUT(getRegArg(0), getNumArg(1));
                break;
            }
            case "IMM" : {
                this.asm.putLI(getRegArg(0), getNumArg(1));
                break;
            }
            //TODO: add support for using regs as an address
            case "LOD": {
                this.asm.putLOAD(getRegArg(0), getMemArg(this.allocator, 1));
                break;
            }
            case "STR": {
                this.asm.putSTORE(getMemArg(this.allocator, 0), getRegArg(1));
                break;
            }
            default: {
                //unknown instr throw error
            }
        }
    }

    genArrayLiteral(arrayLit: ast.ArrayLiteral) : number {
        let arrayItemsMemory: number[] = [];
        //First generate memory addresses of all items in the array
        for(const arrayItem of arrayLit.items) {
            const memArrayItem: number = this.allocator.getFreeMemory();
            arrayItemsMemory.push(memArrayItem);
        }
        //Second generate each item's expression and put into memory
        for(let i = 0; i < arrayLit.items.length; i++) {
            const regItem: number = this.genExpression(arrayLit.items[i]);
            this.asm.putSTORE(arrayItemsMemory[i], regItem);
            this.allocator.setFreeRegister(regItem);
        }
        return arrayItemsMemory[0];
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
        else if(expr instanceof ast.ArrayAccess) {
            const regIndex: number = this.genExpression(expr.index);
            // TODO: allow array excess for other expressions
            if (!(expr.array instanceof ast.Identifier)) {
                throw new Error(`array access is not implemented for ${expr.array}`);
            }
            const memArray: number = this.allocator.hasVariable(expr.array.token.value);
            const regArray: number = this.allocator.getFreeRegister();
            this.asm.putLI(regArray, (memArray+1));
            this.asm.putADD(regIndex, regArray, regIndex);
            this.asm.putLOADWITHREG(regIndex, regIndex);
            this.allocator.setFreeRegister(regArray);
            return regIndex;
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

    addVariableAndAddr(varName: string, addr: number) {
        this.varToMemory[varName] = addr;
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
        return addr+1;
    }

    getFreeMemory() : number {
        const addr: number = this.memory.indexOf(false);
        this.memory[addr] = true;
        return addr;
    }

    setFreeRegister(reg: number) {
        reg--;
        this.registers[reg] = false;
    }

    setFreeMemory(mem: number) {
        mem--;
        this.memory[mem] = false;
    }
}