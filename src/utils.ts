import { ParsyParser } from './index';

export function collect<T>(
    iterator: IterableIterator<T>,
    listen?: (value: T) => void
): Array<T> | null {
    const values = new Array<T>();
    let result = iterator.next();
    while (!result.done) {
        listen && listen(result.value);
        values.push(result.value);
        result = iterator.next();
    }
    return result.value ? values : null;
}

export function split(...parsers: ParsyParser[]): ParsyParser {
    return function* (context) {
        const pattern = parsers.map((parser) => parser(context));
        while (parsers.length > 1) {
            yield pattern.map((parser) => parser.next());
        }
        return yield* pattern[0];
    };
}

export function assign(
    helper: (...args: any) => (...args: any) => any,
    ...args
) {
    const target = (context) => helper(...args)(context);
    return Object.assign(target, {
        set(...values) {
            args = values;
            return target;
        },
    });
}
