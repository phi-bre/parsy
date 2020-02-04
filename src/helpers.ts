import {RuleParser, AndParser, OrParser, ParsyParser, TerminalParser} from '.';

/**
 * Matches the empty string.
 */
export const empty = new ParsyParser();

/**
 * Matches a range of characters.
 */
export function terminal(...pattern: string[]) {
    return new TerminalParser(...pattern);
}

/**
 * Returns a list of characters between the given char codes.
 */
export function charset(from: string, to: string) {
    const set = new Array<string>();
    for (let char = from.charCodeAt(0); char <= to.charCodeAt(0); char++) {
        set.push(String.fromCharCode(char));
    }
    return set;
}

/**
 * Scopes the passed parser with a type.
 */
export function rule(type: string) {
    return new RuleParser(type);
}

/**
 * Matches the supplied sequence but recovers if not all of the rules match.
 * Makes the sequence optional.
 */
export function optional(parser: ParsyParser) {
    return new OrParser().set(parser, empty);
}

/**
 * Repeats matching the supplied rule.
 * Recovers if the sequence never matches.
 */
export function repeated(parser: ParsyParser) {
    const self = new AndParser();
    return self.set(parser, optional(self));
}

/**
 * Matches a sequence of rules.
 * All the rules provided need to match.
 */
export function sequence(...parsers: ParsyParser[]) {
    const reducer = (parser, rule) => new AndParser().set(rule, parser || empty);
    return parsers.reduceRight(reducer);
}

/**
 * Searches for the first type that matches in sequential order.
 * At least one of the rules has to match.
 */
export function alternation(...parsers: ParsyParser[]) {
    const reducer = (parser, rule) => new OrParser().set(rule, parser || empty);
    return parsers.reduceRight(reducer, new OrParser());
}
