import {Node} from './node';
import {Token} from './token';

type Reference = string | symbol;

interface Context {
    input: string;
    index: number;
    node: Node;
}

export function parsy(config) {
    const references = {};

    function terminal(pattern: RegExp | string) {
        const reference = Symbol('terminal:' + pattern);
        const regex = new RegExp('^' + pattern.source || pattern, 'y');
        references[reference] = function (context: Context) {
            regex.lastIndex = context.index;
            const match = regex.exec(context.input);
            if (match) {
                const value = match[0];
                context.node.push(new Token(reference, value));
                context.index += value.length;
                return true;
            }
            return false;
        };
        return reference;
    }

    function sequence(...sequence: Reference[]) {
        const reference = Symbol('sequence:' + sequence.length);
        references[reference] = function (context: Context) {
            for (const rule of sequence) {
                if (!references[rule](context)) {
                    return false;
                }
            }
            return true;
        };
        return reference;
    }

    function alternation(...sequence: Reference[]) {
        const reference = Symbol('alternation:' + sequence.length);
        references[reference] = function (context: Context) {
            const index = context.index;
            for (const rule of sequence) {
                if (references[rule](context)) {
                    return true;
                } else {
                    context.index = index;
                }
            }
            return false;
        };
        return reference;
    }

    // function range(min: number, max: number, ...sequence: Reference[]) {
    //     const reference = Symbol('range:' + sequence.length + ':' + min + ':' + max);
    //     references[reference] = function (context: Context) {
    //         for (let i = 0; i < min; i++) {
    //
    //         }
    //         for (let i = 0; i < max; i++) {
    //
    //         }
    //     };
    //     return reference;
    // }

    function alias(type: string, reference: Reference) {
        references[type] = function (context: Context) {
            context.node = new Node(type, context.node);
            references[reference](context);
            if (!context.node.parent) throw 'Scope mismatch.';
            context.node = context.node.parent;
        };
        return type;
    }

    config({terminal, alternation, alias, sequence});

    return function (input: string, start: string) {
        const node = new Node('root');
        const index = 0;
        const context = {node, input, index: 0};
        references[start](context);
        if (context.index < input.length - 1) {
            throw 'Unexpected token: ' + input[context.index];
        }
        return node;
    }
}
