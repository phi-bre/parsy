import {color} from 'ansi-styles';
import {alternation, charset, not, optional, Parsy, repeated, rule, sequence, terminal, transform} from '../src';
import {highlight, pretty} from './utils';

describe('parsy', function () {
    const _ = rule('whitespace');
    const IDENTIFIER = rule('identifier');
    const LABEL = rule('label');
    const TERMINAL = rule('string');
    const CHAR = rule('char');
    const CHAR_RANGE = rule('char-range');
    const CHAR_SET = rule('char-set');
    const MODIFIER = rule('modifier');
    const RULE = rule('rule');
    const SEQUENCE = rule('sequence');
    const ALTERNATION = rule('alternation');
    const EXPRESSION = rule('expression');
    const START = rule('start');

    _.set(repeated(terminal(...' \n\t\r')));
    IDENTIFIER.set(repeated(terminal(...charset('a', 'z'), ...charset('A', 'Z'), ...charset('0', '9'), '-', '_')));
    LABEL.set(sequence(IDENTIFIER, terminal(':'), EXPRESSION));
    TERMINAL.set(sequence(terminal('\''), optional(repeated(alternation(sequence(terminal('\\'), terminal('\'')), not(terminal('\''))))), terminal('\'')));
    CHAR.set(alternation(sequence(terminal('\\'), terminal(']', '-')), not(terminal(']', '-'))));
    CHAR_RANGE.set(sequence(CHAR, terminal('-'), CHAR));
    CHAR_SET.set(sequence(terminal('['), repeated(alternation(CHAR_RANGE, CHAR)), terminal(']')));
    MODIFIER.set(terminal(...'*+?!'));
    RULE.set(sequence(IDENTIFIER, optional(_), terminal(':'), optional(_), EXPRESSION));
    SEQUENCE.set(sequence(terminal('('), optional(_), repeated(sequence(EXPRESSION, optional(_))), optional(_), terminal(')')));
    ALTERNATION.set(sequence(terminal('{'), optional(_), repeated(sequence(EXPRESSION, optional(_))), optional(_), terminal('}')));
    EXPRESSION.set(sequence(alternation(SEQUENCE, ALTERNATION, IDENTIFIER, TERMINAL, CHAR_SET), optional(repeated(MODIFIER))));
    START.set(sequence(optional(_), repeated(sequence(RULE, optional(_))), optional(_)));

    const parser = new Parsy(START);
    const input = `
        start: rule+
        identifier: [A-Za-z0-9\\-_]+
        terminal: ( '\\'' { '\\'' '\\''! }* '\\'' )
        char: [\\-\\]]!
        char-range: ( char '-' char )
        char-set: ( '[' { char-range char }* ']' )
        modifier: [*+?!]
        rule: ( identifier ':' expression )
        sequence: ( '(' expression+ ')' )
        alternation: ( '{' expression+ '}' )
        expression: ( { sequence alternation identifier terminal char-set } modifier? )
    `;

    it('should parse correct structure', function () {
        console.log(highlight(parser.parse(input)![0]));
        expect(pretty(parser.parse(input))).toMatchSnapshot();
    });
});

describe('scopy', function () {
    const LABEL = rule('label');
    const OPEN = rule('open');
    const CLOSE = rule('close');
    const VALUE = rule('value');

    LABEL.set(repeated(terminal(...charset('a', 'z'), ...charset('A', 'Z'), ...charset('0', '9'))));
    OPEN.set(terminal('{'));
    CLOSE.set(terminal('}'));
    VALUE.set(sequence(LABEL, optional(sequence(OPEN, optional(repeated(VALUE)), CLOSE))));

    const parser = new Parsy(VALUE);
    const input = 'scope{another{one{}like{this}}';

    it('should parse correct structure', function () {
        expect(pretty(parser.parse(input)![0])).toMatchSnapshot();
    });
});

describe('math', function () {
    const INTEGER = rule('integer');
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

    const parser = new Parsy(ADDITIVE);
    const input = '2-2*((10+0)+100000000000000000000000)';

    it('should parse correct structure', function () {
        console.log(highlight(parser.parse(input)![0]));
        expect(pretty(parser.parse(input))).toMatchSnapshot();
    });
});
