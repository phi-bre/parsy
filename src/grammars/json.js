import {alternation, optional, sequence, star} from '../';

export default {
    start: 'value',
    ignore: /[ \t\n\r]+/,
    terminals: {
        '{': '{',
        '}': '}',
        '[': '[',
        ']': ']',
        ',': ',',
        ':': ':',
        '-': '-',
        '+': '+',
        '.': '.',
        null: 'null',
        zero: '0',
        digit: /[1-9]+/,
        boolean: /true|false/,
        exponent: /[eE]/,
        string: /"(?:[^"\\]|\\.)*"/,
    },
    rules: {
        integer: sequence(),
        exponent: sequence(alternation('-', '+'), ),
        number: sequence(optional('-'), 'digit'),
        value: alternation('null', 'number', 'boolean', 'string', 'object', 'array'),
        member: sequence('string', ':', 'value'),
        object: sequence('left_brace', optional('member', star('comma', 'member')), 'right_brace'),
        array: sequence('left_bracket', optional('value', star('comma', 'value')), 'right_bracket'),
    },
    transform: {
        property: node => ({key: node[0], value: node[2]}),
        object: node => ({properties: node.include('property')}),
        array: node => ({values: node.include('values')}),
    },
}
