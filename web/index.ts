import { Identifier } from "../src/ast.ts";
import { CodeGeneration } from "../src/codegen.ts";
import { lex } from "../src/lexer.ts";
import { Parser } from "../src/parser.ts";
import { Kind, Token } from "../src/token.ts";
import { TypeChecker } from "../src/typecheck/typechecker.ts";
import "./editor/editor.ts";
import { Editor_Window } from "./editor/editor.ts";

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
select(3);
buttons.forEach((button, i) => {
    button.onclick = e => select(i);
});
}
{
    const code = document.getElementById("code") as Editor_Window;
    const errorOutput = document.getElementById("error") as HTMLOutputElement;
    const lexOutput = document.getElementById("lexer") as HTMLOutputElement;
    const parseOutput = document.getElementById("parser") as HTMLOutputElement;
    const checkerOutput = document.getElementById("checker") as HTMLOutputElement;
    const codegenOutput = document.getElementById("urcl") as HTMLOutputElement;
    const error_button = document.getElementById("error-button") as HTMLButtonElement;

    // code.oninput = oninput;
    code.get_tokens = oninput;
    function oninput(src: string) {
        localStorage.setItem("som", src);
        errorOutput.textContent = "";
        lexOutput.textContent = "";
        parseOutput.textContent = "";
        error_button.classList.remove("error", "warning")
        let tokens: Token[] = [];
        try {
        if (code.value.length < 1) {
            return tokens;
        }
        const results = tokens = lex(code.value.split("\n"));
        let lexString = "";
        for (const r of results) {
            lexString += r + "\n";
        }
        lexOutput.textContent = lexString;
        
        const parser = new Parser();
        const parseResults = parser.parse(results);
        let parseString = "";
        for (const r of parseResults) {
            parseString += r.toString() + "\n"; // JSON.stringify(r, null, 2) + "\n";
        } 
        parseOutput.textContent = parseString;

        const checker = new TypeChecker(parser.err)
        checker.check(parseResults);
        checkerOutput.textContent = checker.toString();

        // TODO: skip codegen on error
        const codegen = new CodeGeneration(7);
        const asm = codegen.gen(parseResults);
        codegenOutput.textContent = asm.toString();

        errorOutput.textContent = parser.err.toString();
        if (parser.err.has_error()) {
            error_button.classList.add("error");
        } else if (parser.err.has_warning()) {
            error_button.classList.add("warning");
        }

        code.get_symbols = i => {
            const symbols: Token[] = [];
            let name: undefined | Token;
            for (const token of tokens) {
                const {kind, offset, end_offset} = token;
                if (kind !== Kind.WHITESPACE &&  i >= offset && i <= end_offset) {
                    name = token;
                    break;
                }
            }
            if (name === undefined) {
                return symbols;
            }
            const variable = checker.variables.get(name);
            if (variable === undefined) {
                return symbols;
            }
            if (variable.definition) {
                symbols.push(variable.definition.start);
            }
            symbols.push(...variable.references.map(n => n.start));

            return symbols.sort((a, b) => a.offset - b.offset);
        }

        return results;

        } catch (e) {
            if (e instanceof Error) {
                console.error(e);
                errorOutput.textContent = "[ERROR]:\n" + e.message;
            }
            error_button.classList.add("error");
        }

        return tokens;
    };
    const file = localStorage.getItem("som");
    if (file) {
        code.value = file;
    }

    const url = new URL(document.URL);
    const srcurl = url.searchParams.get("srcurl");
    if (srcurl) {
        fetch(srcurl).then(res => res.text())
            .then(text => {if(!code.value){code.value = text}});
    } else if (!code.value) {
        code.value = `uint a = 10;\nuint* p = &a;\nuint b = *p;`;
    }

}