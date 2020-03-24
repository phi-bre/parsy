export * from './builder';
export * from './lexer';

export interface Position {
    index: number;
    line: number;
    column: number;
}

export interface Tokens extends Iterable<Token> {
    input: string;
    cache: Token[];
    index: number;
    line: number;
    column: number;
    readonly done: boolean;
    readonly peek: Token | undefined;
    readonly next: Token;
    readonly position: Position;
    reset(position: Position);
}

export class Token {
    constructor(
        public type: string | symbol,
        public value: string,
        public position: Position,
    ) {}
}

export class Node extends Array<Node | Token> {
    constructor(
        public type: string,
        public parent?: Node,
    ) {
        super();
    }
}

export interface BuilderOptions {
    start: string;
    rules: {
        [rule: string]: symbol;
    };
    scopes: {
        [scope: string]: symbol;
    };
    terminals: {
        [terminal: string]: string | RegExp;
    };
}

export interface LexerOptions {
    ignore?: string | RegExp;
    terminals: {
        [terminal: string]: string | RegExp;
    };
}

export type Matcher = (state: State) => void;
export type Terminal = (input: Tokens) => Token | void;
export type Reference = symbol | string | number;
export type Layer<I, O> = (input: I) => O;
export type ParsyOptions = LexerOptions & BuilderOptions;

export interface State {
    tokens: Tokens;
    node: Node;
    matchers: {
        [matcher: string]: Matcher;
    };
}

export interface Parsy<R> {
    (input: string): R;
    use<T>(layer: (options: ParsyOptions) => Layer<R, T>): Parsy<T>;
}

export function parsy(options: ParsyOptions): Parsy<string> {
    let pipe = i => i;
    const instance = (input: string) => pipe(input);

    instance.use = <I, O>(layer: (config) => Layer<I, O>) => {
        const applied = layer(options);
        const previous = pipe;
        pipe = (input: I) => applied(previous(input));
        return instance;
    };

    return instance;
}
