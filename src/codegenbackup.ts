// import * as ast from "./ast.ts";

// export class Asm {
//     instrs: string[];
//     constructor(readonly source: ast.AstNode) {
//         this.instrs = [];
//     }
//     toString() {
//         return this.instrs.join("\n");
//     }
//     putLI(dest: number, value: number) {
//         this.instrs.push("IMM R" + dest + " " + value);
//     }
//     putLOAD(reg: number, addr: number) {
//         this.instrs.push("LOD R" + reg + " #" + addr);
//     }
//     putSTORE(addr: number, reg: number) {
//         this.instrs.push("STR #" + addr + " R" + reg);
//     }
//     putADD(dest: number, srcA: number, srcB: number) {
//         this.instrs.push("ADD R" + dest + " R" + srcA + " R" + srcB);
//     }
//     putSUB(dest: number, srcA: number, srcB: number) {
//         this.instrs.push("SUB R" + dest + " R" + srcA + " R" + srcB);
//     }
//     putMULT(dest: number, srcA: number, srcB: number) {
//         this.instrs.push("MULT R" + dest + " R" + srcA + " R" + srcB);
//     }
//     putDIV(dest: number, srcA: number, srcB: number) {
//         this.instrs.push("DIV R" + dest + " R" + srcA + " R" + srcB);
//     }
//     putBRANCH(instr: string, label: string, left: number, right: number) {
//         this.instrs.push(instr + " " + label + " R" + left + " R" + right);
//     }
//     putLABEL(label: string) {
//         this.instrs.push(label);
//     }
//     putJMP(label: string) {
//         this.instrs.push("JMP " + label);
//     }
// }

// export class CodeGeneration {
//     allocator: Allocator;
//     label: number;
//     asmList: Asm[];

//     constructor(maxRegisters: number) {
//         this.asmList = [];
//         this.allocator = new Allocator(maxRegisters);
//         this.label = 0;
//     }

//     gen(astNodes: ast.Statement[]) : Asm[]{
//         for(const astNode of astNodes) {
//             this.genStatement(astNode);
//         }
//         return this.asmList;
//     }

//     genStatement(statement: ast.Statement) {
//         const asm: Asm = new Asm(statement);
//         if(statement instanceof ast.Declaration) {
//             this.genDeclaration(asm, statement);
//             this.asmList.push(asm);
//         }
//         else if(statement instanceof ast.Assignment) {
//             this.genAssignment(asm, statement);
//             this.asmList.push(asm);
//         }
//         else if(statement instanceof ast.IfStatement) {
//             this.genIfStatement(statement, undefined);
//         }
//         else if(statement instanceof ast.WhileStatement) {
//             this.genWhileStatement(asm, statement);
//             this.asmList.push(asm);
//         }
//         else {
//             //error - No code gen for this statement
//             return;
//         }
//     }

//     genBody(body: ast.Body) {
//         for(const statement of body.content) {
//             this.genStatement(statement);
//         }
//     }

//     genWhileStatement(asm: Asm, whileStatement: ast.WhileStatement) {
//         const endLabel: string = this.genLabel();
//         const startLabel: string = this.genLabel();
//         const startAsm: Asm = new Asm(whileStatement.condition);
//         startAsm.putLABEL(startLabel);
//         this.genCondition(startAsm, whileStatement.condition, endLabel);
//         this.asmList.push(startAsm);
//         this.genBody(whileStatement.body);
//         asm.putJMP(startLabel);
//         asm.putLABEL(endLabel);
//     }

//     genIfStatement(ifStatement: ast.IfStatement, endLabel: undefined | string) {
//         let label = this.genLabel();
//         if(ifStatement.child != undefined && endLabel === undefined) {
//             endLabel = this.genLabel();
//         }
//         if(ifStatement.child === undefined && endLabel != undefined) {
//             label = endLabel;
//         }
//         const condAsm: Asm = new Asm(ifStatement.condition);
//         this.genCondition(condAsm, ifStatement.condition, label)
//         this.asmList.push(condAsm);
//         this.genBody(ifStatement.body);
//         const asm: Asm = new Asm(ifStatement);
//         if(ifStatement.child != undefined && endLabel != undefined) {
//             asm.putJMP(endLabel);
//         }
//         asm.putLABEL(label);
//         this.asmList.push(asm);

//         if(ifStatement.child instanceof ast.IfStatement) {
//             this.genIfStatement(ifStatement.child, endLabel);
//         }
//         else if(ifStatement.child instanceof ast.Body) {
//             this.genBody(ifStatement.child);
//             const elseAsm: Asm = new Asm(ifStatement.child);
//             if(endLabel != undefined) {
//                 elseAsm.putLABEL(endLabel);
//                 this.asmList.push(elseAsm);
//             }
//             else {
//                 console.log("ERROR");
//             }
//         }
//     }

