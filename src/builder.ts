import {Matcher, Node, ParsyOptions, Reference, State, Tokens} from './index';

const matchers = {};

export function tree<T, R>(options: ParsyOptions<T, R>) {
    const state = {matchers} as State<T, R>;

    for (const type in options.terminals) {
        state.matchers[type] = state => {
            const token = state.tokens.next;

            if (token.type === type) {
                return state.node.push(token);
            }

            throw 'Unexpected token: ' + token.type + '. Expected: ' + type;
        }
    }

    for (const type in options.rules) {
        if (type in state.matchers)
            throw 'Rules and terminals cannot have the same type: ' + type;

        state.matchers[type] = state => {
            try {
                const node = [] as unknown as Node<T, R>;
                node.type = type as any;
                node.parent = state.node;
                state.node = node;
                resolve(options.rules[type] as any, state);
                state.node.parent.push(state.node);
            } finally {
                state.node = state.node.parent;
            }
        }
    }

    return function (tokens: Tokens<T>) {
        const root = [] as unknown as Node<T, R>;
        state.node = root;
        state.tokens = tokens;
        resolve(options.start as any, state);
        return root;
    }
}

export function register<T, R>(types: Reference<T, R>[], label: string, matcher: Matcher<T, R>): Reference<T, R> {
    if (!types?.length)
        throw 'A matcher must have at least one rule.';

    const symbol = Symbol(label);
    matchers[symbol] = matcher;
    return symbol;
}

function resolve(type: string, state) {
    if (type in state.matchers)
        return state.matchers[type](state);

    throw 'Cannot find reference: ' + type;
}

function bail(error: string) {
    console.error(error);
    // if (error && error.startsWith('Cannot find reference: '))
    //     throw error;
}

/**
 * Matches a sequence of types.
 * All of the rules provided need to match.
 */
export function sequence<T, R>(...types: Reference<T, R>[]): Reference<T, R> {
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
export function alternation<T, R>(...types: Reference<T, R>[]): Reference<T, R> {
    return register(types, 'alternation', state => {
        const position = state.tokens.position;
        for (const type of types) try {
            return resolve(type, state);
        } catch (error) {
            bail(error);
            state.tokens.reset(position);
        }

        throw 'Unexpected token: ' + state.tokens.peek.type + '\nExpected to find: ' + types.join(', ');
    });
}

/**
 * Matches the supplied sequence but recovers if not all of them match.
 * Makes the sequence optional.
 */
export function optional<T, R>(...types: Reference<T, R>[]): Reference<T, R> {
    return register(types, 'optional', state => {
        const position = state.tokens.position;
        for (const type of types) try {
            return resolve(type, state);
        } catch (error) {
            bail(error);
            state.tokens.reset(position);
        }
    });
}

/**
 * Matches and repeats matching the supplied sequence.
 * Recovers if the sequence never matches.
 */
export function star<T, R>(...rules: Reference<T, R>[]): Reference<T, R> {
    const reference = sequence(...rules);
    return register(rules, 'star', state => {
        while (true) {
            const position = state.tokens.position;
            try {
                console.log(state);
                resolve(reference, state);
            } catch (error) {
                bail(error);
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
export function plus<T, R>(...types: Reference<T, R>[]): Reference<T, R> {
    const reference = star(...types);
    return register(types, 'plus', state => {
        resolve(reference, state);
        // TODO
    });
}
