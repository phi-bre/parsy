import {Position} from './index';
import {indent} from './utils';

export class Token {

    constructor(
        public type: string | number | symbol,
        public value: string,
        public position: Position,
        public ignore: boolean = false
    ) {
    }

    toString(level: number = 0) {
        return indent(level)
            + '\u001b[35m'
            + this.type.toString()
            + '\u001b[0m'
            + ': '
            + this.value + '\n';
    }
}
