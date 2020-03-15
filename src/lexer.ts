
export interface Token<T = string> {
    type: keyof T;
    value: string;
    column: number;
    line: number;
    offset: number;
}

export default function lexer<T extends { [type: string]: RegExp }>(terminals: T) {
    // @ts-ignore
    Object.keys(terminals).forEach(type => terminals[type] = new RegExp('^(' + terminals[type].source + ')'));
    return function* (source: string): IterableIterator<Token<T>> {
        let column = 0, line = 0;
        main: for (let offset = 0; offset < source.length; offset++) {
            const rest = source.substr(offset);
            for (const type in terminals) {
                const match = terminals[type].exec(rest);
                if (match) {
                    const [value] = match;
                    // column = offset / line;
                    offset += value.length - 1;
                    line += value.split('\n').length - 1;
                    if (type !== '_') {
                        yield {type, value, column, line, offset};
                    }
                    continue main;
                }
            }
            throw 'Unexpected token: ' + source[offset]
        }
    }
}
