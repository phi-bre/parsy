import {TokenError} from './errors';
import {Position} from './index';
import {Terminal} from './terminal';
import {Token} from './token';

export class Lexer implements Iterable<Token> {
    public readonly [Symbol.iterator] = () => this;
    public cache: Token[];
    public index: number;
    public line: number;
    public column: number;

    constructor(public terminals: Terminal[], public input: string) {
        this.index = this.line = this.column = 0;
        this.cache = [];
    }

    public reset({index, line, column}: Position) {
        this.index = index;
        this.line = line;
        this.column = column;
    }

    get position() {
        const {index, line, column} = this;
        return {index, line, column};
    }

    get done() {
        return this.index >= this.input.length;
    }

    get peek() {
        if (this.index in this.cache)
            return this.cache[this.index];

        for (const terminal of this.terminals) {
            const token = terminal.lex(this);
            if (token) {
                return this.cache[this.index] = token;
            }
        }
    }

    get next() {
        const token = this.peek;
        if (!token) {
            throw new TokenError(this.input, this.position);
        }

        let newlines = 0;
        let last = 0;
        while (last = token.value.indexOf('\n', last) + 1) {
            newlines++;
        }

        this.column = this.index + last;
        this.index += token.value.length;
        this.line += newlines;

        return token.ignore ? this.next : token;
    }
}
