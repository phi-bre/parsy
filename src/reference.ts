
export default new Proxy({}, {
    get(target: object, key: string): symbol {
        return Symbol(key);
    }
}) as any;
