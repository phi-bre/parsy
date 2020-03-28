import {alternation, optional, parsy, sequence, star} from '../src';

describe('parser', () => {

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
            value: alternation('null', 'number', 'boolean', 'string', 'object', 'array'),
            property: sequence('string', 'colon', 'value'),
            object: sequence('left_brace', optional('property', star('comma', 'property')), 'right_brace'),
            array: sequence('left_bracket', optional('value', star('comma', 'value')), 'right_bracket'),
        },
    });

    describe('#parser', () => {
        const input = '[10.5, false, null, [], { "hello": "world" }]';

        it('should not crash', () => {
            expect(instance(input).toString()).toMatchSnapshot();
        });
    });
});
