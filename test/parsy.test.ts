import {alternation, charset, optional, repeated, rule, sequence, terminal} from '../src';
import {Parsy} from '../src/parser';
import {pretty} from './utils';


describe('parsy', function () {
    const _ = rule('whitespace');
    const IDENTIFIER = rule('identifier');
    const STRING = rule('string');
    const PATTERN = rule('pattern');
    const MODIFIER = rule('modifier');
    const ANY = rule('any');
    const RULE = rule('rule');
    const SEQUENCE = rule('sequence');
    const ALTERNATION = rule('alternation');
    const EXPRESSION = rule('expression');

    _.set(repeated(terminal(...' \n\t\r')));
    IDENTIFIER.set(repeated(terminal(...charset('a', 'z'), ...charset('A', 'Z'), ...charset('0', '9'))));
    STRING.set(sequence(terminal('\''), optional(repeated(alternation(terminal('\\\''), terminal(...charset(String.fromCharCode(33), String.fromCharCode(126)))))), terminal('\'')));
    PATTERN.set(sequence(terminal('['), IDENTIFIER, terminal(']')));
    MODIFIER.set(terminal(...'*+?'));
    ANY.set(terminal('.'));
    RULE.set(sequence(IDENTIFIER, _, terminal(':'), _, EXPRESSION));
    SEQUENCE.set(sequence(terminal('('), _, repeated(EXPRESSION), _, terminal(')')));
    ALTERNATION.set(sequence(terminal('{'), _, repeated(EXPRESSION), _, terminal('}')));
    EXPRESSION.set(sequence(alternation(SEQUENCE, ALTERNATION, STRING, ANY, IDENTIFIER), optional(MODIFIER)));

    const parser = new Parsy(sequence(_, repeated(RULE), _));
    const input = `
        start: rule+
        identifier: [A-Za-z0-9]+
        string: ( ['] { '\\\\\\'' . }* ['] )
        pattern: ( '[' .* ']' )
        modifier: [*+?]
        any: '.'
        rule: ( identifier ':' expression )
        sequence: ( '(' expression+ ')' )
        alternation: ( '{' expression+ '}' )
        expression: ( { sequence alternation string any identifier } modifier? )
    `;


    it('should parse correct structure', function () {
        console.log(pretty(parser.parse(input)));
    });
});

describe('scopy', function () {
    const label = rule('label');
    const open = rule('open');
    const close = rule('close');
    const value = rule('value');

    label.set(repeated(terminal(...charset('a', 'z'), ...charset('A', 'Z'), ...charset('0', '9'))));
    open.set(terminal('{'));
    close.set(terminal('}'));
    value.set(sequence(label, open, optional(repeated(value)), close));

    const parser = new Parsy(value);
    const input = 'abc{b{d{}}c{}}';

    it('should parse correct structure', function () {
        console.log(pretty(parser.parse(input)));
    });
});
