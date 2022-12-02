import { CodeGeneration } from "../src/codegen";
import { lex } from "../src/lexer";
import { Parser } from "../src/parser";
import { TypeChecker } from "../src/typecheck/typechecker";
import "./editor/editor";

console.log("hello world");
{
const output_container = document.getElementById("outputs") as HTMLOutputElement;
const buttons = output_container.querySelectorAll("nav button") as NodeListOf<HTMLButtonElement>;
const divs = output_container.querySelectorAll("div");

function select(select: number) {
    for (let i = 0; i < divs.length; i++) {
        if (i === select) {
            divs[i].classList.remove("hidden");
        } else {
            divs[i].classList.add("hidden");
        }
    }
}
select(2);
buttons.forEach((button, i) => {
    button.onclick = e => select(i);
});
}
{
    const code = document.getElementById("code") as HTMLTextAreaElement;
    const errorOutput = document.getElementById("error") as HTMLOutputElement;
    const lexOutput = document.getElementById("lexer") as HTMLOutputElement;
    const parseOutput = document.getElementById("parser") as HTMLOutputElement;
    const codegenOutput = document.getElementById("urcl") as HTMLOutputElement;
    const error_button = document.getElementById("error-button") as HTMLButtonElement;

    code.oninput = oninput;
    function oninput() {
        errorOutput.value = "";
        lexOutput.value = "";
        parseOutput.value = "";
        error_button.classList.remove("error");
        try {
        const results = lex(code.value.split("\n"));
        let lexString = "";
        for (const r of results) {
            lexString += r + "\n";
        }
        lexOutput.value = lexString;
        
        const parser = new Parser();
        const parseResults = parser.parse(results);
        let parseString = "";
        for (const r of parseResults) {
            console.log(r);
            parseString += r.toString() + "\n"; // JSON.stringify(r, null, 2) + "\n";
        } 
        parseOutput.value = parseString;

        const checkResults = new TypeChecker(parser.err).check(parseResults);

        // TODO: skip codegen on error
        const codegen = new CodeGeneration(7);
        const asms = codegen.gen(parseResults);
        let result = "";
        for (const asm of asms) {
            console.log(asm);
            const token = asm.source.start;
            //result += "// " + token.lineno + "\n";
          let instrsInAsm = asm.instrs;
          for (const instr of instrsInAsm) {
            result += instr + "\n";
          }
          result += "\n";
        }
        console.log(result);
        console.log(codegenOutput);
        codegenOutput.value = result;

        console.log(parser.err);
        if (parser.err.has_error()) {
            errorOutput.value = parser.err.toString();
            error_button.classList.add("error");
        }

        } catch (e) {
            if (e instanceof Error) {
                errorOutput.value = "[ERROR]:\n" + e.message;
            }
            error_button.classList.add("error");
        }
    };
    oninput();
}