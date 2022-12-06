import { Parser } from "../parser.ts";
import { Kind } from "../token.ts";

export function parseList<T>(parser: Parser, close: Kind, sep: Kind, f: (p: Parser) => T): T[] {
    const args: T[] = [];
    if (parser.buf.next_if(close)) {
        return args;
    }
    do {
        args.push(f(parser));
    } while (parser.buf.next_if(sep) && !parser.buf.current.eq(close))
    parser.buf.expect(close);

    return args;
}