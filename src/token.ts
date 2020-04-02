import {Position} from './index';
import {indent} from './utils';

export class Token {

    constructor(
        public type: string | number | symbol,
        public value: string,
        public ignore: boolean = false
    ) {
    }

    toString(level: number = 0) {
        return indent(level)
            + this.type.toString()
            + ': '
            + this.value + '\n';
    }
}
