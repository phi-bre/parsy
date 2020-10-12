import format from 'pretty-format';
import { ParsyToken } from '../src';

export function pretty(tokens: any): string {
    const formatted = format(tokens, {
        plugins: [
            {
                print(token: any, print, indent, options, color) {
                    if (token.tokens.length) {
                        const children = indent(
                            token.tokens.map(print).join('\n')
                        );
                        return `${token.type} {\n${children}\n}`;
                    } else {
                        return `${token.type}: ${
                            color.value.open
                        }'${token.value.replace('\n', '\\n')}'${
                            color.value.close
                        }`;
                    }
                },
                test: (token: ParsyToken) => !!token.type,
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
                    if (token.tokens.length) {
                        return token.tokens.map(print).join('');
                    }
                    return token.value;
                },
                test: (token: ParsyToken) => !!token.type,
            },
        ],
    });
    return `\n${formatted}\n`;
}
