export class ParsyToken {
    public value: string;
    public children: ParsyToken[];
    public from: number;
    public to?: number;

    constructor(
        index: number,
        public parent?: ParsyToken,
        public type?: string
    ) {
        this.children = [];
        this.value = '';
        this.from = index;
    }
}
