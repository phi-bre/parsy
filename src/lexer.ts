import {Layer, LexerOptions, Position, Terminal, Token, Tokens} from './index';

export function lexer(options: LexerOptions): Layer<string, Tokens> {
    const ignore = Symbol('ignore');
    const terminals = [] as Terminal[];

    if (!options.terminals)
        throw 'No terminals provided.';

    if (options.ignore)
        terminals.push(terminal(ignore, options.ignore));

    for (const type in options.terminals) {
        if (options.terminals.hasOwnProperty(type)) {
            terminals.push(terminal(type, options.terminals[type]));
        }
    }

    return function (input: string) {
        return new class {
            public input: string = input;
            public cache: Token[] = [];
            public index: number = 0;
            public line: number = 0;
            public column: number = 0;

            get peek() {
                const {index, cache} = this;

                if (index in cache) {
                    return cache[index];
                }

                for (const terminal of terminals) {
                    const token = terminal(this);
                    if (token) {
                        return cache[index] = token;
                    }
                }
            }

            get next() {
                const token = this.peek;

                if (!token) {
                    throw 'Unexpected token: ' + input[this.index];
                }

                const newlines = token.value.split('\n');
                this.index += token.value.length;
                this.line += newlines.length - 1;
                this.column = newlines[newlines.length - 1].length;

                if (token.type === ignore) {
                    return this.next;
                }

                return token;
            }

            get position() {
                const {index, line, column} = this;
                return {index, line, column};
            }

            get done() {
                return this.index >= input.length;
            }

            reset({index, line, column}: Position) {
                this.index = index;
                this.line = line;
                this.column = column;
            }

            * [Symbol.iterator]() {
                while (!this.done) {
                    yield this.next;
                }
            }
        }
    }
}

/**
 * Used internally to create a terminal matcher.
 * @param type
 * @param value
 */
function terminal(type: string | symbol, value: string | RegExp): Terminal {
    if (typeof value === 'string') {
        return function ({input, index, position}) {
            if (input.startsWith(value, index)) {
                return new Token(type, value, position);
            }
        }
    } else {
        const pattern = new RegExp(value.source, 'y');
        return function ({input, index, position}) {
            pattern.lastIndex = index;
            const match = pattern.exec(input);
            if (match) {
                return new Token(type, match[0], position);
            }
        };
    }
}
