import {Rule} from './parser';

/**
 * Matches a sequence of rules.
 * All the rules provided need to match.
 */
export function sequence(...rules: (string | Rule)[]): Rule {
    return function (parser) {
        for (const rule of rules) {
            parser.resolve(rule);
        }
    }
}

/**
 * Searches for the first type that matches in sequential order.
 * At least one of the rules has to match.
 */
export function alternation(...rules: (string | Rule)[]): Rule {
    return function (parser) {
        const position = parser.lexer.position;
        for (const rule of rules) {
            try {
                parser.resolve(rule);
                return;
            } catch {
                parser.lexer.reset(position);
            }
        }
        throw `Unexpected token: ${parser.lexer.peek!.type.toString()}. Expected to find: ${rules.join(', ')}`;
    }
}

/**
 * Matches the supplied sequence but recovers if not all of the rules match.
 * Makes the sequence optional.
 */
export function optional(...rules: (string | Rule)[]): Rule {
    const seq = sequence(...rules);
    return function (parser) {
        const position = parser.lexer.position;
        try {
            seq(parser);
        } catch {
            parser.lexer.reset(position);
            return false;
        }
    }
}

/**
 * Matches and repeats matching the supplied sequence.
 * Recovers if the sequence never matches.
 */
export function star(...rules: (string | Rule)[]): Rule {
    const seq = optional(sequence(...rules));
    return function (parser) {
        while (seq(parser) !== false) ;
    }
}

/**
 * Matches and repeats matching the supplied sequence.
 * Requires the sequence to match at least once.
 */
export function plus(...rules: (string | Rule)[]): Rule {
    const seq = sequence(...rules);
    const opt = optional(seq);
    return function (parser) {
        seq(parser);
        while (opt(parser) !== false) ;
    }
}
