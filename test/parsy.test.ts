import {parsy} from '../src/parsy';

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
    const alias = (string: string) => ({[type]: string});

    const whitespace = alias('whitespace');
    const expression = alias('expression');
    const integer = alias('integer');
    const value = alias('value');
    const addition = alias('addition');
    const multiplication = alias('multiplication');

    whitespace[' '] = whitespace;
    whitespace['\n'] = whitespace;
    whitespace['\t'] = whitespace;

    integer['0'] = integer;
    integer['1'] = integer;
    integer['2'] = integer;
    integer['3'] = integer;
    integer['4'] = integer;
    integer['5'] = integer;
    integer['6'] = integer;
    integer['7'] = integer;
    integer['8'] = integer;
    integer['9'] = integer;

    expression['('] = value;
    expression[')'] = null;

    addition['+'] = value;

    multiplication['*'] = value;

    Object.assign(value, integer);
    Object.assign(value, expression);
    Object.assign(value, addition);
    Object.assign(value, multiplication);
    // Object.assign(addition, value);
    // Object.assign(multiplication, value);

    console.log(
        'value: ' + Object.keys(value).join(' ') + '\n' +
        'expression: ' + Object.keys(expression).join(' ') + '\n' +
        'integer: ' + Object.keys(integer).join(' ') + '\n' +
        'addition: ' + Object.keys(addition).join(' ') + '\n' +
        'multiplication: ' + Object.keys(multiplication).join(' ')
    );

    console.time('abc');

    const input = '100000000000000000000000000000000000000000000001239812380+10';
    let index = 0;
    const stack: any[] = [value];
    let tree: any = [];
    tree.type = value[type];

    while (index < input.length) {
        const char = input[index];
        const [current] = stack;
        const next = current[char];

        if (!next) {
            console.log('close scope: ' + current[type] + ' "' + char + '"@' + index);
            if (!stack.shift()) {
                throw 'unexpected token: "' + char + '"@' + index;
            }
            tree = tree.parent;
        }

        else if (next === current) {
            console.log('open scope: ' + next[type] + ' "' + char + '"@' + index);
            const temp: any = [];
            temp.type = current[type];
            temp.parent = tree;
            tree = temp;
            stack.unshift(next);
        }

        // console.log('continue scope: ' + next[type] + ' "' + char + '"@' + index);
        tree.push(char);
        index++;
    }

    console.timeEnd('abc');

    it('should not crash', () => {
        console.log(tree);
        expect(true).toBeTruthy();
    });
});
