import { lex } from "../../src/lexer.ts";
import { Token } from "../../src/token.ts";
import { l } from "./l.ts"

export class Editor_Window extends HTMLElement {
    private line_nrs: HTMLElement;
    private code: HTMLElement;
    private input: HTMLTextAreaElement;
    private colors: HTMLElement;
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
        this.onscroll = () => this.render_lines();

        const resize_observer = new ResizeObserver(() => this.render_lines());
        resize_observer.observe(this);
    }
    public get_tokens!: (src: string) => Token[]; 

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
            } else {
                let src = this.input.value;
                if (event.shiftKey){
                    foreach_line_selected(src, start, end, (i) => {
                        const white_width = (regex_end(src, i, /^\s*/) ?? i) - i;
                        const delete_count = white_width === 0 ? 0 : white_width % this.tab_width || this.tab_width;
                        if (i < start){start -= delete_count;}
                        end -= delete_count;
                        src = str_splice(src, i, delete_count, "");
                        return src;
                    });
                    this.input.value = src;
                    this.input.selectionStart = start;
                    this.input.selectionEnd = end;
                } else {
                    foreach_line_selected(src, start, end, (i) => {
                        const white_width = (regex_end(src, i, /^\s*/) ?? i) - i;
                        const add_count = this.tab_width - (white_width % this.tab_width) || this.tab_width;
                        if (i < start){start += add_count;}
                        end += add_count;
                        src = str_splice(src, i, 0, " ".repeat(add_count));
                        return src;
                    });
                    this.input.value = src;
                    this.input.selectionStart = start;
                    this.input.selectionEnd = end;
                }
            }
            this.input_cb();
        } else if (event.key === "/" && event.ctrlKey) {
            let start = this.input.selectionStart;
            let end = this.input.selectionEnd;
            let src = this.input.value;
            foreach_line_selected(src, start, end, (i) => {
                const white_end = regex_end(src, i, /^\s*/) ?? i;
                if (regex_end(src, white_end, /^\/\//) === undefined){
                    src = str_splice(src, white_end, 0, "// ");
                    if (i < start){start += 3;}
                    end += 3;
                } else {
                    const delete_count = src[white_end + 2] === " " ? 3 : 2;
                    src = str_splice(src, white_end, delete_count, "");
                    if (i < start){start -= delete_count;}
                    end -= delete_count;
                }
                return src;
            });
            this.input.value = src;
            this.input.selectionStart = start;
            this.input.selectionEnd = end;
            this.input_cb();
        }
        if (event.key === "{") {
            event.preventDefault();
            const start = this.input.selectionStart;
            const end = this.input.selectionEnd;
            const value = this.input.value;
            this.input.value = value.slice(0, start) + "{" + value.slice(start, end) + "}" + value.slice(end);
            this.input.selectionStart = start + 1;
            this.input.selectionEnd = end + 1;
            this.input_cb();
        }
        if (event.key === "Enter" && this.input.selectionStart === this.input.selectionEnd) {
            event.preventDefault();
            const start = this.input.selectionStart;
            const value = this.input.value;
            let indent = 0;
            for (let i = 0; i < start; i++) {
                if (value[i] === '{'){indent++;}
                if (value[i] === '}'){indent--;}
            }
            this.input.value = value.slice(0, start) + "\n" + " ".repeat(indent * this.tab_width) 
                + (value[start] === "}" ? "\n" + " ".repeat((indent-1) * this.tab_width) : "") + value.slice(start);
            this.input.selectionStart = this.input.selectionEnd = start + 1 + this.tab_width * indent;
            this.input_cb();
        }
        backspace:
        if (event.key === "Backspace" && this.input.selectionStart === this.input.selectionEnd) {
            const start = this.input.selectionStart;
            const value = this.input.value;
            const start_line = value.substring(0, start).lastIndexOf("\n") + 1;// lastIndexOf(value, "\n", start);
            if (!/^ +$/.test(this.value.substring(start_line, start))) {
                console.log(start_line, start, JSON.stringify(this.value.substring(start_line, start)))
                break backspace
            }
            const spaces = start - start_line;
            const tabs = spaces / this.tab_width;
            const nearest = 0| tabs;
            const new_tabs = nearest !== tabs ? nearest : tabs - 1;
            const new_spaces = new_tabs * this.tab_width;
            this.input.value = value.slice(0, start_line) + " ".repeat(new_spaces) + value.slice(start);
            this.input.selectionStart = this.input.selectionEnd = start_line + new_spaces;
            event.preventDefault();
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
        const all_tokens = this.get_tokens(this.value);
        // for (let i = 0; )

        let token_i = 0;

        while (token_i < all_tokens.length && all_tokens[token_i].lineno <= start) {
            token_i++;
        }

        for (let i = start; i < end && token_i < all_tokens.length; i++) {
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

function regex_end(src: string, i: number, regex: RegExp): undefined | number {
    const res = regex.exec(src.substring(i));
    if (res === null || res.index !== 0){return undefined;}
    return i + res[0].length;
}

function lastIndexOf(src: string, match: string, i: number): number {
    const index = src.lastIndexOf(match, i);
    return index < 0 ? 0 : index;
}