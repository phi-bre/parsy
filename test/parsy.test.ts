// describe('#parsy', () => {
//
//     const instance = parsy(({alternation, terminal, sequence, alias}) => {
//         alias('terminal', terminal(/A/));
//         alias('another', sequence('rule'));
//         alias('rule', alternation('terminal', 'terminal', terminal('B')));
//     });
//
//     it('should not crash', () => {
//         expect(instance('AAA', 'rule').toString()).toMatchSnapshot();
//     });
// });

describe('#parsy', () => {
    const type = Symbol('type');

    const ws = {};
    const expression = {};
    const int = {};
    const value = {};
    const plus = {};
    const star = {};

    ws[' '] = ws['\n'] = ws['\t'] = ws;
    int[0] = int[1] = int[2] = int[3] = int[4] = int[5] = int[6] = int[7] = int[8] = int[9] = int;
    expression['('] = expression[')'] = plus['+'] = star['*'] = null;

    Object.assign(value, int);
    Object.assign(value, expression);
    Object.assign(value, plus);
    Object.assign(value, star);

    ws[type] = 'whitespace';
    expression[type] = 'expression';
    int[type] = 'integer';
    value[type] = 'value';
    plus[type] = 'plus';
    star[type] = 'star';

    console.log(
        'value: ' + Object.keys(value).join(' ') + '\n' +
        'expression: ' + Object.keys(expression).join(' ') + '\n' +
        'integer: ' + Object.keys(int).join(' ') + '\n' +
        'addition: ' + Object.keys(plus).join(' ') + '\n' +
        'multiplication: ' + Object.keys(star).join(' ')
    );

    const input = new Array(10_000_000).fill(1).join('');

    console.time('regex');
    const [group] = /^[0-9]+/.exec(input) || [];
    console.timeEnd('regex');

    console.time('while');
    const pattern = /^[0-9]+/;
    let test = '', length = 0;
    while (length++ < input.length) {
        // pattern.exec(input.substring(0, length));
    }
    console.timeEnd('while');

    console.time('lookup');
    let index = 0, last = 0;
    let tree: any = [];
    tree.type = value; // start

    while (index < input.length) {
        switch (tree.type[input[index]]) {
            case undefined:
            case null:
                // console.log('close scope: ' + tree.type + ' "' + input[index] + '" @ ' + index);
                tree.push(input.substring(last, index));
                if (tree = tree.parent) continue;
                else throw 'unexpected token: "' + input[index] + '" @ ' + index;
            default:
                // console.log('open scope: ' + next[type] + ' "' + input[index] + '" @ ' + index);
                const node: any = [];
                node.type = tree.type[input[index]];
                node.parent = tree;
                tree.push(node);
                tree = node;
                last = index;
            case tree.type:
                // console.log('continue scope: ' + next[type] + ' "' + input[index] + '" @ ' + index);
                index++;
        }
    }

    tree.push(input.substring(last, index));
    tree = tree.parent;

    if (tree.parent) {
        throw 'unclosed scope: ' + tree.type[type];
    }
    console.timeEnd('lookup');

    it('should not crash', () => {
        // console.log(tree[0][0]);
        // console.log(group);
        expect(true).toBeTruthy();
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

    const object: any[] = [opt, /^[ \n\t]*([A-Za-z0-9]+)[ \n\t]*({)/g, /^[ \n\t]*(})/g];
    object.push(object);

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

    // const id = [ter, /^[A-Za-z0-9]+/];
    // let obj = [seq];
    // const bo = [ter, /^{/];
    // const bc = [ter, /^}/];
    // const id_bo = [seq, id, bo];
    // const id_bo_obj = [seq, id_bo];
    // const obj_opt = [alt, obj, null];
    // const obj_rec = [seq, obj, obj];
    // // obj.push(seq, id_bo_obj);
    //
    // let tree: Node = [] as any;
    // tree.label = value; // start
    // for (let i = 0; i < input.length; i++) {
    //
    // }
});
