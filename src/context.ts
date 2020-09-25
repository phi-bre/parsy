import {ParsyToken} from '.';

export class ParsyContext {
    public input: string;
    public index: number;
    public token: ParsyToken;

    constructor(input: string, index: number = 0) {
        this.input = input;
        this.index = index;
        this.token = new ParsyToken(index);
        this.token.to = index;
    }

    public advance(length: number): this {
        this.index += length;
        return this;
    }

    public open(type?: string): this {
        this.token = new ParsyToken(this.index, this.token, type);
        return this;
    }

    public close(keep: boolean): this {
        if (!this.token.parent) throw 'Scope mismatch';
        if (keep) {
            this.token.value = this.input.substring(this.token.from, this.index);
            this.token.to = this.index;
            this.token.parent.children.push(this.token);
        }
        this.token = this.token.parent;
        return this;
    }
}
