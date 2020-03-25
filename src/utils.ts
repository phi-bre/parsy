
export function indent(level: number, space: string = '  ') {
    let indent = '';
    for (let i = 0; i < level; i++) {
        indent += space;
    }
    return indent;
}
