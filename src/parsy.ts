import { and, or, terminal } from './core';
import {
    ParsyContext,
    ParsyParser,
    ParsyToken,
    ParsyTransformer,
} from './index';
import { assign, collect } from './utils';

export function sequence<I, O>(
    ...parsers: Array<ParsyParser<I, O>>
): ParsyParser<I, O> {
    return parsers.reduce(and);
}

export function aggregate<I, O>(parser: ParsyParser<I, O>): ParsyParser<I, O> {
    return terminal((context) => collect(parser(context)));
}

export function alternation<I, O>(
    ...parsers: Array<ParsyParser<I, O>>
): ParsyParser<I, O> {
    return parsers.map(aggregate).reduce(or);
}

export function repeated<I, O>(parser: ParsyParser<I, O>): ParsyParser<I, O> {
    const self = assign(and);
    return self.set(parser, optional(self));
}

export function optional<I, O>(parser: ParsyParser<I, O>): ParsyParser<I, O> {
    return function* (context) {
        return (yield* parser(context)) || true;
    };
}

export function not<I, O>(parser: ParsyParser<I, O>): ParsyParser<I, O> {
    return function* (context) {
        return !(yield* parser(context));
    };
}

// export function transform<I, O, T>(parser: ParsyParser<I, O>, transformer: ParsyTransformer<O[], T>): ParsyParser<I, T> {
//     return terminal(context => {
//         const value = collect(reduce(parser)(context));
//         return value ? [transformer(value)] : null;
//     });
// }

// export function drive<O extends { length: number }>(parser: ParsyParser<ParsyContext, O>): ParsyParser<ParsyContext, O> {
//     return function* ({ input, index }) {
//         const context: ParsyContext = { input, index };
//         const iterator = parser(context);
//         let result = iterator.next();
//         while (!result.done) {
//             context.index += result.value.length;
//             yield result.value;
//             result = iterator.next();
//         }
//         return result.value;
//     }
// }

export function reduce<O extends { length: number }>(
    parser: ParsyParser<ParsyContext, O>
): ParsyParser<ParsyContext, O> {
    return terminal(({ input, index }) => {
        const context: ParsyContext = { input, index };
        return collect(
            parser(context),
            (value) => (context.index += value.length)
        );
    });
}

export function rule<T extends { length: number }>(type: string) {
    return assign(
        (
            parser: ParsyParser<ParsyContext, T>
        ): ParsyParser<ParsyContext, ParsyToken> => {
            return terminal(({ input, index }) => {
                const context: ParsyContext = { input, index };
                const tokens = collect(
                    parser(context),
                    (value) => (context.index += value.length)
                );
                if (tokens) {
                    const length = context.index - index;
                    const value = input.substr(index, length);
                    return [{ input, index, value, tokens, length, type }];
                } else return null;
            });
        }
    );
}

export function parsy<O>(parser: ParsyParser<ParsyContext, O>) {
    return (input: string, index = 0) => {
        return collect(rule('root').set(parser)({ input, index }));
    };
}
