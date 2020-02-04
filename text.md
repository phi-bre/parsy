... / \n\w/;
:: value;

boolean: "true" | "false";
number: /(\d+)?\.?\d+/;
string: /"(.*?)"/;
null: "null";

value: boolean | number | string | null;
property: string:key ":" value;
object: "{" ((property ",")* property)? "}";
array: "[" ((value ",")* value)? "]";



//////

/// Types
// boolean          int  float   string  function    object  pointer
// true or false    10   10.0    'test'  () {}       {}      :type
//

value: '' // Inferred as string
value: string // Type declaration as string with 'null' as value

test: {
    property: 'value';
    as string: .property;
}

test: () -> {
    property: 'test'
}

test: () {
    value: number
    function: () {
        local: string + local
        assert (value) {
            return { local: local, value: value }
        } else {
            return { local }
        }
    }
    
    var = 0
    value = var * 10 + value
}

person: [firstname: string] { 
    eat: { /* Do some shit */ }
    firstname: firstname
    lastname: string
    fullname: { firstname + ' ' + lastname }
    fullname: firstname + ' ' + lastname
    parent: person
    
    
    as string: { fullname }
}

peter: person ['Peter'] { asd }

peter.eat

# Value
There are only objects

Initializing:
```
// Declaring
value: 10

// Assigning
value = 20

// Redeclaration with different type does not work
value: '20' // Error

// Types at declaration are fixed 

// Objects are functions and so are 'primitive' values
value: 10
value: { 10 }
value: () { 10 }
value: () {
    return 10
}

value 10 20 {  }

if 10 == true {
    
}

// If a function's body only has one expression inside it, it is used as the return value

```

```

strings: ''
numbers: 10.0
integers: 10
booleans: true

objects: {
    property: {}
}

functions: () {
    
}


```

# Arrays
```
['asd', 0, true] // type: [string, number, boolean]

array: [...[...string]]
array: string[12][10]
array: 

```

# Ranges
```
fixed: 0...10
left: ...10
right: 10...


```

# Loops
```
for (index of 0..100) {
    
}
```

# Error handling
If an error gets thrown inside a block it will jump to the next catch block in the sequence:

```
function: {
    for (asd) {
        io.read ('')
    } catch (error) {
    
    }
    
    io.read ('') catch {
    
    }
}
```

# Unions
There are no classes just objects, so you can mix multiple objects into one with unions.

```
animal: (name: string) {
    name: name
}

person: (color: string) {
    animal ('Person') & {
        
    }
}
```

# Signatures
Objects have type signatures. A signature is the primitive type behind the object. 
```
var: 10 // signature: number
var: { 10 } // signature: number

var: { // signature: number
    property: 'whatever'
    
}

var: { } // signature: object
var: { // signature: object
    property: 'whatever'
}
```

for (index in 0...10) {
    
}

# Destructuring
```
func: (name: animal & {  }) {
    
}
```


if: (condition: boolean, block: function) {}

if (true) {

} else if () {

}

value: Person


test.function: (param: string, param2: 'dflt') {

}

func: { (params)
    
}

test.value == 0
:test.function == function // true
test.function == {} // true

dog: animal {

}

if true == true {
    // block
}


template test(props: object) {
    attrib: true
    id: 'abc'
    
    div {
    
    }
}




```philang

```


struct test

test.awd = 'awd';
test.adfdsa = 'awd';
other(test)



test.awd = 'awdawdawad';


include other

person: (firstname: string, lastname: string) {
    firstname: firstname
    lastname: lastname
    fullname: firstname + ' ' + lastname
    eat: () {
        test.awd='asdfghj'
        
        banane.awd();
    }
}

person().eat()


function Person() {
    this.firstname
}

asdsd (10)

asdsd: (num: { number }) {
    num() -> 10
}

string local = ''
animal({name: 'awd'});


statement if (condition: boolean, block: {}, ...chain: []) {
    [native code]
}

statement map (array: [], block: {}) {
    for () {
        
    }
}

iterator: (array: []) {
    index: 0
    next: { unless (done) array[index++] }
    done: { index >= array.length }
}

goblin in (left: index, right: range) {
    iterator: iterator (right) (left) {} {} catch {}
}

define operator in with left as index and right as range do
    define index as number
    for index in range do
        print index with no exception


[].map(item => ({size: item.size});

map (item in ) { size: item.size }

map [] (item) { size: item.size }



for (index in 1...10) {
    
}



define animal (name: string) {
    name: name
    .hidden: 'asd'
}

dog: animal ('')


object: ( test: string )



operator + left: vector, right: vector): vector  {
    left.x += right.x
    left.y += right.y
    return left
}



channel window {
    click: (event: event) {
        
    }
}

window.onclick

window on {
    click: (event: event) {
        
    }
}

route: (url: string) {
    
}

route ('/index.html') {
    
}


# Tuples
const tuple = (public: 'a', 0, 10)
const array = []
const object = () {
    name: { name }
    (): {
        
    }
}

object.name = 'peter' // nope
object.name 

identifiable: { id: string }
statement div (attributes: identifiable & {}, children: element[]>) {
    
}

div (id: 'abc') {
    for () div {
        
    }
}


void test (const int *i) {
    (*i) = 5;
}

void main() {
    int i = 10;
    test(&i);
    
    [&]() -> {
        i = 5;
    }()
    
    print(i)
}


chain
grouping ( )
grouping scope { }
define


statement function (name: string, ) '
function {{ name }}() {
    {{ }}
}
'

terminal literal 

group string ('\'', '\'') (input: string) {
    :'"' + input.replace ('{', '" + ') + input.replace ('}', ' + "')
}

group string " "
sequence 

scope asd [
    
]








