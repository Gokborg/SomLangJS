import { lex } from "../../src/lexer";
import { Token } from "../../src/token";
import { l } from "./l"

export class Editor_Window extends HTMLElement {
    private line_nrs: HTMLElement;
    private code: HTMLElement;
    private input: HTMLTextAreaElement;
    private colors: HTMLElement;
    // private profile_check = document.createElement("input");
    private profiled: boolean[] = [];
    private profile_present: boolean = false;
    private lines: string[] = [];
    tab_width = 4
    constructor(){
        super();
        l(this, {}, 
            this.line_nrs = l("div", {className: "line-nrs"}),
            this.code = l("div", {className: "code"},
                this.input = l("textarea", {spellcheck: false}),
                this.colors = l("code", {className: "colors"})
            ),
        );

        this.input.addEventListener("input", this.input_cb.bind(this));

        this.input.addEventListener("keydown", this.keydown_cb.bind(this));
        const resize_observer = new ResizeObserver(() => this.render_lines());
        resize_observer.observe(this);


        this.onscroll = () => this.render_lines();
    }
    get value(){
        return this.input.value;
    }
    set value(value){
        this.input.value = value;
        this.input_cb()
    }
    private pc_line = 0;
    public set_pc_line(line: number){
        const old = this.line_nrs.children[this.pc_line];
        if (old){
            old.classList.remove("pc-line");
        }

        const child = this.line_nrs.children[line];
        if (child){
            child.classList.add("pc-line");
        }
        this.pc_line = line;
    }
    private keydown_cb(event: KeyboardEvent){
        if (event.key === "Tab"){
            event.preventDefault();
            let start = this.input.selectionStart;
            let end = this.input.selectionEnd;
            if (!event.shiftKey && start === end){
                const value = this.input.value;
                const line_offset = start - line_start(value, start);
                const add_count = this.tab_width - (line_offset % this.tab_width) || this.tab_width
                this.input.value = str_splice(value, start, 0, " ".repeat(add_count));
                this.input.selectionStart = this.input.selectionEnd = start + add_count;
            }
            this.input_cb();
        }
    }
    private input_cb(){
        this.render_lines();
        this.call_input_listeners();
    }

    private render_lines(){
        this.input.style.height = "0px";
        const height = this.input.scrollHeight
        this.input.style.height = height + "px";

        this.input.style.width = "0px";
        this.input.style.width = this.input.scrollWidth + "px";
        
        const lines = this.input.value.split("\n");
        this.lines = lines;
        {
            const width = (lines.length+"").length
            const start_lines = this.line_nrs.children.length
            const delta_lines = lines.length - start_lines;
            if (delta_lines > 0){
                for (let i = 0; i < delta_lines; i++){
                    const div = this.line_nrs.appendChild(document.createElement("div"));
                    div.textContent = (""+(start_lines+i+1)).padStart(width);
                }
            } else {
                for (let i = 0; i < -delta_lines; i++){
                    this.line_nrs.lastChild?.remove()
                }
            }
        }

        const ch = this.input.scrollHeight / Math.max(1, this.lines.length);
    
        const pixel_start = this.scrollTop;
        const pixel_end = Math.min(pixel_start + this.clientHeight, this.input.scrollHeight);

        const start = Math.floor(pixel_start / ch);
        const end = Math.min(this.lines.length, Math.ceil(pixel_end / ch));

        this.colors.style.top = (start*ch) + "px";


        let div: Element | null = this.colors.firstElementChild;
        const all_tokens = lex(this.lines);
        // for (let i = 0; )

        console.log(all_tokens);
        let token_i = 0;

        for (let i = start; i < end; i++) {
            const line = this.lines[i].replaceAll("\r", "");
            if (div === null) {
                div = document.createElement("div");
                this.colors.appendChild(div);
            }

            div.innerHTML = "";
            let start = 0;

            let span: Element | null = div.firstElementChild;
            if (line.length == 0) {
                div.innerHTML = "<span> </span>";
            } else {
                while (token_i < all_tokens.length){
                    const token = all_tokens[token_i];
                    if ( token.lineno > i + 1) {
                        break;
                    }
                    console.log(token.start, start);
                    if (token.start > start - 1) {
                        if (span === null){
                            span = document.createElement("span");
                            div.appendChild(span);
                        }
                        span.textContent = " ".repeat(token.start - start);
                        span.className = "white";
                        span = span.nextElementSibling;
                    }

                    start = token.start + token.value.length;
                    token_i += 1;

                    if (span === null){
                        span = document.createElement("span");
                        div.appendChild(span);
                    }
                    span.textContent = token.value;
                    span.className = token.kind;

                    span = span.nextElementSibling;
                }
            }

            while (span !== null){
                const next = span.nextElementSibling;
                div.removeChild(span);
                span = next
            }
            div = div.nextElementSibling;
        }

        while (div !== null){
            const next = div.nextElementSibling;
            this.colors.removeChild(div);
            div = next;
        }
    }

    private call_input_listeners(){
        for (const listener of this.input_listeners){
            listener.call(this, new Event("input"));
        }
    }

    private input_listeners: ((this: GlobalEventHandlers, event: Event) => void)[] = [];
    set oninput(cb: (this: GlobalEventHandlers, event: Event) => void){
        this.input_listeners.push(cb);
    }
}
customElements.define("editor-window", Editor_Window);


function str_splice(string: string, index: number, delete_count: number, insert: string){
    return string.slice(0, index) + insert + string.slice(index + delete_count);
}


function foreach_line_selected(string: string, start: number, end: number, callback: (i: number) => string) {
    const first_line = line_start(string, start);
    let i = string.indexOf("\n", first_line) + 1 || string.length;
    let line_count = 1;
    for (;i < end; i = string.indexOf("\n", i) + 1 || string.length){
        line_count++;
    }
    for (let line = 0, i = first_line; line < line_count; line++){
        string = callback(i);
        i = string.indexOf("\n", i) + 1 || string.length;
    }
    return string;
}

function line_start(string: string, index: number): number {
    let i = 0, line_start = 0;
    for (;i <= index; i = string.indexOf("\n", i) + 1 || string.length){
        line_start = i;
        if (i >= string.length){
            line_start+1;
            break;
        }
    }
    return line_start;
}
