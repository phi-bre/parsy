import {ParsyOptions, Terminal, Token} from './index';

export function tokenize(options: ParsyOptions) {
    const symbol = Symbol('ignore');
    const terminals = Object
        .keys(options.terminals)
        .map(type => terminal(type, options.terminals[type]));
    terminals.push(terminal(symbol, options.ignore));

    return function* (string: string) {
        let index = 0;
        let lines = 0;
        let column = 0;

        while (index < string.length) {
            let token: Token | undefined;

            for (const terminal of terminals) {
                token = terminal(string, index);
                if (token) break;
            }

            if (token && token.type !== symbol) {
                token.index = index;
                token.line = lines;
                token.column = column;
                yield token;
            }

            if (token) {
                const newlines = token.value.split('\n');
                index += token.length;
                lines += newlines.length - 1;
                column = newlines[newlines.length - 1].length;
                continue;
            }

            throw 'Unexpected token: ' + string[index];
        }
    }
}

function terminal(type: string | symbol, value: string | RegExp): Terminal {
    if (typeof value === 'string') {
        return function (input, index) {
            if (input.startsWith(value, index)) {
                return {type, value, length: value.length} as Token;
            }
        }
    } else {
        const pattern = new RegExp(value.source, 'y');
        return function (input, index) {
            pattern.lastIndex = index;
            const match = pattern.exec(input);
            if (match) {
                const value = match[1] || match[0];
                return {type, value, length: match[0].length} as Token;
            }
        };
    }
}
