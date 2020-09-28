import format from 'pretty-format';
import { ParsyToken } from '../src';

export function pretty(tokens: any): string {
    const formatted = format(tokens, {
        plugins: [
            {
                print(token: any, print, indent, options, color) {
                    if (token.children.length) {
                        const children = indent(
                            token.children.map(print).join('\n')
                        );
                        return `${token.type} {\n${children}\n}`;
                    }
                    return `${token.type}: ${
                        color.value.open
                    }'${token.value.replace('\n', '\\n')}'${color.value.close}`;
                },
                test(token) {
                    return token instanceof ParsyToken;
                },
            },
        ],
    });
    return `\n${formatted}\n`;
}

export function highlight(tokens: any): string {
    const formatted = format(tokens, {
        plugins: [
            {
                print(token: any, print) {
                    if (token.children.length) {
                        return token.children.map(print).join('');
                    }
                    return token.value;
                },
                test(token) {
                    return token instanceof ParsyToken;
                },
            },
        ],
    });
    return `\n${formatted}\n`;
}
