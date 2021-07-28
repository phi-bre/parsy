// interface Token {
//     type: string;
//     value: string;
// }
//
// interface Parser {
//     (input: any, offset: number): Token | undefined;
// }
//
// interface Grammar {
//     rule(name: string, block: (context: Context) => Parser);
//     on(name: string, listener: (token: Token) => void);
// }
//
// type Context = {
//     [key: string]: Parser;
// } & {
//     char(character: string): Parser;
// };

const chr = (char: string): Rule => ({
    // type: 'terminal',
    name: `chr(${char})`,
    create: parser => ({
        next: value => ({
            value: value === char ? value : undefined,
            done: true,
        }),
    }),
    open(context) {
        if (context.value === char) {
            context.commit(context.value);
        } else {
            context.fail();
        }
    },
    close(context) {
        context.fail();
    },
});

const set = (from: string, to: string): Rule & { min: number, max: number } => ({
    name: `set(${from}-${to})`,
    min: from.charCodeAt(0),
    max: to.charCodeAt(0),
    open(context) {
        const code = context.value.charCodeAt(0);
        if (code >= this.min && code <= this.max) {
            context.commit(context.value);
        } else {
            context.fail();
        }
    },
    close(context) {

    },
});

const str = (value: string): Rule => seq([...value].map(chr));

const seq = (...rules: Rule[]): Rule => ({
    name: 'seq',
    create: (parser: Parser) => ({
        index: 0,
        children: [rules[0].create(parser)],
        next(context) {
            return context.fork()
        },
    }),
});

const alt = (...rules): Rule => ({
    name: 'alt',
    create: parser => {
        parser.branches
        return ({

        });
    },
});

const opt = (rule: Rule): Rule => ({
    name: 'opt',
    create: parser => ({
        next(context: Context) {

        },
    }),
});

const ref = (rule: string): Rule => ({
    name: rule,
    create: parser => ({
        next: context => ({}),
    }),
});

// @ts-ignore
// function describe(start, block) {
//     const syntax = {
//         start: start,
//         rules: {},
//         listeners: {},
//         add: (name, block) => syntax.rules[name] = block,
//         on: (name, listener) => syntax.listeners[name] = listener,
//         parse: (input, index = 0) => {
//             const forks = [];
//             const context = {
//                 name: start,
//                 input: input,
//                 index: index,
//                 branches: [],
//                 commit: (token) => context.branches.push(token),
//                 fork: (name = context.name) => {
//                     forks.push({ ...context, name, branches: [...context.branches] });
//                 },
//                 merge: () => {},
//             };
//             while (context.index < context.input.length) {
//                 for (const fork of forks) {
//
//                 }
//                 context.index++;
//             }
//         },
//     };
//     block(syntax);
//     return syntax;
// }
//
// const parser = describe('label', syntax => {
//     syntax.add('label', rules => seq(opt(alt(seq(chr('b'), chr('a'))))));
//     // syntax.add('{', ctx => ctx.terminal('{'));
//     // syntax.add('}', ctx => ctx.terminal('}'));
//     syntax.on('label', token => console.log(token));
// });
//
// console.log(parser.parse('aabbcc'));
//
// const parser = parsy
//             .rule('root')
//             .set(
//                 parsy.sequence(
//                     parsy.optional(
//                         parsy.alternation(
//                             parsy.sequence(parsy.char('b'), parsy.char('a')),
//                             parsy.sequence(parsy.char('b'), parsy.char('b'))
//                         )
//                     ),
//                     parsy.char('c')
//                 )
//             );
//
//         for (const token of parser({ input: 'bbc', index: 0 })) {
//             console.log(JSON.stringify(token, null, 4));
//         }

// Grammar is a complete set of rules for a given sequence.

interface Rule {
    name: string;
    create(parser: Parser): Context;
}

interface Context {
    next(context: Context);
    fail();
    fork();
}

class Grammar {
    constructor(public rules: Record<string, Rule> = {}) {
        for (const rule in rules) {
            rules[rule].name = rule;
        }
    }

    public set(name: string, rule: Rule) {
        this.rules[name] = rule;
    }
}

class Parser {
    public branches!: Context[];

    constructor(
        public grammar: Grammar,
        public start: string,
    ) {
    }

    public parse(input: Iterable<string>) {
        this.branches = [this.grammar.rules[this.start].create(this)];
        for (const value of input) {

        }
        return this.branches;
    }
}

// class Context {
//     public value: string;
//
//     constructor(
//         public readonly parser: Parser,
//         public readonly rule: Rule,
//         public children: Context[] = [],
//     ) {
//         this.value = '';
//     }
//
//     public commit(value: string) {
//         this.children.push(value);
//     }
//
//     public fail(key: string) {
//
//     }
//
//     public fork(rule: string) {
//         const context = new Context(this.parser, this.rule, [...this.children]);
//         // this.branches.push(context);
//     }
//
//     // public merge() {
//     //
//     // }
// }

const grammar = new Grammar({
    label: seq(opt(alt(seq(chr('b'), chr('a'))))),
});
const parser = new Parser(grammar, 'label');
console.log(parser.parse('asdasd'));
