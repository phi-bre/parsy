// // const chr = (char: string): Terminal => value => {
// //     return value === char;
// // };
// //
// // const set = (from: string, to: string): Terminal => value => {
// //     return value.charCodeAt(0) >= from.charCodeAt(0) && value.charCodeAt(0) <= to.charCodeAt(0);
// // };
//
// const chr = (char: string): Rule => ({
//     name: `chr(${char})`,
//     call: (parser, parent) => ({
//         parser,
//         parent,
//         value: char,
//         children: [],
//         next(value) {
//             return value === char;
//         },
//     }),
// });
//
// const not = (rule: Rule): Rule => ({
//     name: `not(${rule.name})`,
//     call: (parser, parent) => ({
//         parser,
//         parent,
//         process: rule.call(parser, this),
//         children: [],
//         next(value) {
//             return !this.process.next(value);
//         },
//     }),
// });
//
// const str = (string: string): Rule => ({
//     name: `str(${string})`,
//
// });
//
// const seq = (...rules: Rule[]): Rule => ({
//     name: 'seq',
//     call: (parser, parent) => ({
//         index: 0,
//         before() {
//
//         },
//         close() {
//             rules[++this.index].before();
//         },
//     })
// });
//
// const alt = (...rules: Rule[]): Rule => ({
//     name: 'alt',
//     call: (parser, parent) => {
//         const context: Context = { parser, parent, children: [],
//             close() {
//
//             }
//         };
//         for (const rule of rules) {
//             parser.branches.add(rule.call(parser, context));
//         }
//         return context;
//     }
// });
//
// const opt = (rule: Rule): Rule => ({
//     name: 'opt',
//     call: (parser, parent) => ({
//         parser,
//         parent,
//         children: [],
//         open() {
//
//         },
//         next() {
//
//         },
//     })
// });
//
// const ref = (rule: string): Rule => ({
//     name: rule,
//     call: (parser, parent) => parser.rules[rule].call(parser, parent)
// });
//
// interface Rule {
//     name: string;
//     call(parser: Parser, parent?: Context): Context;
// }
//
// interface Context {
//     parser: Parser;
//     parent?: Context;
//     children: Context[];
//     next?();
//     catch?();
// }
//
// class Parser {
//     public branches!: Set<Context>;
//
//     constructor(public rules: Record<string, Rule>, public start: string) {
//     }
//
//     // public compile(start: string) {
//     //     for (const rule in this.rules) {
//     //         this.rules[rule]
//     //     }
//     // }
//
//     public parse(input: Iterable<string>) {
//         this.branches = new Set<Context>([this.rules[this.start].call(this)]);
//         for (const value of input) {
//             for (const branch of this.branches) {
//                 if (!branch.next?.(value)) {
//                     this.branches.delete(branch);
//                     while (branch.parent?.catch) {
//                         branch.parent.catch();
//                     }
//                 }
//             }
//         }
//         return this.branches;
//     }
// }
//
// const parser = new Parser({
//     label: seq(opt(alt(seq(chr('b'), chr('a'))))),
// }, 'label');
// // parser.compile('label');
// parser.parse('asdasd');


interface Rule {
    type: string;
    children: Rule[];
}

function chr(char: string): Rule {
    return {
        type: 'char',
        children: [],
    };
}

function set(from: string, to: string): Rule {
    return {
        type: 'set',
        children: [],
    };
}

function ref(rule: string): Rule {
    return {
        type: 'reference',
        children: [],
    };
}

function seq(...rules: Rule[]): Rule {
    return {
        type: 'sequence',
        children: rules,
    };
}

function alt(...branches: Rule[]): Rule {
    return {
        type: 'alternation',
        children: branches,
    };
}

function opt(rule: Rule): Rule {
    return {
        type: 'optional',
        children: [rule],
    };
}

function rep(rule: Rule): Rule {
    return {
        type: 'repeated',
        children: [rule],
    };
}

function def(...rules: Rule[]): Rule {
    return {
        type: 'define',
        children: rules,
    };
}

function rule(name: string, rule: Rule): Rule {
    return {
        type: 'rule',
        children: [rule],
    };
}

// Parsers inherently have a problem deciding between memory size (by aggregating each rule's children)
// and time complexity (by descending the tree recursively for each rule).
// Which is the same problem that databases face, storing often used values in indexes,
// using up more space, or search through the whole list/table to manually find items.
// N vs NP

const tree = def(
    rule('label', rep(set('a', 'z'))),
    rule('open', chr('{')),
    rule('close', chr('}')),
    rule('value', seq(ref('label'), opt(seq(ref('open'), opt(rep(ref('value'))))))),
);

seq(ref('value'), opt());

console.log(JSON.stringify(tree, null, 2));

// document.querySelector('#id.aasd:last-child');

// function select({ type }) {
//     return {
//         exec(tree: Rule) {
//             tree.children
//         },
//     };
// }
