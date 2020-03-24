import {lexer} from '../src';

describe('lexer', () => {

    const instance = lexer({
        ignore: /[ \n\r]+/,
        terminals: {
            left_brace: '{',
            right_brace: '}',
            left_bracket: '[',
            right_bracket: ']',
            comma: ',',
            colon: ':',
            null: 'null',
            number: /(\d+)?\.?\d+/,
            boolean: /true|false/,
            string: /"(?:[^"\\]|\\.)*"/,
        },
    });

    describe('#lexer', () => {
        const input = '[10.5, false, null, [], { "hello": "world" }]';
        const tokens = ['[', '10.5', ',', 'false', ',', 'null', ',', '[', ']', ',', '{', '"hello"', ':', '"world"', '}', ']'];
        const output = [...instance(input)];

        it('should match the right tokens', () => {
            expect(output.map(token => token.value)).toEqual(tokens);
        });

        it('should output the right indexes', () => {
            // TODO
        });

        describe('#tokens', () => {
            it('#peek', () => {
                // TODO
            });

            it('#next', () => {
                // TODO
            });

            it('#reset', () => {
                // TODO
            });

            it('#iterator', () => {
                // TODO
            });

            it('#cache', () => {
                // TODO
            });
        });
    });

    describe('#terminal', () => {
        it('#string', () => {
            // TODO
        });

        it('#regex', () => {
            // TODO
        });
    });
});
