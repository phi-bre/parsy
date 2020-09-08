import {AndParser, EmptyParser, OrParser, Parsy, TerminalParser} from '../src/parsy';

describe('#parsy', () => {
    const empty = new EmptyParser();
    const _ = new OrParser(new TerminalParser(/[ \t\n\r]+/), empty);
    const label = new AndParser(_, new TerminalParser(/[A-Za-z0-9]+/));
    const open = new AndParser(_, new TerminalParser(/{/));
    const close = new AndParser(_, new TerminalParser(/[*/]/));
    const value = new AndParser();
    const values = new OrParser();
    value.setup(
        _,
        new AndParser(
            label,
            new AndParser(
                open,
                new OrParser(
                    values,
                    close,
                ),
            ),
        ),
    );
    values.setup(new OrParser(value, empty), new OrParser(values, _));
    const parser = new Parsy(values);

    const input = `
        grammar  {
            test {}
            abc {}
        }
    `;

    it('should parse correct structure', function () {
        console.log(parser.exec(input)!.node.children.map((node: any) => node.value))
        expect(parser.exec(input)).toMatchSnapshot();
    });
});

// describe('#two', function () {
//     // object: [A-Za-z0-9]+ '{' object* '}'
//     const input = `
//         grammar {
//             test {
//
//             }
//             abc {}
//         }
//     `;
//
//     const sequence = (...rules) => [seq, ...rules];
//     const alternation = (...rules) => [alt, ...rules];
//     const alias = (type: string, ...rules) => [type, ...rules];
//
//     const ter = Symbol('terminal');
//     const alt = Symbol('alternation');
//     const seq = Symbol('sequence');
//     const opt = Symbol('optional');
//     const sco = Symbol('scope');
//
//     type Rule = (Array<string> | Function) & { label?: string, op: Function };
//     type Node = Array<string | Node> & { label: string };
//
//     // remove start symbol
//     // object: id '{' object* '}'
//     // id: [A-Za-z0-9]+
//
//     // remove enclosed terminals
//     // object: id so object* sc
//     // id: [A-Za-z0-9]+
//     // so: '{'
//     // sc: '}'
//
//     // break up recursions
//     // object: id so obj_rec sc
//     // id: [A-Za-z0-9]+
//     // so: '{'
//     // sc: '}'
//     // obj_rec: object obj_rec
//
//     let object, a, b, c;
//
//     a = /^[ \n\t]*([A-Za-z0-9]+)[ \n\t]*({)/g;
//     c = /^[ \n\t]*(})/g;
//
//     b = (i: string) => object(i) || c(i);
//     object = (i: string) => open('object') && b(i);
//
//     let tree = [];
//
//     function open(label: string) {
//
//     }
//
//     function close(label: string) {
//
//     }
//
//     let index = 0;
//     let tree = [] as any;
//     tree.type = object;
//     do {
//         const [op, open, close, type] = tree.type;
//         open.lastIndex = index;
//         const match = open.exec(input);
//         if (match) {
//             tree.push(...match.slice(1));
//             console.log('open: ' + match[1]);
//             const node = [] as any;
//             node.type = type;
//             node.parent = tree;
//             tree = node;
//             index += match[0].length;
//         } else {
//             close.lastIndex = index;
//             const match = close.exec(input);
//             if (!match) throw 'blub';
//             console.log('close: ' + match[1]);
//             index += match[0].length;
//             tree.push(...match.slice(1));
//             tree.parent.push(tree);
//             tree = tree.parent;
//         }
//     } while (tree.parent && index < input.length);
//
//
//     tree.parent.push(tree);
//     tree = tree.parent;
//
//     console.log(tree);
//
//     it('should ', function () {
//         expect(true).toBeTruthy();
//     });
// });
