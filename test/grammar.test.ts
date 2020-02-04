import {grammar} from '../src';

const syntax = `
    expression: literal | unary | binary | grouping ;
    literal: /(\\d+)?\\.?\\d+/ | /"(.*?)"/ | "true" | "false" | "null" ;
    grouping: "(" expression ")" ;
    unary: ( "-" | "!" ) expression ;
    binary: expression operator expression ;
    operator: "==" | "!=" | "<" | "<=" | ">" | ">=" | "+"  | "-"  | "*" | "/" ;
`;

describe('grammar', () => {
    const checker = grammar(syntax);

    it('should check', () => {
        expect(checker('1 - (2 * 3) < 4 == false')).toBeTruthy();
    });

    it('should create correct tree', () => {
        const tree = checker('1 - (2 * 3) < 4 == false');
        expect(tree).toEqual([{
            type: 'expression',
            operator: '==',
            left: {
                type: 'expression',
                operator: '<',
                left: {
                    type: 'expression',
                    operator: '-',
                    left: {
                        type: 'literal',
                        value: '1',
                    },
                    right: {
                        type: 'expression',
                        operator: '*',
                        left: {
                            type: 'literal',
                            value: '2',
                        },
                        right: {
                            type: 'literal',
                            value: '3',
                        },
                    },
                },
                right: {
                    type: 'literal',
                    value: 'false',
                },
            },
            right: {
                type: 'literal',
                value: 'false',
            },
        }]);
    });
});