//     genCondition(asm: Asm, condition: ast.Expression, endLabel: string) {
//         if(!(condition instanceof ast.BinaryOp)) {
//             //generate an error here probably
//             return asm;
//         }
//         const reg1: number = this.genExpression(asm, condition.expr1);
//         const reg2: number = this.genExpression(asm, condition.expr2);
//         const op: string = condition.op.value
//         switch(op) {
//             case ">": {
//                 asm.putBRANCH("BLE", endLabel, reg1, reg2); break;
//             }
//             case ">=": {
//                 asm.putBRANCH("BRL", endLabel, reg1, reg2); break;
//             }
//             case "<": {
//                 asm.putBRANCH("BGE", endLabel, reg1, reg2); break;
//             }
//             case "<=": {
//                 asm.putBRANCH("BRG", endLabel, reg1, reg2); break;
//             }
//             case "==": {
//                 asm.putBRANCH("BNE", endLabel, reg1, reg2); break;
//             }
//             case "!=": {
//                 asm.putBRANCH("BRE", endLabel, reg1, reg2); break;
//             }
//             default: {
//                 //Generate error here, invalid condition op
//             }
//         }
//         this.allocator.setFreeRegister(reg1);
//         this.allocator.setFreeRegister(reg2);
//         return asm;
//     }

//     genLabel() : string{
//         this.label++;
//         return ".LABEL_" + this.label;
//     }

//     genDeclaration(asm: Asm, dec: ast.Declaration) {
//         const varType: ast.TypeNode = dec.vartype;
//         const varName: string = dec.name.token.value;
//         const addr: number = this.allocator.addVariable(varName);
//         if(varType instanceof ast.VarArray) {
//             if(dec.expr instanceof ast.ArrayLiteral) {
//                 const arrayItems: ast.Expression[] = dec.expr.items;
//                 for(const arrayItem of arrayItems) {
//                     this.genExpression(arrayItem);
//                 }
//             }
//         }
//         if(dec.expr) {
//             const reg: number = this.genExpression(asm, dec.expr);
//             asm.putSTORE(addr, reg)
//             this.allocator.setFreeRegister(reg);
//         }
//     }

//     genAssignment(asm: Asm, assign: ast.Assignment) {
//         const varName: string = assign.name.token.value;
//         const addr: number = this.allocator.hasVariable(varName);
//         if(addr == -1) {
//             //generate error, variable was never declared
//             return;
//         }
//         const reg: number = this.genExpression(asm, assign.expr);
//         asm.putSTORE(addr, reg);
//         this.allocator.setFreeRegister(reg);
//     }

//     genExpression(asm: Asm, expr: ast.Expression) : number{
//         if(expr instanceof ast.Number) {
//             const reg: number = this.allocator.getFreeRegister();
//             asm.putLI(reg, parseInt(expr.token.value, 10))
//             return reg;
//         }
//         else if(expr instanceof ast.Identifier) {
//             const memAddr: number = this.allocator.addVariable(expr.token.value);
//             const reg: number = this.allocator.getFreeRegister();
//             asm.putLOAD(reg, memAddr);
//             return reg;
//         }
//         else if(expr instanceof ast.BinaryOp) {
//             const reg1: number = this.genExpression(asm, expr.expr1);
//             const reg2: number = this.genExpression(asm, expr.expr2);
//             switch(expr.op.value) {
//                 case "+": {
//                     asm.putADD(reg1, reg1, reg2); break;
//                 }
//                 case "-": {
//                     asm.putSUB(reg1, reg1, reg2); break;
//                 }
//                 case "*": {
//                     asm.putMULT(reg1, reg1, reg2); break;
//                 }
//                 case "/": {
//                     asm.putDIV(reg1, reg1, reg2); break;
//                 }
//                 default : {
//                     //Generate error - operator token is incorrect
//                 }
//             }
//             this.allocator.setFreeRegister(reg2);
//             return reg1;
//         }
//         else {
//             //Generate error - the expr token is incorrect
//             return -1;
//         }
//     }
// }

// class Allocator {
//     varToMemory: Record<string, number>;
//     memory: boolean[];
//     registers: boolean[];

//     constructor(maxRegisters: number) {
//         this.varToMemory = {};
//         this.registers = new Array(maxRegisters);
//         this.registers.fill(false);
//         this.memory = new Array(512);
//         this.memory.fill(false);
//     }

//     hasVariable(varName: string) : number {
//         if(varName in this.varToMemory) {
//             return this.varToMemory[varName];
//         }
//         return -1;
//     }

//     addVariable(varName: string) : number {
//         if(varName in this.varToMemory) {
//             return this.varToMemory[varName];
//         }
//         const addr: number = this.getFreeMemory();
//         this.varToMemory[varName] = addr;
//         return addr;
//     }

//     getFreeRegister() : number {
//         const addr: number = this.registers.indexOf(false);
//         this.registers[addr] = true;
//         return addr+1;
//     }

//     getFreeMemory() : number {
//         const addr: number = this.memory.indexOf(false);
//         this.memory[addr] = true;
//         return addr+1;
//     }

//     setFreeRegister(reg: number) {
//         reg--;
//         this.registers[reg] = false;
//     }

//     setFreeMemory(mem: number) {
//         mem--;
//         this.memory[mem] = false;
//     }
// }