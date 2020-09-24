import {ParsyContext, ParsyParser, ParsyToken} from './index';

export class TransformParser extends ParsyParser {
    public parser!: ParsyParser;
    public transformer!: (token: ParsyToken) => any;

    constructor(parser: ParsyParser, transformer: (token: ParsyToken) => any) {
        super();
        this.parser = parser;
        this.transformer = transformer;
    }

    public set(...args: any) {
        this.parser.set(...args);
        return this;
    }

    public parse(context: ParsyContext): ParsyContext | undefined {
        const temp = this.parser.parse(context);
        if (temp) {
            this.transformer(context.token.children[context.token.children.length - 1]);
        }
        return temp;
    }
}
