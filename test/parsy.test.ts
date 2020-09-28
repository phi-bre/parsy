import { Parsy } from '../src';
import { highlight, pretty } from './utils';

describe('parsy', function () {
    const _ = Parsy.rule('whitespace');
    const IDENTIFIER = Parsy.rule('identifier');
    const LABEL = Parsy.rule('label');
    const TERMINAL = Parsy.rule('string');
    const CHAR = Parsy.rule('char');
    const CHAR_RANGE = Parsy.rule('char-range');
    const CHAR_SET = Parsy.rule('char-set');
    const MODIFIER = Parsy.rule('modifier');
    const RULE = Parsy.rule('rule');
    const SEQUENCE = Parsy.rule('sequence');
    const ALTERNATION = Parsy.rule('alternation');
    const EXPRESSION = Parsy.rule('expression');
    const START = Parsy.rule('start');

    _.set(Parsy.repeated(Parsy.terminal(...' \n\t\r')));
    IDENTIFIER.set(
        Parsy.repeated(
            Parsy.terminal(
                ...Parsy.charset('a', 'z'),
                ...Parsy.charset('A', 'Z'),
                ...Parsy.charset('0', '9'),
                '-',
                '_'
            )
        )
    );
    LABEL.set(Parsy.sequence(IDENTIFIER, Parsy.terminal(':'), EXPRESSION));
    TERMINAL.set(
        Parsy.sequence(
            Parsy.terminal("'"),
            Parsy.optional(
                Parsy.repeated(
                    Parsy.alternation(
                        Parsy.sequence(
                            Parsy.terminal('\\'),
                            Parsy.terminal("'")
                        ),
                        Parsy.not(Parsy.terminal("'"))
                    )
                )
            ),
            Parsy.terminal("'")
        )
    );
    CHAR.set(
        Parsy.alternation(
            Parsy.sequence(Parsy.terminal('\\'), Parsy.terminal(']', '-')),
            Parsy.not(Parsy.terminal(']', '-'))
        )
    );
    CHAR_RANGE.set(Parsy.sequence(CHAR, Parsy.terminal('-'), CHAR));
    CHAR_SET.set(
        Parsy.sequence(
            Parsy.terminal('['),
            Parsy.repeated(Parsy.alternation(CHAR_RANGE, CHAR)),
            Parsy.terminal(']')
        )
    );
    MODIFIER.set(Parsy.terminal(...'*+?!'));
    RULE.set(
        Parsy.sequence(
            IDENTIFIER,
            Parsy.optional(_),
            Parsy.terminal(':'),
            Parsy.optional(_),
            EXPRESSION
        )
    );
    SEQUENCE.set(
        Parsy.sequence(
            Parsy.terminal('('),
            Parsy.optional(_),
            Parsy.repeated(Parsy.sequence(EXPRESSION, Parsy.optional(_))),
            Parsy.optional(_),
            Parsy.terminal(')')
        )
    );
    ALTERNATION.set(
        Parsy.sequence(
            Parsy.terminal('{'),
            Parsy.optional(_),
            Parsy.repeated(Parsy.sequence(EXPRESSION, Parsy.optional(_))),
            Parsy.optional(_),
            Parsy.terminal('}')
        )
    );
    EXPRESSION.set(
        Parsy.sequence(
            Parsy.alternation(
                SEQUENCE,
                ALTERNATION,
                IDENTIFIER,
                TERMINAL,
                CHAR_SET
            ),
            Parsy.optional(Parsy.repeated(MODIFIER))
        )
    );
    START.set(
        Parsy.sequence(
            Parsy.optional(_),
            Parsy.repeated(Parsy.sequence(RULE, Parsy.optional(_))),
            Parsy.optional(_)
        )
    );

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
        expect(pretty(parser.parse(input))).toMatchSnapshot();
    });
});

describe('scopy', function () {
    const LABEL = Parsy.rule('label');
    const OPEN = Parsy.rule('open');
    const CLOSE = Parsy.rule('close');
    const VALUE = Parsy.rule('value');

    LABEL.set(
        Parsy.repeated(
            Parsy.terminal(
                ...Parsy.charset('a', 'z'),
                ...Parsy.charset('A', 'Z'),
                ...Parsy.charset('0', '9')
            )
        )
    );
    OPEN.set(Parsy.terminal('{'));
    CLOSE.set(Parsy.terminal('}'));
    VALUE.set(
        Parsy.sequence(
            LABEL,
            Parsy.optional(
                Parsy.sequence(
                    OPEN,
                    Parsy.optional(Parsy.repeated(VALUE)),
                    CLOSE
                )
            )
        )
    );

    const parser = new Parsy(VALUE);
    const input = 'scope{another{one{}like{this}}';

    it('should parse correct structure', function () {
        console.log(highlight(parser.parse(input)![0]));
        expect(pretty(parser.parse(input)![0])).toMatchSnapshot();
    });
});

describe('math', function () {
    const INTEGER = Parsy.rule('integer');
    const PRIMARY = Parsy.rule('primary');
    const MULTIPLICATIVE = Parsy.rule('multiplicative');
    const ADDITIVE = Parsy.rule('additive');
    const ADDITION = Parsy.rule('operator').set(Parsy.terminal('+'));
    const SUBTRACTION = Parsy.rule('operator').set(Parsy.terminal('-'));
    const MULTIPLICATION = Parsy.rule('operator').set(Parsy.terminal('*'));
    const DIVISION = Parsy.rule('operator').set(Parsy.terminal('/'));
    const OPEN = Parsy.rule('open').set(Parsy.terminal('('));
    const CLOSE = Parsy.rule('close').set(Parsy.terminal(')'));

    INTEGER.set(Parsy.repeated(Parsy.terminal(...Parsy.charset('0', '9'))));
    ADDITIVE.set(
        Parsy.alternation(
            Parsy.sequence(
                MULTIPLICATIVE,
                Parsy.alternation(ADDITION, SUBTRACTION),
                ADDITIVE
            ),
            MULTIPLICATIVE
        )
    );
    MULTIPLICATIVE.set(
        Parsy.alternation(
            Parsy.sequence(
                PRIMARY,
                Parsy.alternation(MULTIPLICATION, DIVISION),
                MULTIPLICATIVE
            ),
            PRIMARY
        )
    );
    PRIMARY.set(
        Parsy.alternation(Parsy.sequence(OPEN, ADDITIVE, CLOSE), INTEGER)
    );

    const parser = new Parsy(ADDITIVE);
    const input = '2-2*((10+0)+100000000000000000000000)';

    it('should parse correct structure', function () {
        console.log(highlight(parser.parse(input)![0]));
        expect(pretty(parser.parse(input))).toMatchSnapshot();
    });
});
