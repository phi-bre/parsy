import {Branch} from './branch';
import {Lexer, Terminal} from './lexer';
import {Parser, Rule, RuleStore} from './parser';
import {Token} from './token';

export * from './declarations';
export * from './parser';
export * from './lexer';
export * from './branch';
export * from './token';

export interface Position {
    index: number;
    line: number;
    column: number;
}

export function parsy(config) {
    const rules: RuleStore = {};
    const terminals: Terminal[] = [];

    if (config.ignore) {
        const symbol = Symbol('ignore');
        rules[symbol as unknown as string] = advance(symbol as unknown as string);
        const terminal = typeof config.terminals[symbol] === 'string' ? string : regex;
        terminals.push(terminal(symbol, config.ignore, true));
    }

    for (const identifier in config.terminals) if (config.terminals.hasOwnProperty(identifier)) {
        rules[identifier] = advance(identifier);
        const terminal = typeof config.terminals[identifier] === 'string' ? string : regex;
        terminals.push(terminal(identifier, config.terminals[identifier]));
    }

    for (const identifier in config.rules) if (config.rules.hasOwnProperty(identifier)) {
        if (identifier in rules)
            throw 'Terminals and rules cannot have the same identifier: ' + identifier;
        rules[identifier] = rule(identifier, config.rules[identifier]);
    }

    return function (input: string) {
        const lexer = new Lexer(terminals, input);
        const parser = new Parser(config.start, rules, lexer);
        return parser.tree;
    }
}

function advance(identifier: string): Rule {
    return function ({lexer, node}) {
        const token = lexer.next;
        if (token.type !== identifier)
            throw 'Unexpected token: ' + token.type.toString() + '. \nExpected: ' + identifier;
        node!.push(token);
    }
}

function rule(identifier: string, rule: Rule): Rule {
    return function (parser) {
        try {
            parser.node = new Branch(identifier, parser.node);
            rule(parser);
            parser.node!.parent!.push(parser.node);
        } finally {
            parser.node = parser.node!.parent;
        }
    }
}

function string(type: string | symbol, value: string, ignore?: boolean): Terminal {
    return function ({input, index, position}: Lexer) {
        if (input.startsWith(value, index)) {
            return new Token(type, value, position, ignore);
        }
    }
}

function regex(type: string | symbol, value: RegExp, ignore?: boolean): Terminal {
    const pattern = new RegExp(value.source, 'y');
    return function ({input, index, position}: Lexer) {
        pattern.lastIndex = index;
        const match = pattern.exec(input);
        if (match) {
            return new Token(type, match[0], position, ignore);
        }
    }
}
