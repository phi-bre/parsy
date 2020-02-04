## Getting started

Glossary:
terminal
reference
assignment
value
type
mutable


Concepts:
branching
nesting (scope)
grouping
hoisting


A programming language is no different from a normal parser:
It just translates the language's instructions into pure logic the machine can understand.
A parser does the same, instead it just does it from mere characters.



```
terminal literal [A-z]+

statement chain conditional (if: if) {
    
}

```

## Statements

### `terminal`
Represents a leaf of the parse tree.

```
terminal [fixed string or regex]
```

### `scope`
With the scope statement you create a new scope for nesting things.
Scopes make up the individual tree branches of the parse tree.

// Scopes need a start AND an end else a tree would need to be entirely linear
// TODO: Are yaml files?? 

```
scope
```

### `pattern` and `backtrack`
A sequence defines a series of things.
With this sequence you can define the specific pattern with which the things are checked with.

```
sequence []
```


### `throw`
Throw an error and exit during any stage with an appropriate error message.

```
throw [string]
```

### `warn`
Similar to `throw` but does not exit the parser.

### `wait`

### `exit`
Exits the scope 
