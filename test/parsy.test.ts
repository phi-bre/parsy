import {color} from 'ansi-styles';
import {alternation, charset, optional, repeated, rule, sequence, terminal, transform} from '../src';
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
    // STRING.set(sequence(terminal('\''), optional(repeated(alternation(terminal('\\\''), terminal(...charset(String.fromCharCode(33), String.fromCharCode(126)))))), terminal('\'')));
    PATTERN.set(sequence(terminal('['), IDENTIFIER, terminal(']')));
    MODIFIER.set(terminal(...'*+?'));
    RULE.set(sequence(IDENTIFIER, optional(_), terminal(':'), optional(_), EXPRESSION));
    SEQUENCE.set(sequence(terminal('('), optional(_), repeated(EXPRESSION), optional(_), terminal(')')));
    ALTERNATION.set(sequence(terminal('{'), optional(_), repeated(EXPRESSION), optional(_), terminal('}')));
    EXPRESSION.set(sequence(alternation(SEQUENCE, ALTERNATION, ANY, IDENTIFIER), optional(MODIFIER)));

    const parser = new Parsy(sequence(optional(_), repeated(RULE), optional(_)));
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

    // it('should parse correct structure', function () {
    //     expect(pretty(parser.parse(input))).toMatchSnapshot();
    // });
});

describe('scopy', function () {
    const LABEL = transform(rule('label'), token => token.value = color.blue.open + token.value + color.blue.close);
    const OPEN = rule('open');
    const CLOSE = rule('close');
    const VALUE = rule('value');

    LABEL.set(repeated(terminal(...charset('a', 'z'), ...charset('A', 'Z'), ...charset('0', '9'))));
    OPEN.set(terminal('{'));
    CLOSE.set(terminal('}'));
    VALUE.set(sequence(LABEL, optional(sequence(OPEN, optional(repeated(VALUE)), CLOSE))));

    const parser = new Parsy(VALUE);
    const input = 'scope{another{one{}}like{this}}';

    it('should parse correct structure', function () {
        expect(pretty(parser.parse(input)![0])).toMatchSnapshot();
    });
});

describe('math', function () {
    const INTEGER = transform(rule('integer'), token => token.value = color.blueBright.open + token.value + color.blueBright.close);
    // const VARIABLE = rule('variable');
    // const LINE = rule('line');
    // const DOT = rule('dot');
    // const EXPRESSION = rule('expression');
    // const TERM = rule('term');
    // const FACTOR = rule('factor');
    const PRIMARY = rule('primary');
    const MULTIPLICATIVE = rule('multiplicative');
    const ADDITIVE = rule('additive');
    const ADDITION = rule('operator').set(terminal('+'));
    const SUBTRACTION = rule('operator').set(terminal('-'));
    const MULTIPLICATION = rule('operator').set(terminal('*'));
    const DIVISION = rule('operator').set(terminal('/'));
    const OPEN = rule('open').set(terminal('('));
    const CLOSE = rule('close').set(terminal(')'));

    INTEGER.set(repeated(terminal(...charset('0', '9'))));
    ADDITIVE.set(alternation(sequence(MULTIPLICATIVE, alternation(ADDITION, SUBTRACTION), ADDITIVE), MULTIPLICATIVE));
    MULTIPLICATIVE.set(alternation(sequence(PRIMARY, alternation(MULTIPLICATION, DIVISION), MULTIPLICATIVE), PRIMARY));
    PRIMARY.set(alternation(sequence(OPEN, ADDITIVE, CLOSE), INTEGER));

    // INTEGER.set(repeated(terminal(...charset('0', '9'))));
    // VARIABLE.set(repeated(terminal(...charset('a', 'z'), ...charset('A', 'Z'), ...charset('0', '9'))));
    // LINE.set(terminal('+', '-'));
    // DOT.set(terminal('*', '/'));
    // EXPRESSION.set(alternation(TERM, sequence(EXPRESSION, LINE, TERM), sequence(LINE, TERM)));
    // TERM.set(alternation(FACTOR, sequence(TERM, DOT, FACTOR)));
    // FACTOR.set(alternation(PRIMARY, sequence(FACTOR, terminal('^'), PRIMARY)));
    // PRIMARY.set(alternation(INTEGER, sequence(terminal('('), EXPRESSION, terminal(')'))));

    const parser = new Parsy(ADDITIVE);
    const input = '2-2*((10+0)+100000000000000000000000)';

    it('should parse correct structure', function () {
        expect(pretty(parser.parse(input))).toMatchSnapshot();
    });
});
