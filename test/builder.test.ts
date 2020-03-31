import {alternation, optional, parsy, sequence, star, string} from '../src';

describe('parser', () => {

    const instance = parsy({
        grammar: 'PARSY',
        version: '0.0.1',
        start: 'statement',
        terminals: {
            integer: /[0-9]+/,
            string: /'(?:[^'\\]|\\.)*'/,
            identifier: /[A-z][A-z0-9]*/,
            regex: /\/(?:[^\/\\]|\\.)*\//,
            eol: /[\n;]/,
        },
        rules: {
            statement: star(alternation('grammar', 'version', 'terminal', 'rule', 'start', 'ignore')),
            grammar: sequence(string('grammar'), 'identifier', 'eol'),
            version: sequence(string('version'), 'integer', optional(string('.'), 'integer', optional(string('.'), 'integer')), 'eol'),
            start: sequence(string('start'), 'identifier', 'eol'),
            ignore: sequence(string('ignore'), 'regex', 'eol'),
            terminal: sequence(string('terminal'), 'identifier', 'regex', 'eol'),
            rule: sequence(string('rule'), 'identifier', string('('), 'group', string(')'), 'eol'),
            // modifier: alternation('?', '+', '*'),
            // group: sequence(
            //     string('('),
            //     star(
            //         star('group'),
            //         string('|'),
            //         'group'
            //     ),
            //     string(')'),
            //     star('modifier')
            // ),
            // match: alternation('identifier', 'regex', 'string'), // TODO
        },
    });

    describe('#parser', () => {
        const input = '[10.5, false, null, [], { "hello": "world" }]';

        it('should not crash', () => {
            expect(instance(input).toString()).toMatchSnapshot();
        });
    });
});
