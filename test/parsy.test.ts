import {alternation, builder, lexer, optional, parsy, sequence, star} from '../src';

describe('#parsy', () => {

    const config = {
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
        },
        scopes: {
            object: sequence('left_brace', optional('property', star('comma', 'property')), 'right_brace'),
            array: sequence('left_bracket', optional('value', star('comma', 'value')), 'right_bracket'),
        },
    };

    const instance = parsy(config)
        .use(lexer)
        .use(builder);


    it('should not crash', () => {
        expect(instance('[10, false, {"test": [null]}]')).toBeTruthy();
    });
});
