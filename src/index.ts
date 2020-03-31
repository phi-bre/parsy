import {Declaration} from './declaration';
import {Lexer} from './lexer';
import {Parser} from './parser';
import {Alternation, Optional, Range, Rule, Scope, Sequence} from './rule';
import {RegexTerminal, StringTerminal, Terminal} from './terminal';

export * from './parser';
export * from './lexer';
export * from './node';
export * from './token';

export interface Position {
    index: number;
    line: number;
    column: number;
}

export interface Declarations {
    [declaration: string]: Declaration;
}

export function parsy(config: { declarations: Declarations, start: Rule, ignore: RegExp }) {
    const rules: Scope[] = [];
    const terminals: Terminal[] = [];
    const declarations: Declarations = {};

    for (const type in config.declarations) {
        const rule = declarations[type] = config.declarations[type];
        rule.type = type;

        if (rule instanceof Rule) {
            rules.push(rule);
        } else if (rule instanceof Terminal) {
            terminals.push(rule);
        }
    }

    for (const rule of rules) {
        rule.resolve(declarations);
        for (const declaration of rule.declarations) {
            declarations[declaration.type as unknown as string] = declaration;
            if (declaration instanceof Terminal) {
                terminals.push(declaration);
            } else if (declaration instanceof Scope) {
                rules.push(declaration);
            }
        }
    }

    config.start.resolve(declarations);

    const ignore = regex(config.ignore);
    terminals.push(ignore);

    return function (input: string) {
        const lexer = new Lexer(terminals, input);
        const parser = new Parser(config.start, lexer);
        return parser.tree;
    }
}


export function string(value: string) {
    return new StringTerminal(Symbol('string'), value);
}

export function regex(value: RegExp) {
    return new RegexTerminal(Symbol('regex'), value);
}

export function token(value: string | RegExp) {
    return typeof value === 'string' ? string(value) : regex(value);
}

export function alias(type: string, rule: Declaration) {
    rule.type = type;
    return rule;
}

export function rule(type: string, rule: Declaration) {
    return new Scope(type, [rule]);
}

/**
 * Matches a sequence of rules.
 * All the rules provided need to match.
 */
export function sequence(...rules: (Declaration | string)[]) {
    return new Sequence(Symbol('sequence'), rules);
}

/**
 * Searches for the first type that matches in sequential order.
 * At least one of the rules has to match.
 */
export function alternation(...rules: (Declaration | string)[]) {
    return new Alternation(Symbol('alternation'), rules);
}

/**
 * Matches the supplied sequence but recovers if not all of the rules match.
 * Makes the sequence optional.
 */
export function optional(...rules: (Declaration | string)[]) {
    return new Optional(Symbol('optional'), rules);
}

/**
 * Matches and repeats matching the supplied sequence.
 * Recovers if the sequence never matches.
 */
export function star(...rules: (Declaration | string)[]) {
    return new Range(Symbol('star'), rules);
}

/**
 * Matches and repeats matching the supplied sequence.
 * Requires the sequence to match at least once.
 */
export function plus(...rules: (Declaration | string)[]) {
    return new Range(Symbol('plus'), rules, 1);
}

/**
 * Matches the specified rules at least 'min' times and repeats for 'max' times.
 */
export function range(min: number, max: number, ...rules: (Declaration | string)[]) {
    return new Range(Symbol('star'), rules, min, max);
}
