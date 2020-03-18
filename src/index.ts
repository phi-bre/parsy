import {tokenize} from './lexer';
import {tree} from './builder';

export * from './builder';

export interface State<T, R> {
    tokens: Tokens<T>;
    node: Node<T, R>;
    matchers: {
        [type: string]: any;
    }
}

export interface Tokens<T, S = { index: number, line: number, column: number }> extends Iterable<Token<T>> {
    cache: Token<T>[];
    index: number;
    line: number;
    column: number;
    readonly done: boolean;
    readonly peek: Token<T>;
    readonly next: Token<T>;
    readonly position: S;
    reset(position: S);
}

export interface Node<T, R> extends Array<Token<R> | Node<T, R>> {
    parent: Node<T, R>;
    type: T;
}

export interface Token<T> {
    type: T;
    value: string;
    column?: number;
    line?: number;
    index?: number;
}

export interface Matcher<T, R> {
    (store: State<T, R>);
}

export interface Terminal<T> {
    (input: string, index: number): Token<T> | undefined;
}

export type Reference<T, R> = any // ((keyof (T | R)) | symbol);

export interface ParsyOptions<T, R> {
    ignore: RegExp;
    terminals: {
        [P in keyof T]: string | RegExp;
    };
    rules: {
        [P in keyof R]: symbol;
    };
    start: keyof R;
}

export function parsy<T, R>(options: ParsyOptions<T, R>) {

    function scan(input: string) {
        if (!options.terminals)
            throw 'No terminals provided.';
        return tokenize(options)(input);
    }

    function build(input: string) {
        if (!options.rules)
            throw 'No rules provided.';
        if (!options.start)
            throw 'No start provided.';
        return tree(options)(scan(input));
    }

    return {scan, build};
}
