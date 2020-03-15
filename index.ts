import {parsy, or, maybe, multiple} from './src';
const {terminal, define, start} = parsy(/[ \n\r]+/);

const left_brace = terminal('{');
const right_brace = terminal('}');
const left_bracket = terminal('[');
const right_bracket = terminal(']');
const comma = terminal(',');
const colon = terminal(':');
const nil = terminal('null');
const number = terminal(/[0-9]+/);
const boolean = terminal(/true|false/);
const string = terminal(/"(.*)"/);

const value = define();
const object = define();
const array = define();
const property = define(string, colon, value);

value.assign(or(string, number, boolean, nil, object, array));

object.assign(
    left_brace,
    maybe(
        property,
        multiple(comma, property),
    ),
    right_brace,
);

array.assign(
    left_bracket,
    maybe(
        value,
        multiple(comma, value),
    ),
    right_bracket,
);

console.log(start(value));
