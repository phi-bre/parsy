import {alternation, optional, parsy, sequence, star} from '../src';

describe('parsy', () => {

    const instance = parsy({
        ignore: /[ \n\r]+/,
        terminals: {
            left_brace: '{',
            right_brace: '}',
            left_bracket: '[',
            right_bracket: ']',
            comma: ',',
            colon: ':',
            null: 'null',
            number: /((\d+)?\.?\d+)/,
            boolean: /true|false/,
            string: /"((?:[^"\\]|\\.)*)"/,
        },
        rules: {
            value: t => (
                alternation(
                    t.string,
                    t.number,
                    t.boolean,
                    t.null,
                    t.object,
                    t.array,
                )
            ),
            object: t => (
                sequence(
                    t.left_brace,
                    optional(
                        t.property,
                        star(
                            t.comma,
                            t.property,
                        ),
                    ),
                    t.right_brace,
                )
            ),
            array: t => (
                sequence(
                    t.left_bracket,
                    optional(
                        t.value,
                        star(
                            t.comma,
                            t.value,
                        ),
                    ),
                    t.right_bracket,
                )
            ),
        },
    });

    describe('tokenization', () => {
        const input = '[10.5, false, null, [], {"hello": "world"}]';
        const tokens = ['[', '10.5', ',', 'false', ',', 'null', ',', '[', ']', ',', '{', 'hello', ':', 'world', '}', ']'];
        const output = [...instance.scan(input)];

        it('should match the right tokens', function () {
            expect(output.map(token => token.value)).toEqual(tokens);
        });

        it('should output the right indexes', function () {

        });
    });
});
