import {Token} from './token';
import {indent} from './utils';

export class Node extends Array<Node | Token> {

    constructor(public type: string | number | symbol, public parent?: Node) {
        super();
    }

    toString(level: number = 0): string {
        const space = indent(level);

        let children = '';
        for (const child of this) {
            children += child.toString(level + 1);
        }

        return space
            + this.type.toString()
            + ' [\n'
            + children
            + space
            + ']\n';
    }
}
