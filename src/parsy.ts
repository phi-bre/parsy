import {Node} from './node';

type Reference = string | symbol;

interface Context {
    input: string;
    index: number;
    node: Node;
}

class ParsyNode {
    constructor(
        public type: string,
        public value: string,
        public parent?: ParsyNode,
    ) {
    }
}

// class ForkParser {
//     constructor(
//         public left: RegExp,
//         public right: RegExp,
//     ) {
//
//     }
//
//     public parse(input: string) {
//         if () {
//
//         }
//     }
// }

class Rule {
    public left: RegExp;
    public right: RegExp;
    public type: string;
}

class Parsy {
    private current: string;
    private stack: string[];
    private index: number;

    constructor(
        public start: string,
        public rules: Rule[],
    ) {
    }

    private open() {

    }

    private close() {

    }

    public parse(input: string) {
        this.current = this.start;
        this.stack = [];
        this.index = 0;

        while (true) {
            if (this.index <= input.length && this.stack.length) {
                throw 'Unexpected end of input';
            }


        }

        return this.stack[0];
    }
}

export function parsy(config) {
    let stack = [];
    let index = 0;
    let current = config.start;

    function open() {

    }

    function close() {

    }

    let index = 0;
    let tree = [] as any;
    tree.type = object;
    do {
        const [op, open, close, type] = tree.type;
        open.lastIndex = index;
        const match = open.exec(input);
        if (match) {
            tree.push(...match.slice(1));
            console.log('open: ' + match[1]);
            const node = [] as any;
            node.type = type;
            node.parent = tree;
            tree = node;
            index += match[0].length;
        } else {
            close.lastIndex = index;
            const match = close.exec(input);
            if (!match) throw 'blub';
            console.log('close: ' + match[1]);
            index += match[0].length;
            tree.push(...match.slice(1));
            tree.parent.push(tree);
            tree = tree.parent;
        }
    } while (tree.parent && index < input.length);

    return function (input: string) {

    }
}
