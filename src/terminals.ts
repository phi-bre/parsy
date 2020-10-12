import { ParsyContext, ParsyParser, transform } from './index';
import { terminal } from './core';

export function charset(
    from: string,
    to: string
): ParsyParser<ParsyContext, string> {
    const min = from.charCodeAt(0),
        max = to.charCodeAt(0);
    return terminal(({ index, input }) => {
        const code = input[index]?.charCodeAt(0);
        return code >= min && code <= max ? input[index] : null;
    });
}

export function char([value]: string): ParsyParser<ParsyContext, string> {
    return terminal(({ index, input }) =>
        input[index] === value ? value : null
    );
}

export function string(pattern: string): ParsyParser<ParsyContext, string> {
    return terminal(({ index, input }) =>
        input.startsWith(pattern, index) ? [pattern] : null
    );
}

export function join(
    parser: ParsyParser<ParsyContext, string>
): ParsyParser<ParsyContext, string> {
    return transform(parser, (token) => token.join(''));
}

// export function regex(pattern: RegExp): ParsyParser<ParsyContext, string> {
//     pattern = new RegExp('^' + pattern.source, 'g');
//     return terminal(({ index, input }) => {
//         pattern.lastIndex = index;
//         const match = pattern.exec(input);
//         return match ? match[0] : null;
//     });
// }
