import {Position} from './index';
import {Token} from './token';

export type Terminal = (lexer: Lexer) => Token | void;

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
            const token = terminal(this);
            if (token) {
                return this.cache[this.index] = token;
            }
        }
    }

    get next() {
        const token = this.peek;

        if (!token) {
            if (this.input.substr(this.index, 1) === '') {
                throw 'Unexpected end of file.';
            }
            throw 'Unexpected token ' + this.input.substr(this.index, 1);
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
