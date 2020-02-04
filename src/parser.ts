//
// const type = (type: string) => (...symbols: any) => (symbols.type = type, symbols);
// export const group = type('group');
// export const maybe = type('maybe');
// export const some = type('some');
// export const one = type('one');
//
// interface Matcher extends Array<string | Matcher> {
//     type: string;
// }

export default function (store: any) {

    return function (start) {
        return function* (tokens) {
            for (const token of tokens) {

            }
        }
    }
}

function* group(...rules: (symbol | typeof group)[]) {
    for (const rule of rules) {
        if (typeof rule === 'symbol') {

        }
    }
}

// export default function parser<T>(matchers: {[matcher: string]: Matcher}) {
//     function* stack(lexer: Iterable<Token>, matcher: Matcher): Iterable<any> {
//         for (const token of lexer) {
//             let node: Node | null = null;
//             for (const symbol of matcher) {
//
//                 if (symbol in matchers) {
//                     yield {
//                         type: symbol,
//                         value: null
//                     }
//                 }
//
//
//                 if (typeof symbol !== 'string') {
//                     yield {
//                         type: symbol,
//                         values: [...stack(lexer, matcher)]
//                     }
//                 } else {
//                     // console.log(token, symbol)
//                     if (token.type === symbol) {
//                         // node = {value: , type: symbol}
//                     }
//                 }
//             }
//         }
//     }
//     return (lexer: Iterable<Token>) => stack(lexer, matchers['.']);
// }


