import {parsy} from '../src';

describe('#parsy', () => {
    const parse = parsy({
        start: 'value',
        ignore: '[ \t\n\r]+',
        terminals: {
            label: '[A-Za-z0-9]+',
            open: '{',
            close: '}'
        },
        rules: {
            value: ['label', 'open', '*value', 'close']
        }
    });
    const input = `
        grammar {
            test {
        
            }
            abc {}
        }
    `;

    it('should parse correct structure', function () {
        expect(parse(input)).toEqual({
            grammar: {
                test: {},
                abc: {},
            }
        });
    });
});

describe('#two', function () {
    // object: [A-Za-z0-9]+ '{' object* '}'
    const input = `
        grammar {
            test {
        
            }
            abc {}
        }
    `;

    const sequence = (...rules) => [seq, ...rules];
    const alternation = (...rules) => [alt, ...rules];
    const alias = (type: string, ...rules) => [type, ...rules];

    const ter = Symbol('terminal');
    const alt = Symbol('alternation');
    const seq = Symbol('sequence');
    const opt = Symbol('optional');
    const sco = Symbol('scope');

    type Rule = (Array<string> | Function) & { label?: string, op: Function };
    type Node = Array<string | Node> & { label: string };

    // remove start symbol
    // object: id '{' object* '}'
    // id: [A-Za-z0-9]+

    // remove enclosed terminals
    // object: id so object* sc
    // id: [A-Za-z0-9]+
    // so: '{'
    // sc: '}'

    // break up recursions
    // object: id so obj_rec sc
    // id: [A-Za-z0-9]+
    // so: '{'
    // sc: '}'
    // obj_rec: object obj_rec

    let object, a, b, c;

    a = /^[ \n\t]*([A-Za-z0-9]+)[ \n\t]*({)/g;
    c = /^[ \n\t]*(})/g;

    b = (i: string) => object(i) || c(i);
    object = (i: string) => open('object') && b(i);

    let tree = [];

    function open(label: string) {

    }

    function close(label: string) {

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


    tree.parent.push(tree);
    tree = tree.parent;

    console.log(tree);

    it('should ', function () {
        expect(true).toBeTruthy();
    });
});
