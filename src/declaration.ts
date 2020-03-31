import {Node} from './node';
import {Parser} from './parser';

export abstract class Declaration {
    constructor(public type: string | symbol) {
    }

    public abstract parse(parser: Parser): Node | undefined | void;
}
