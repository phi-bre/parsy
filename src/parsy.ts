import {
    AndParser,
    OrParser,
    ParsyContext,
    ParsyParser,
    ParsyTransform,
    RuleParser,
    TerminalParser,
    TransformParser,
} from '.';
import { NotParser } from './not';

export class Parsy {
    constructor(public parser: ParsyParser) {}

    public parse(input: string) {
        const context = new ParsyContext(input);
        const result = this.parser.parse(context);
        if (result) {
            return result.token.children;
        }
    }

    /**
     * Matches the empty string.
     */
    static empty = new ParsyParser();

    static or(left: ParsyParser, right: ParsyParser) {
        return new OrParser().set(left, right);
    }

    static and(left: ParsyParser, right: ParsyParser) {
        return new AndParser().set(left, right);
    }

    /**
     * Matches a range of characters.
     */
    static terminal(...pattern: string[]) {
        return new TerminalParser().set(...pattern);
    }

    /**
     * Returns a list of characters between the given char codes.
     */
    static charset(from: string, to: string) {
        return [...Array(to.charCodeAt(0) - from.charCodeAt(0) + 1).keys()]
            .map((value) => String.fromCharCode(value + from.charCodeAt(0)));
    }

    /**
     * Scopes the passed parser with a type.
     */
    static rule(type: string) {
        return new RuleParser(type);
    }

    /**
     * Matches the supplied sequence but recovers if not all of the rules match.
     * Makes the sequence optional.
     */
    static optional(parser: ParsyParser) {
        return new OrParser().set(parser, this.empty);
    }

    /**
     * Repeats matching the supplied rule for as long as the input allows for it.
     * Must match at least once.
     */
    static repeated(parser: ParsyParser) {
        const self = new AndParser();
        return self.set(parser, this.optional(self));
    }

    /**
     * Matches a sequence of rules.
     * All the rules provided need to match.
     */
    static sequence(...parsers: ParsyParser[]) {
        const reducer = (parser, rule) => new AndParser().set(rule, parser);
        return parsers.reduceRight(reducer);
    }

    /**
     * Searches for the first type that matches in sequential order.
     * At least one of the rules has to match.
     */
    static alternation(...parsers: ParsyParser[]) {
        const start = new OrParser().set(
            parsers[parsers.length - 2],
            parsers[parsers.length - 1]
        );
        const reducer = (parser, rule) => new OrParser().set(rule, parser);
        return parsers.slice(0, -2).reduceRight(reducer, start);
    }

    /**
     * Inverts the specified parser's output.
     */
    static not(parser: ParsyParser) {
        return new NotParser().set(parser);
    }

    /**
     * Listens to the creation of tokens created by the passed parser.
     */
    static transform(parser: ParsyParser, transformer: ParsyTransform) {
        return new TransformParser(parser, transformer);
    }
}
