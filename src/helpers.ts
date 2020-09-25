import {AndParser, OrParser, ParsyParser, ParsyToken, RuleParser, TerminalParser, TransformParser} from '.';
import {NotParser} from './not';

/**
 * Matches the empty string.
 */
export const empty = new ParsyParser();

export function or(left: ParsyParser, right: ParsyParser) {
    return new OrParser().set(left, right);
}

export function and(left: ParsyParser, right: ParsyParser) {
    return new AndParser().set(left, right);
}

/**
 * Matches a range of characters.
 */
export function terminal(...pattern: string[]) {
    return new TerminalParser().set(...pattern);
}

/**
 * Returns a list of characters between the given char codes.
 */
export function charset(from: string, to: string) {
    return [...Array(to.charCodeAt(0) - from.charCodeAt(0) + 1).keys()]
        .map(value => String.fromCharCode(value + from.charCodeAt(0)));
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
 * Repeats matching the supplied rule for as long as the input allows for it.
 * Must match at least once.
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
    const reducer = (parser, rule) => new AndParser().set(rule, parser);
    return parsers.reduceRight(reducer);
}

/**
 * Searches for the first type that matches in sequential order.
 * At least one of the rules has to match.
 */
export function alternation(...parsers: ParsyParser[]) {
    const start = new OrParser().set(parsers[parsers.length - 2], parsers[parsers.length - 1]);
    const reducer = (parser, rule) => new OrParser().set(rule, parser);
    return parsers.slice(0, -2).reduceRight(reducer, start);
}

/**
 * Inverts the specified parser's output.
 */
export function not(parser: ParsyParser) {
    return new NotParser().set(parser);
}

/**
 * Listens to the creation of tokens created by the passed parser.
 */
export function transform(parser: ParsyParser, transformer: (token: ParsyToken) => any) {
    return new TransformParser(parser, transformer);
}
