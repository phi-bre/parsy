import {ParsyContext, ParsyParser} from './index';

export class NotParser extends ParsyParser {
    public parser!: ParsyParser;

    public set(parser: ParsyParser): this {
        this.parser = parser;
        return this;
    }

    public parse(context: ParsyContext): ParsyContext | undefined {
        if (this.parser.parse(context)) {
            return undefined;
        } else {
            return context.advance(1);
        }
    }
}
