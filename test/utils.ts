import format from 'pretty-format';
import {ParsyToken} from '../src';

export function pretty(tokens: any): string {
    return format(tokens, {
        plugins: [{
            print(token: any, print, indent, options, color) {
                if (token.children.length) {
                    const children = indent(token.children.map(print).join('\n'));
                    return `${token.type} {\n${children}\n}`
                }
                return `${token.type}: ${color.value.open}'${token.value}'${color.value.close}`;
            },
            test(token) {
                return token instanceof ParsyToken;
            },
        }],
    });
}
