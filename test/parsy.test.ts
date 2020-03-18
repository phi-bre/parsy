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
            number: /(\d+)?\.?\d+/,
            boolean: /true|false/,
            string: /"(?:[^"\\]|\\.)*"/,
        },
        start: 'value',
        rules: {
            value: alternation('string', 'number', 'boolean', 'null', 'object', 'array'),
            property: sequence('string', 'colon', 'value'),
            object: sequence('left_brace', optional('property', star('comma', 'property')), 'right_brace'),
            array: sequence('left_bracket', optional('value', star('comma', 'value')), 'right_bracket'),
        },
    });

    describe('#scan', () => {
        const input = '[10.5, false, null, [], {"hello": "world"}]';
        const tokens = ['[', '10.5', ',', 'false', ',', 'null', ',', '[', ']', ',', '{', '"hello"', ':', '"world"', '}', ']'];
        const output = [...instance.scan(input)];

        it('should match the right tokens', () => {
            expect(output.map(token => token.value)).toEqual(tokens);
        });

        it('should output the right indexes', () => {
            // TODO
        });
    });

    describe('#build', () => {
        const input = '{"hello": "world"}';
        const tree = [];
        const output = instance.build(input);

        it('should build the right tree', () => {
            expect(output).toEqual(tree);
        });
    });
});
