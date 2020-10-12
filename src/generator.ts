export function char([value]: string) {
    return function* (tokens: Iterable<string>): Generator<string | null> {
        for (const token of tokens) {
            yield token === value ? token : null;
        }
    };
}

for (const token of char('a')('aaa')) {
    console.log('asd');
}

export function sequence(...parsers: Array<IterableIterator<any>>) {
    return function* (context: IterableIterator<any>) {
        const pattern = parsers.map((parser) => parser(context));
        for (const parser of pattern) {
            for (const token of parser) {
                yield token;
            }
        }
    };
}

export function alternation(...parsers) {
    return function* (context) {
        const pattern = parsers.map((parser) => parser(context));
        const map = new Map();
        for (const parser of pattern) {
            for (const token of parser) {
                yield [];
            }
        }
    };
}

export function and<T>(...parsers: Array<Generator<T | null>>) {
    return function* (tokens: IterableIterator<any>) {
        const pattern = parsers.map((parser) => parser(tokens));
        for (const parser of pattern) {
            yield* parser;
        }
    };
}

function* advance(tokens) {
    for (const token of tokens) {
        while (!(yield token));
    }
}

export function* or<T>(...parsers: Array<Generator<T | null>>) {
    return function* (tokens) {
        // const stream = advance(tokens);
        for (const token of tokens) {
            for (const parser of parsers) {
                yield parser.next(token);
            }
        }
    };
}

export function* aggregate(tokens) {
    for (const token of tokens) {
        yield [...token];
    }
}

export function join(...parsers) {
    return (tokens) => [[...sequence(...parsers)(tokens)].join('')];
}

interface ParsyStream<T> extends Iterator<T> {
    peek(...args): T;
}

// export function stream<T>(iter: Iterator<T>): ParsyStream<T> {
//     let value: any;
//     return {
//         ...iter,
//         next(...args: any) {
//             if (value === undefined) {
//                 return iter.next(...args);
//             } else {
//                 const temp = value;
//                 value = undefined;
//                 return temp;
//             }
//         },
//         peek(...args: any): any {
//             if (value === undefined) {
//                 return value = iter.next(...args);
//             } else {
//                 const temp = value;
//                 value = undefined;
//                 return temp;
//             }
//         },
//     }
// }

export function parsy(grammar: GeneratorFunction) {
    return function (input: string, index = 0) {
        return [...grammar(input.substring(index)[Symbol.iterator]())];
    };
}
