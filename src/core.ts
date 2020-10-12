import { ParsyParser } from './index';

export function terminal<I, O>(
    evaluate: (context: I) => Iterable<O> | null
): ParsyParser<I, O> {
    return function* (context) {
        const value = evaluate(context);
        if (value === null) {
            return false;
        } else {
            yield* value;
            return true;
        }
    };
}

export function and<I, O>(
    left: ParsyParser<I, O>,
    right: ParsyParser<I, O>
): ParsyParser<I, O> {
    return function* (context) {
        return (yield* left(context)) && (yield* right(context));
    };
}

export function or<I, O>(
    left: ParsyParser<I, O>,
    right: ParsyParser<I, O>
): ParsyParser<I, O> {
    return function* (context) {
        return (yield* left(context)) || (yield* right(context));
    };
}
