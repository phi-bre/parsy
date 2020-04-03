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

    const input = new Array(5_000_000).fill(1).join('');

    console.time('regex');
    const [group] = /^[0-9]+/.exec(input) || [];
    console.timeEnd('regex');

    console.time('while');
    let test = '', length = 0;
    while (length < input.length) {
        test += input[length++];
    }
    console.timeEnd('while');

    console.time('lookup');
    let index = 0;
    let string = '';
    let tree: any = [];
    tree.type = value; // start

    while (index < input.length) {
        switch (tree.type[input[index]]) {
            case undefined:
            case null:
                // console.log('close scope: ' + tree.type + ' "' + input[index] + '" @ ' + index);
                tree.push(string);
                if (tree = tree.parent) continue;
                else throw 'unexpected token: "' + input[index] + '" @ ' + index;
            default:
                // console.log('open scope: ' + next[type] + ' "' + input[index] + '" @ ' + index);
                const node: any = [];
                node.type = tree.type[input[index]];
                node.parent = tree;
                tree.push(node);
                tree = node;
            case tree.type:
                // console.log('continue scope: ' + next[type] + ' "' + input[index] + '" @ ' + index);
                string += input[index];
                index++;
        }
    }

    tree.push(string);
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
