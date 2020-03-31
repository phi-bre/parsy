import {alternation, optional, parsy, sequence, star, token} from '../src';

describe('#parsy', () => {

    const instance = parsy({
        ignore: /[ \n\r]+/,
        start: sequence('value'),
        declarations: {
            left_brace: token('{'),
            right_brace: token('}'),
            left_bracket: token('['),
            right_bracket: token(']'),
            comma: token(','),
            colon: token(':'),
            null: token('null'),
            number: token(/(\d+)?\.?\d+/),
            boolean: token(/true|false/),
            string: token(/"(?:[^"\\]|\\.)*"/),
            value: alternation('null', 'number', 'boolean', 'string', 'object', 'array'),
            property: sequence('string', 'colon', 'value'),
            object: sequence('left_brace', optional('property', star('comma', 'property')), 'right_brace'),
            array: sequence('left_bracket', optional('value', star('comma', 'value')), 'right_bracket'),
        },
    });

    it('should not crash', () => {
        expect(instance('[10, false, {"test": [null]}]').toString()).toMatchSnapshot();
    });
});
