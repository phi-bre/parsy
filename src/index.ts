import {tokenize} from './lexer';

export * from './matchers';

export interface Token {
    type: string | symbol;
    value: string;
    length: number;
    column: number;
    line: number;
    index: number;
}

export interface Terminal {
    (input: string, index: number): Token | undefined;
}

export interface Rule {
    (tokens: Token[]): boolean;
}

export interface Rules<T> {
    [label: string]: (t: { [P in keyof this]: Rule }) => Rule;
}

export interface Terminals {
    [label: string]: string | RegExp;
}

export interface ParsyOptions<T = Terminals> {
    ignore: RegExp;
    terminals: T;
    rules: Rules<T>;
}

function assert(property: any, message: string) {
    if (!property) {
        throw message;
    }
}

export function parsy(options: ParsyOptions) {
    return {
        scan(input: string) {
            assert(options.terminals, 'No terminals provided.');
            return tokenize(options)(input);
        },
    }
}
