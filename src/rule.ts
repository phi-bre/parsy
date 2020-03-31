import {Declaration} from './declaration';
import {Declarations} from './index';
import {Node} from './node';
import {Parser} from './parser';

export abstract class Rule extends Declaration {
    public declarations: Declaration[];

    constructor(type: string | symbol, public rules: (string | Declaration)[]) {
        super(type);
        this.declarations = [];
        for (const declaration of rules) {
            if (declaration instanceof Declaration) {
                this.declarations.push(declaration);
                if (declaration instanceof Rule) {
                    this.declarations.push(...declaration.declarations);
                }
            }
        }
    }

    public resolve(declarations: Declarations) {
        for (let i = 0; i < this.rules.length; i++) {
            const rule = this.rules[i];
            if (typeof rule === 'string') {
                this.rules[i] = declarations[rule];
                if (!this.rules[i])
                    throw 'Cannot find reference: ' + rule;
            }
        }
    }
}

export class Sequence extends Rule {
    public parse(parser: Parser) {
        for (const rule of this.declarations) {
            rule.parse(parser);
        }
    }
}

export class Scope extends Sequence {
    public parse(parser: Parser) {
        try {
            parser.node = new Node(this.type, parser.node);
            super.parse(parser);
            if (!parser.node.parent)
                throw 'Scope mismatch';
            parser.node.parent.push(parser.node);
        } finally {
            parser.node = parser.node!.parent;
        }
    }
}

export class Alternation extends Rule {
    public parse(parser: Parser) {
        const position = parser.lexer.position;
        let error; // TODO
        for (const rule of this.declarations!) {
            try {
                rule.parse(parser);
                return;
            } catch (e) {
                error = e;
                parser.lexer.reset(position);
            }
        }
        throw error;
    }
}

export class Optional extends Sequence {
    public parse(parser: Parser) {
        const position = parser.lexer.position;
        try {
            super.parse(parser);
        } catch {
            parser.lexer.reset(position);
        }
    }
}

export class Range extends Sequence {
    constructor(type: string | symbol, rules: (string | Declaration)[], public min: number = 0, public max: number = Infinity) {
        super(type, rules);
    }

    public parse(parser: Parser) {
        if (this.min) {
            for (let i = 0; i < this.min; i++) {
                super.parse(parser);
            }
        }
        for (let i = 0; i < this.max; i++) {
            Optional.prototype.parse.call(this, parser) // TODO: Make prettier
        }
    }
}
