import { ParsyContext, ParsyParser, ParsyTransform } from './index';

export class TransformParser extends ParsyParser {
    public parser!: ParsyParser;
    public transformer!: ParsyTransform;

    constructor(parser: ParsyParser, transformer: ParsyTransform) {
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
            this.transformer(
                context.token.children[context.token.children.length - 1]
            );
        }
        return temp;
    }
}
