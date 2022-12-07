import { Allocator } from "./allocator.ts";
import * as ast from "../ast.ts";
import {Asm} from "./asm.ts";
import {URCLAsm} from "./urclasm.ts";
import { ErrorContext } from "../errors.ts";

export class CodeGeneration {
    allocator: Allocator;
    asm: Asm;
    err: ErrorContext;

    constructor(maxRegs: number) {
        this.allocator = new Allocator(maxRegs);
        this.asm = new URCLAsm();
        this.err = new ErrorContext();
    }

    gen(astNodes: ast.Statement[]) : Asm {
        this.allocator.initializeRanges(astNodes);
        for(const astNode of astNodes) {
            this.genStatement(astNode);
        }
        return this.asm;
    }

    genBody(body: ast.Body) {
        for(const statement of body.content) {
            this.genStatement(statement);
        }
    }

    genStatement(statement: ast.Statement) {
        if(statement instanceof ast.Declaration) {
            this.genDeclaration(statement);
        }
        else if(statement instanceof ast.Assignment) {
            this.genAssignment(statement);
        }
        else {
            //error - No code gen for this statement
            return;
        }
    }

    genAssignment(assign: ast.Assignment) {
        const varName: string = assign.name.token.value;
        this.genExpression(assign.expr, this.allocator.getVarReg(assign.name.token.lineno, varName));
    }

    genDeclaration(dec: ast.Declaration) {
        const varType: ast.TypeNode = dec.vartype;
        const varName: string = dec.name.token.value;
        const destReg: number = this.allocator.getVarReg(dec.name.token.lineno, varName);

        if(dec.expr) {
            this.genExpression(dec.expr, destReg);
        }
    }

    genExpression(expr: ast.Expression, reg: number | undefined) : number {
        if(expr instanceof ast.Number) {
            if(reg === undefined) {
                reg = this.allocator.getReg(expr.token.lineno);
            }
            this.asm.putLI(reg, parseInt(expr.token.value, 10));
            return reg;
        }
        else if(expr instanceof ast.Identifier) {
            return this.allocator.getVarReg(expr.token.lineno, expr.token.value);
        }
        else if(expr instanceof ast.BinaryOp) {
            const reg1: number = this.genExpression(expr.expr1, reg);
            const reg2: number = this.genExpression(expr.expr2, reg);
            let dest: number = reg1;
            if(reg) {
                dest = reg;
            }
            switch(expr.op.value) {
                case "+": {
                    this.asm.putADD(dest, reg1, reg2); break;
                }
                case "-": {
                    this.asm.putSUB(dest, reg1, reg2); break;
                }
                case "*": {
                    this.asm.putMULT(dest, reg1, reg2); break;
                }
                case "/": {
                    this.asm.putDIV(dest, reg1, reg2); break;
                }
                default : {
                    this.err.throw(expr.op, "Unsupported operation");
                }
            }
            return dest;
        }
        return -1;
    }
}