import {BuilderOptions, Matcher, Node, State, Tokens} from './index';

const matchers = {};

export function builder(options: BuilderOptions) {
    const state = {matchers} as State;

    if (!options.scopes)
        throw 'No scopes specified.';
    if (!options.rules)
        throw 'No rules specified.';
    if (!options.start)
        throw 'No start specified.';

    convert(state, options.terminals, type => state => {
        const token = state.tokens.next;
        if (token.type === type) {
            return state.node.push(token);
        }
        throw 'Unexpected token: ' + token.type.toString() + '. \nExpected: ' + type;
    });

    convert(state, options.rules, type => state => {
        resolve(options.rules[type], state);
    });

    convert(state, options.scopes, type => state => {
        try {
            state.node = new Node(type, state.node);
            resolve(options.scopes[type], state);
            state.node.parent!.push(state.node);
        } finally {
            state.node = state.node.parent!;
        }
    });

    return function (tokens: Tokens) {
        const root = new Node('root');
        state.node = root;
        state.tokens = tokens;
        resolve(options.start, state);

        if (state.tokens.peek)
            throw 'Unexpected token: ' + state.tokens.next.type.toString() + '\nExpected: EOF';

        return root;
    }
}

/**
 * Used internally to convert config types to matchers.
 * @param state
 * @param types
 * @param reducer
 */
function convert(state: State, types, reducer: (type: string) => Matcher) {
    for (const type in types) {
        if (types.hasOwnProperty(type)) {
            if (type in state.matchers)
                throw 'Token type already defined: ' + type;
            state.matchers[type] = reducer(type);
        }
    }
}

/**
 * Used to register new matchers factories.
 * @param types
 * @param label
 * @param matcher
 */
export function register(types: (string | symbol)[], label: string, matcher: Matcher): symbol {
    if (!types?.length)
        throw 'A matcher must have at least one rule.';

    const symbol = Symbol(label);
    matchers[symbol] = matcher;
    return symbol;
}

/**
 * Used to resolve match type references to actual matchers.
 * @param type
 * @param state
 */
export function resolve(type: string | symbol, state: State) {
    if (!state.matchers[type as string])
        throw 'Cannot find reference: ' + type.toString();
    return state.matchers[type as string](state);
}

/**
 * Matches a sequence of types.
 * All the rules provided need to match.
 */
export function sequence(...types: (string | symbol)[]) {
    return register(types, 'sequence', state => {
        for (const type of types) {
            resolve(type, state);
        }
    });
}

/**
 * Searches for the first type that matches in sequential order.
 * At least one of the types has to match.
 */
export function alternation(...types: (string | symbol)[]) {
    return register(types, 'alternation', state => {
        const position = state.tokens.position;
        for (const type of types) try {
            return resolve(type, state);
        } catch {
            state.tokens.reset(position);
        }
        throw 'Unexpected token: ' + state.tokens.peek!.type.toString() + '\nExpected to find: ' + types.join(' | ');
    });
}

/**
 * Matches the supplied sequence but recovers if not all of them match.
 * Makes the sequence optional.
 */
export function optional(...types: (string | symbol)[]) {
    return register(types, 'optional', state => {
        const position = state.tokens.position;
        try {
            for (const type of types) {
                resolve(type, state);
            }
        } catch {
            state.tokens.reset(position);
        }
    });
}

/**
 * Matches and repeats matching the supplied sequence.
 * Recovers if the sequence never matches.
 */
export function star(...rules: (string | symbol)[]) {
    const reference = sequence(...rules);
    return register(rules, 'star', state => {
        while (true) {
            const position = state.tokens.position;
            try {
                resolve(reference, state);
            } catch {
                state.tokens.reset(position);
                break;
            }
        }
    });
}

/**
 * Matches and repeats matching the supplied sequence.
 * Requires the sequence to match at least once.
 */
export function plus(...types: (string | symbol)[]) {
    const reference = star(...types);
    return register(types, 'plus', state => {
        resolve(reference, state);
        // TODO
    });
}
