import * as ast from "../ast.ts";

export class Allocator {
    regAllocator: RegisterAllocator;
    //lineno : {var : reg, var : reg}
    allocations: Map<number, Record<string, number>>;
    regAllocations: Record<number, RegisterAllocator>;
    maxRegs: number;
    constructor(maxRegs: number) {
        this.regAllocator = new RegisterAllocator(maxRegs);
        this.allocations = new Map<number, Record<string, number>>();
        this.regAllocations = {};
        this.maxRegs = maxRegs;
    }

    getVarReg(lineNo: number, varName: string) : number{
        const varRecord = this.allocations.get(lineNo);
        if(varRecord) {
            return varRecord[varName];
        }
        else {
            return -1;
        }
    }

    getReg(lineNo: number) : number {
        return this.regAllocations[lineNo].getReg();
    }

    //Returns the register allocator for that line
    getRegAlloc(lineNo: number) : RegisterAllocator {
        return this.regAllocations[lineNo];
    }

    initializeRanges(astNodes: ast.Statement[]) {
        console.log("CodeGeneration Debug");
        console.log("===================");
        //varname : all lineno with varname
        //ex: {'a' : [1, 7, 9], 'b': [2, 5]}
        let ranges: Record<string, number[]> = {};
        this.genRanges(astNodes, ranges);
        console.log(ranges);
        //transform {varname: [linenos]} -> {lineno : {varname:reg, varname:reg}}

        // let newRanges: Record<string, number[]> = {};
        // for(const [varName, lineNos] of Object.entries(ranges)) {
        //     if(isDigit(varName)) {
        //         let newLineNos: number[] = [];
        //         for(const no of lineNos) {
        //             //removes duplicates from lineNos
        //             if(!newLineNos.includes(no)) {
        //                 newLineNos.push(no);
        //             }
        //         }
        //         newRanges[varName] = newLineNos;
        //     }
        //     else {
        //         let newLineNos = [];
        //         for(let i = lineNos[0]; i <= lineNos[lineNos.length-1]; i++) {
        //             newLineNos.push(i);
        //         }
        //         newRanges[varName] = newLineNos;
        //     }
        // }

        for(const [varName, lineNos] of Object.entries(ranges)) {
            for(let i = lineNos[0]; i <= lineNos[lineNos.length-1]; i++) {
                let lineNoAllocator: RegisterAllocator | undefined = this.regAllocations[i];
                if(lineNoAllocator === undefined) {
                    lineNoAllocator = new RegisterAllocator(this.maxRegs);
                    this.regAllocations[i] = lineNoAllocator;

                }
                console.log(varName);
                let varRecord : Record<string, number> | undefined = this.allocations.get(i);
                console.log(varRecord);
                if(varRecord)
                {
                    console.log("VarRecord found");
                    console.log(varRecord[varName]);
                    if(varRecord[varName] === undefined) {
                        varRecord[varName] = lineNoAllocator.getReg();
                        this.allocations.set(i, varRecord);
                    }

                    console.log(this.allocations);
                }
                else {
                    varRecord = {};
                    varRecord[varName] = lineNoAllocator.getReg();
                    this.allocations.set(i, varRecord);
                    console.log("HERE");
                    console.log(this.allocations);
                }
            }
        }
        console.log(this.allocations);
        for (let [lineNo, varRecord] of this.allocations) {
            console.log("Line: " + lineNo);
            for (const [varName, regNum] of Object.entries(varRecord)) {
                console.log(`\t${varName} -> R${regNum}`);
            }
        }

        console.log("===================");
    }

    genRanges(astNodes: ast.Statement[], ranges: Record<string, number[]>) {
        for(const node of astNodes) {
            if(node instanceof ast.Declaration || node instanceof ast.Assignment) {
                this.genDecAssignRanges(node, ranges);
            }
            else if(node instanceof ast.Body) {
                this.genBodyRanges(node, ranges);
            }
            else if(node instanceof ast.IfStatement) {
                this.genIfRanges(node, ranges);
            }
            else if(node instanceof ast.WhileStatement) {
                this.genWhileRanges(node, ranges);
            }
        }
    }

    genWhileRanges(node: ast.WhileStatement, ranges: Record<string, number[]>) {
        this.genExpressionRanges(node.condition, ranges);
        this.genBodyRanges(node.body, ranges);
    }

    genIfRanges(node: ast.IfStatement, ranges: Record<string, number[]>) {
        this.genExpressionRanges(node.condition, ranges);
        this.genBodyRanges(node.body, ranges);
        if(node.child instanceof ast.IfStatement) {
            this.genIfRanges(node.child, ranges);
        }
    }

    genBodyRanges(node: ast.Body, ranges: Record<string, number[]>) {
        this.genRanges(node.content, ranges);
    }

    genDecAssignRanges(node: ast.Assignment | ast.Declaration, ranges: Record<string, number[]>) {
        this.genExpressionRanges(node.name, ranges);
        if(!node.expr) {
            return;
        }
        this.genExpressionRanges(node.expr, ranges);
    }

    genExpressionRanges(node: ast.Expression, ranges: Record<string, number[]>) {
        if(node instanceof ast.BinaryOp) {
            this.genExpressionRanges(node.expr1, ranges);
            this.genExpressionRanges(node.expr2, ranges);
        }
        else if(node instanceof ast.Identifier) {
            if(ranges[node.token.value] === undefined) {
                ranges[node.token.value] = [node.token.lineno];
            }
            else {
                ranges[node.token.value].push(node.token.lineno);
            }
        }
    }
}

class RegisterAllocator {
    regs: boolean[];
    constructor(maxRegs: number) {
        this.regs = []
        for(let i = 0; i < maxRegs; i++) {
            this.regs.push(false);
        }
    }

    markUnavailable(regs: number[]) {
        for(let i = 0; i < regs.length; i++) {
            this.regs[regs[i] - 1] = true;
        }
    }

    getReg() : number {
        for(let i = 0; i < this.regs.length; i++) {
            if(!this.regs[i]) {
                this.regs[i] = true;
                return i+1;
            }
        }
        return -1;
    }

    deallocReg(reg: number) {
        this.regs[reg - 1] = false;
    }
}

function isDigit(x: string) {
    return "0123456789".includes(x);
}