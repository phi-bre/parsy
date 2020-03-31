import {Declaration} from './declaration';
import {SyntaxError} from './errors';
import {Lexer} from './lexer';
import {Parser} from './parser';
import {Token} from './token';

export abstract class Terminal extends Declaration {
    public abstract lex(lexer: Lexer): Token | undefined | void;

    public parse({node, lexer}: Parser) {
        const token = lexer.next;
        if (token.type !== this.type) {
            throw new SyntaxError(lexer.input, token, this.type.toString());
        }
        node!.push(token);
        return node;
    }
}

export class StringTerminal extends Terminal {
    constructor(type: string | symbol, public value: string) {
        super(type);
    }

    public lex({input, index, position}: Lexer) {
        if (input.startsWith(this.value, index)) {
            return new Token(this.type, this.value, position);
        }
    }
}

export class RegexTerminal extends Terminal {
    public pattern: RegExp;

    constructor(type: string | symbol, public value: RegExp) {
        super(type);
        this.pattern = new RegExp(value.source, 'y');
    }

    public lex({input, index, position}: Lexer) {
        this.pattern.lastIndex = index;
        const match = this.pattern.exec(input);
        if (match) {
            return new Token(this.type, match[0], position);
        }
    }
}
