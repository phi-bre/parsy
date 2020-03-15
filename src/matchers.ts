import {Rule} from './index';

function advance(matchers: Rule): Rule {
    return null as unknown as Rule;
    // return function (tokens) {
    //     tokens.begin();
    //     while (matcher(tokens.next()));
    //     tokens.reset();
    // }
}

/**
 * 'Matches sequence.'
 */
export function sequence(...rules: Rule[]): Rule {
    return null as unknown as Rule;
    // return function (tokens) {
    //     tokens.begin();
    //     for (const rule of rules) {
    //         if (rule()) {
    //
    //         }
    //     }
    //     tokens.reset();
    // }
}

/**
 * 'Matches one.'
 */
export function alternation(...rules: Rule[]): Rule {
    return null as unknown as Rule;
    // return advance(rules.find);
}

/**
 * 'Matches zero or more.'
 */
export function star(...rules: Rule[]): Rule {
    return null as unknown as Rule;
    // return advance(rules.filter);
}

/**
 * 'Matches one or more.'
 */
export function plus(...rules: Rule[]): Rule {
    return null as unknown as Rule;
    // return advance(rules.map);
}

export function optional(...rules: Rule[]): Rule {
    return null as unknown as Rule;
    // return function (tokens) {
    //     advance(token => tokens)(tokens);
    // }
}
