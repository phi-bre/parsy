type Without<T, U> = T extends U ? never : T;

export interface ParsyParser<T extends ParsyContext> {
    (ctx: ParsyContext): T;
}

export interface ParsyText extends ParsyContext {
    type: 'text';
    text: string;
}

export interface ParsyError extends ParsyContext {
    type: 'error';
    expected: string;
}

export interface ParsyEmpty extends ParsyContext {
    type: 'empty';
}

export interface ParsyCollection<T extends ParsyContext> extends ParsyContext {
    type: 'collection';
    children: T[];
}

export interface ParsyContext {
    type: string;
    source: string;
    start: number;
    end: number;
}

export interface ParsyTransformer<T, R> {
    (context: T extends ParsyError ? never : T): R;
}

export function string(value: string): ParsyParser<ParsyText | ParsyError> {
    return function (ctx) {
        if (ctx.source.startsWith(value, ctx.end)) {
            return { ...ctx, from: ctx.end, to: ctx.end + value.length, text: value, type: 'text' };
        } else {
            return { ...ctx, expected: value, type: 'error' };
        }
    };
}

export function regex(regex: RegExp, expected: string): ParsyParser<ParsyText | ParsyError> {
    return function (ctx) {
        regex.lastIndex = ctx.end;
        const match = regex.exec(ctx.source);
        if (match?.index === ctx.end) {
            return { ...ctx, from: ctx.end, to: ctx.end + match[0].length, text: match[0], type: 'text' };
        } else {
            return { ...ctx, expected, type: 'error' };
        }
    };
}

export function sequence<P extends ParsyContext>(...parsers: ParsyParser<P>[]): ParsyParser<ParsyCollection<Without<P, ParsyError> | ParsyError>> {
    return function (ctx: ParsyContext) {
        const children: Without<P, ParsyError>[] = [];
        for (const parser of parsers) {
            const child: ParsyContext = parser(ctx);
            if (child.type === 'error') return child as ParsyError;
            children.push(child as Without<P, ParsyError>);
            ctx = child;
        }
        return { ...ctx, children, type: 'collection' } as any;
    };
}

export function any<T extends ParsyParser<any>[]>(...parsers: T): ParsyParser<ReturnType<T[number]>> {
    return function (ctx) {
        let furthest: ParsyError | null = null;
        for (const parser of parsers) {
            const token = parser(ctx);
            if (token.type !== 'error') return token;
            if (!furthest || furthest.start < token.index) {
                furthest = token;
            }
        }
        return furthest;
    };
}

// export function skip<T, S>(parser: ParsyParser<T, S>): ParsyParser<ParsyError | null> {
//     return transform(parser, ctx => {
//
//     });
// }

export function optional<T extends ParsyContext>(parser: ParsyParser<T>): ParsyParser<T extends ParsyError ? (Without<T, ParsyError> | ParsyEmpty) : T> {
    return any(parser, (ctx): ParsyEmpty => ({ ...ctx, type: 'empty' }));
}

export function many<T extends ParsyContext>(parser: ParsyParser<T>): ParsyParser<ParsyCollection<T>> {
    return function (ctx) {
        let children: T[] = [];
        let child: ParsyContext = ctx;
        while (true) {
            child = parser(child);
            if (child.type === 'error') break;
            children.push(child as T);
        }
        return { ...ctx, children, type: 'collection' };
    };
}

export function transform<T extends ParsyContext, R extends ParsyContext>
    (parser: ParsyParser<T>, transformer: ParsyTransformer<T, R>): ParsyParser<R | ParsyError> {
    return function (ctx) {
        const token: ParsyContext | ParsyError = parser(ctx);
        if (token.type === 'error') return token as ParsyError;
        return transformer(token as Without<T, ParsyError>);
    };
}

function parsy<T extends ParsyContext>(parser: ParsyParser<T>) {
    return function (source: string): T {
        return parser({ source, start: 0, end: 0, type: 'parsy' });
    };
}

const num = transform(regex(/[+\-]?[0-9]+(\.[0-9]*)?/g, 'number'), ctx => {
    return { ...ctx, number: Number(ctx.text), type: 'number' };
});

const s = sequence(optional(string(',')), string('a'));

const id = regex(/[a-zA-Z][a-zA-Z0-9]*/g, 'identifier');
const func = (ctx: ParsyContext) => sequence(id, string('('), many(sequence(expr, optional(string(',')))), string(')'))(ctx);
const expr = any(func, num);

const source = 'Foo(Bar(1,2,3))';
const parser = parsy(expr);
console.log(JSON.stringify(parser(source), null, 2));

const tree = parsy(s)(source);
if (tree.type === 'text') {
    console.log(tree.text);
}

interface asd { type: string }
interface asf extends asd { type: 'a' }
const a: asf = { type: 'a' };
const b: asd = { type: 'b' };
const c: asf | asd = b;

if (c.type === 'a') {
    a.type
}

