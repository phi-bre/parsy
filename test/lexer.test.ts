import {lexer} from '../src';

const terminals = {
    '.whitespace': /[ \n\r]+/,
    boolean: /true|false/,
    number: /(\d+)?\.?\d+/,
    null: /null/,
    string: /"(.*?)"/,
    left_brace: /{/,
    right_brace: /}/,
    left_bracket: /\[/,
    right_bracket: /]/,
    colon: /:/,
    comma: /,/,
    literal: /[A-z0-9]+/,
};

const input = `
    { 
        test: "value",
    }
`;

describe('lexer', () => {
    const scanner = lexer(terminals);

    it('lexer can scan tokens', () => {
        const tokens = scanner(input);
        expect(tokens.next().value.type).toBe('left_brace');
        expect(tokens.next().value.type).toBe('literal');
        expect(tokens.next().value.type).toBe('colon');
        expect(tokens.next().value.type).toBe('string');
        expect(tokens.next().value.type).toBe('comma');
        expect(tokens.next().value.type).toBe('right_brace');
        expect(tokens.next().done).toBe(true);
    });

});


