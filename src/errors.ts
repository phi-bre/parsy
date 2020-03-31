import {Position, Token} from './';
import {indent} from './utils';

function report(input: string, {index, line, column}: Position) {
    const info = '\nindex: ' + index + ' line: ' + line + ' column: ' + column;
    let from = input.substring(0, index).lastIndexOf('\n');
    let to = input.indexOf('\n', index);
    if (from === -1) from = 0;
    if (to === -1) to = input.length;
    const subject = '\n' + input.substring(from, to);
    const underline = '\n' + indent(index - 1, ' ') + '~~~'; // TODO
    return info + subject + underline;
}

export class TokenError extends Error {
    public severity = 1;

    constructor(input: string, position: Position) {
        super(
            'Unexpected token: "'
            + input.substr(position.index, 1)
            + '"'
            + report(input, position)
        );
    }
}

export class SyntaxError extends Error {
    public severity = 1;

    constructor(input: string, token: Token, expected: string) {
        super(
            'Unexpected token: "'
            + token.value
            + '". expected: '
            + expected
            + report(input, token.position)
        );
    }
}
