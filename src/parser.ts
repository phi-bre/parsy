import {Branch, Lexer} from './index';

export type Rule = (parser: Parser) => void | boolean;
export type RuleStore = {
    [matcher: string]: Rule;
};

export class Parser {
    public node?: Branch;

    constructor(
        public start: Rule,
        public rules: RuleStore,
        public lexer: Lexer
    ) {
    }

    get tree() {
        const root = new Branch('root');
        this.node = root;
        this.resolve(this.start);
        return root;
    }

    public resolve(reference: string | Rule) {
        if (typeof reference === 'function')
            return reference(this);
        if (this.rules[reference])
            return this.rules[reference](this);
        throw 'Cannot find reference: ' + reference;
    }
}
