export {default as lexer} from "./lexer";
export {default as parser} from "./parser";
export {default as grammar} from "./grammar";
export {default as reference} from "./reference";

export default function parsy(layers: Function[] = []): any {
    const pipeline = (source: string) => {
        const result: any = layers.reduce((previous, current) => current(previous), source);
        return Symbol.iterator in result ? [...result] : result;
    };
    pipeline.use = (layer: Function) => (layers.push(layer), layer);
    return pipeline;
}
