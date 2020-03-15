import {lexer} from '../src';

describe('lexer', () => {
    const input = '{ someString: "value" }';
    const terminals = {
        _: /[ \n\r]+/,
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

    it('lexer can scan tokens', () => {
        const tokens = lexer(terminals)(input);
        expect(tokens.next().value.type).toBe('left_brace');
        expect(tokens.next().value.type).toBe('literal');
        expect(tokens.next().value.type).toBe('colon');
        expect(tokens.next().value.type).toBe('string');
        expect(tokens.next().value.type).toBe('right_brace');
        expect(tokens.next().done).toBe(true);
    });

});


