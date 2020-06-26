import {star, sequence, alternation, optional, token} from '../';

export default {
    grammar: 'PARSY',
    version: '0.0.1',
    start: 'statement',
    declarations: {
        integer: token(/[0-9]+/),
        token: token(/'(?:[^'\\]|\\.)*'/),
        identifier: token(/[A-z][A-z0-9]*/),
        regex: token(/\/(?:[^\/\\]|\\.)*\//),
        eol: token(/[\n;]/),
        statement: star(alternation('grammar', 'version', 'terminal', 'rule', 'start', 'ignore')),
        grammar: sequence(token('grammar'), 'identifier', 'eol'),
        version: sequence(token('version'), 'integer', optional(token('.'), 'integer', optional(token('.'), 'integer')), 'eol'),
        start: sequence(token('start'), 'identifier', 'eol'),
        ignore: sequence(token('ignore'), 'regex', 'eol'),
        terminal: sequence(token('terminal'), 'identifier', 'regex', 'eol'),
        rule: sequence('rule', 'identifier', '(', 'group', ')', 'eol'),
        modifier: alternation('?', '+', '*'),
        group: sequence(token('('), star(star('group'), token('|'), 'group'), token(')'), star('modifier')),
        match: alternation('identifier', 'regex', 'token'), // TODO
    },
}
