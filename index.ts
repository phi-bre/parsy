import parsy, {grammar, lexer, reference, parser} from './src';

const pipeline = parsy();

pipeline.use(lexer({
    '.': /[ \n\r]+/,
    boolean: /true|false/,
    number: /(\d+)?\.?\d+/,
    string: /"(.*?)"/,
    null: /null/,
    // comment: /\/\*(.*?)\*\//,
    // left_brace: /{/,
    // right_brace: /}/,
    // left_bracket: /\[/,
    // right_bracket: /]/,
    // colon: /:/,
    // comma: /,/,
}));

// pipeline.use(grammar({
//     value: 'number | string | boolean | null | object | array',
//     object: 'left_brace',
// }));

// pipeline.use(grammar('... (object | array) ...', {
//     ...symbols,
//     '...': 'whitespace?',
//     value: '(number | string | boolean | null | object | array)',
//     pair: 'string . colon . value',
//     object: 'left_brace ... ((pair ... comma ...)* pair)? ... right_brace',
//     array: 'left_bracket ((value ... comma ...)* value)? right_bracket',
//     arithmetic: (...tokens: string[]) => ({})
// }));

const {value, number, string, boolean, nil, object, array, property} = reference;
const a = (...args) => {};
const g = (...args) => {};
const m = (...args) => {};
const s = (...args) => {};

pipeline.use(parser({
    value: a(number, string, boolean, nil, object, array),
    property: g(string, ':', value),
    object: g('{', m(property, m(',', property)), '}'),
    array: g('[', m(value, m(',', value)), ']'),
}));

pipeline.use(transformer({
    property: (string, value) => ({key: string, value}),
    object: (value) => ({}),
    array: (value) => {}
}));

console.log(grammar(`

begin: value;
value: boolean | number | string | array | object;
property: string colon   value;
array: "[" (property comma)* property? "]";

`)(`
true
`));
