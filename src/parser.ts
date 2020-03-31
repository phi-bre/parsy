import {Declaration} from './declaration';
import {Lexer, Node} from './index';

export class Parser {
    public node?: Node;

    constructor(
        public start: Declaration,
        public lexer: Lexer
    ) {
    }

    get tree() {
        const root = new Node('root');
        this.node = root;
        this.start.parse(this);
        return root;
    }
}
