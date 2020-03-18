import {ParsyOptions, Terminal, Token, Tokens} from './index';

export function tokenize<T, R>(options: ParsyOptions<T, R>) {
    const symbol = Symbol('ignore');
    const terminals = [] as Terminal<T>[];
    for (const type in options.terminals) {
        terminals.push(terminal<T>(type as any, options.terminals[type]));
    }
    terminals.push(terminal(symbol as any, options.ignore));

    return function (input: string): Tokens<T> {
        return {
            cache: [],
            index: 0,
            line: 0,
            column: 0,
            get peek() {
                const {index, cache} = this;

                if (index in cache) {
                    return cache[index];
                }

                for (const terminal of terminals) {
                    const token = terminal(input, index);
                    if (token) {
                        return token;
                    }
                }

                throw 'Unexpected token: ' + input[index];
            },
            get next() {
                const {index, line, column} = this;
                const token = this.peek;
                const newlines = token.value.split('\n');
                this.index += token.value.length;
                this.line += newlines.length - 1;
                this.column = newlines[newlines.length - 1].length;

                // @ts-ignore
                if (token.type === symbol) {
                    return this.next;
                }

                token.index = index;
                token.line = line;
                token.column = column;
                return token;
            },
            get position() {
                return {
                    index: this.index,
                    line: this.line,
                    column: this.column,
                };
            },
            get done() {
                return this.index < input.length;
            },
            reset({index, line, column}) {
                this.index = index;
                this.line = line;
                this.column = column;
            },
            *[Symbol.iterator]() {
                while (this.index < input.length) {
                    yield this.next;
                }
            }
        }
    }
}

function terminal<T>(type: T, value: string | RegExp): Terminal<T> {
    if (typeof value === 'string') {
        return function (input, index) {
            if (input.startsWith(value, index)) {
                return {type, value};
            }
        }
    } else {
        const pattern = new RegExp(value.source, 'y');
        return function (input, index) {
            pattern.lastIndex = index;
            const match = pattern.exec(input);
            if (match) {
                return {type, value: match[0]};
            }
        };
    }
}
