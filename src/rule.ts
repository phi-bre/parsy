import {ParsyContext, ParsyParser} from './';

export class RuleParser extends ParsyParser {
    public parser!: ParsyParser;

    constructor(public type?: string) {
        super();
    }

    public set(parser: ParsyParser): this {
        this.parser = parser;
        return this;
    }

    public parse(context: ParsyContext): ParsyContext | undefined {
        const {index} = context;
        context.open(this.type);
        const temp = this.parser.parse(context);
        if (index === context.index) {
            context.discard();
        } else {
            context.close(this.type);
        }
        return temp;
    }
}
