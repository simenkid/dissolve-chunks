# Dissolve-chunks
A declarative parser generator based on dissolve.  

[![Travis branch](https://img.shields.io/travis/simenkid/dissolve-chunks/master.svg?maxAge=2592000)](https://travis-ci.org/simenkid/dissolve-chunks)
[![npm](https://img.shields.io/npm/v/dissolve-chunks.svg?maxAge=2592000)](https://www.npmjs.com/package/dissolve-chunks)
[![npm](https://img.shields.io/npm/l/dissolve-chunks.svg?maxAge=2592000)](https://www.npmjs.com/package/dissolve-chunks)


Overview
--------

It is quite easy to use [Dissolve](https://www.npmjs.com/package/dissolve) to parse the packed binaries into any kinds of data. Thank Dissovle for its friendly APIs and chaining methods. It really makes my life easier.  

With dissolve-chunks (**DChunks**), you can make a parser by defining the parsing rules for each chunk of the binaries. This means that you need not to write your parsing codes from the beginning to the end of the binaries. You can separate the targeting data into smaller chunks, and then define the parsing rules for each of them. After all rules are ready, you can call the chainable method **join()** to sequentially connect all your rules . Finally, just call **compile()** to get your parser.  

Here is an pseudo example:  

```javascript
var chunk1_rules = [ rule1, rule2, rule3 ],
    chunk2_rules = [ rule4, squash([ rule5_1, rule5_2 ]) ],
    chunk3_rule = squash([ rule6, rule7 ]),
    chunk4_rule = rule8,
    chunk5_rule = squash('key_name', [ rule9, rule10 ]);

var parser = DChunks().join(chunk1_rules).join(chunk2_rules)
                     .join(chunk3_rule).join(chunk4_rule)
                     .join(chunk5_rule).compile();

parser.on('parsed', function (result) {
    console.log(result);
});
```

Features
--------

* Making your parser in a declarative way.  
* More manageable by cutting the targeting data into smaller chunks and defining the rules for each of them.  
* You can squash some rules into a single rule by using `squash([name,] rules)`. If `name` is specified while squashing, the **DChunks** will automatically put the parsed result under that namespace. It's handy.  
* Making a parser is mostly just about declaring rules. Integrating and compiling the parsing rules is easy.  

Installation
------------

Available via [npm](http://npmjs.org/):  

> $ npm install dissolve-chunks --save  

<br /> 

Usage
--------

### 1. The targeting binaries to parse  

<br /> 
Assume we have a `data1` object valued as  

```javascript
var data1 = {
    x: 100,
    y: 'hello',
    z: {
        z1: 30,
        z2: 'world!',
        z3: [ 1, 2, 3, 4, 5 ]
    },
    m: [ 'It ', 'makes ', 'my ', 'life ', 'easier.' ]
};
```

The `data1` is formatted in binaries according to the following table. For a string or an array, a field 'len' precedes to indicate the length of the string or array.  

    +--------+-------+-------------------------+--------------------------------------------------------------+-----------------------------------+
    |  field |   x   |            y            |                               z                              |                 m                 |
    +--------+-------+-------------------------+--------------------------------------------------------------+-----------------------------------+
    |        |       |                         |   z1  |             z2             |            z3           |                                   |
    +--------+-------+-------------------------+-------+----------------------------+-------------------------+-----------------------------------+
    | format |  x(1) | len(1) |     y(len)     | z1(1) | len(1) |      z2(len)      | len(1) |     z3(len)    | len_arr(1) | len[i](1), m[i](len) |
    +--------+-------+--------+----------------+-------+--------+-------------------+--------+----------------+------------+----------------------+
    |  type  | uint8 |  uint8 |     string     | uint8 |  uint8 |       string      |  uint8 |   uint8_array  |    uint8   |     string_array     |
    +--------+-------+--------+----------------+-------+--------+-------------------+--------+----------------+------------+----------------------+
    |  data  |  100  |    5   |     'hello'    |   30  |    6   |      'world!'     |    5   |  1, 2, 3, 4, 5 |      5     |  [ <3, 'It'>, ... ]  |
    +--------+-------+--------+----------------+-------+--------+-------------------+--------+----------------+------------+----------------------+
    |   hex  |   64  |   05   | 68 65 6c 6c 6f |   1e  |   06   | 77 6f 72 6c 64 21 |   05   | 01 02 03 04 05 |     05     |    03 49 74 20 ...   |
    +--------+-------+--------+----------------+-------+--------+-------------------+--------+----------------+------------+----------------------+

The binary packet of the data object `data1` looks like:  

```javascript
var data1_buf = new Buffer([ 0x64, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x1e, 
                             0x06, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
                             0x05, 0x01, 0x02, 0x03, 0x04, 0x05,
                             0x05, 0x03, 0x49, 0x74, 0x20, 
                                   0x06, 0x6d, 0x61, 0x6b, 0x65, 0x73, 0x20,
                                   0x03, 0x6d, 0x79, 0x20,
                                   0x05, 0x6c, 0x69, 0x66, 0x65, 0x20,
                                   0x07, 0x65, 0x61, 0x73, 0x69, 0x65, 0x72, 0x2e]);
```

Next, let's see how to make the parser for `data1_buf` by using **DChunks**.  

<br /> 

### 2. Step by Step: Delcare the rules and compile them into a parser  

This example is available here: [example01.js](https://github.com/simenkid/dissolve-chunks/blob/master/examples/example01.js).  

<br /> 

#### 2.1 Require the **dissolve-chunks** module and get the rule object  

```javascript
var DChunks = require('dissolve-chunks'),
    ru = DChunks().Rule();  // rule object provides you with many pre-installed rules
```

<br /> 

#### 2.2 Declare your rules  

* `data1_buf` is the binary packet of the data object `data1`, which is a very big chunk of data.  
* `data1` consists of many smaller data chunks, such as `data1.x`, `data1.y`, `data1.z`, and `data1.m`.  
* `data1.x` is the smallest chuck (or unit chunk), since it is typed as an `uint8` data and consumes 1 byte.  
    * To parse this simple data chunk, we can declare a rule `ru.uint8('x')` for it. Here, the parsed value will be assigned to the key `'x'`.  

* `data1.y` is a string. It is a chunk of characters. In `data1_buf`, this string is formatted with a preceding **'len'** field, an `uint8` number, to indicate the string length.  
    * We can arrange a rule `ru.stringPreLenUint8('y')` to parse it.  
* `data1.z` is another object within `data1`, and it is a data chunk of medium size. We will talk about it later.  
* `data1.m` is an array of strings. To parse an array of typed data, we can use the `repeat()` rule.  
    * In this example, `ru.repeat('m', ru.stringPreLenUint8)` means that using the `ru.stringPreLenUint` rule repeatly to parse the entries in the array and pairing the resulted array to the key `'m'`.  

<br /> 

Let's go back to `data1.z`.  

* For such a medium-size data chunk, we can use `squash('z', [ rule1, rule2, ...])` to tell the *DChunks* to squash it into a single rule and attach the parsed result of this rule to the key `'z'`. Here, `'z'` is also a namespace for **Dissolve** to know that who owns `this.vars` object.  

<br /> 

For parsing the big chunk of `data1_buf`, we can declare many smaller chunk parsing rules that are ordered in an array `chunkRules`. Let's finish the rules declaration:  

```javascript
var chunkRules = [
    ru.uint8('x'),
    ru.stringPreLenUint8('y'),
    ru.squash('z', [ ru.uint8('z1'),
                     ru.stringPreLenUint8('z2'),
                     ru.repeat('z3', ru.uint8) ]),
    ru.repeat('m', ru.stringPreLenUint8)
];
```
<br /> 

#### 2.3 Compile the parser and listen for the 'parsed' event  

* Firstly, call DChunks() to get an instance of the **DChunks**.  
* Then, call join() to let your rules get involved in the parsing process.  
* Finally, invoke compile() method to build the parser for `data1_buf`.  

```javascript
var parser = DChunks().join(chunkRules).compile();

// Listen the 'parsed' event, and the result is the parsed data after all
parser.on('parsed', function (result) {
    console.log(result);
});

// That's all! You may like trying yourself to write this parser with Dissolve.
```

<br /> 

#### 2.4 Write the binaries to the parser  

```javascript
parser.write(data1_buf);
```

<br /> 

#### 2.5 Run
> $ node example.js  

<br /> 

#### 2.6 Another Style  

You can declare your rule or array of rules separately, and join them together before doing the compilation.  

```javascript
var chunkRules1 = [ ru.uint8('x'), ru.stringPreLenUint8('y') ],
    chunkRule2 = ru.squash('z', [ ru.uint8('z1'),
                                  ru.stringPreLenUint8('z2'),
                                  ru.repeat('z3', ru.uint8) ]),
    chunkRule3 = ru.repeat('m', ru.stringPreLenUint8);


var parser = DChunks().join(chunkRules1).join(chunkRule2).join(chunkRule3).compile();
```

<br /> 

APIs
-------
### DChunks()

This returns an instance of the *dissolve-chunks*.  

### .Rule()

This method returns the [*rule object (ru)*](#Rule_Object) which is a singleton in **DChunks**. The rule object provides you with many pre-installed rules and two useful methods. You can use `ru.squash()` to combine some parsing rules into a single one, and use `ru.clause()` to define you own parsing rule.  

### .join(rules)

This chainable method allows you to concat the rules sequentially. The argument `rules` can be a single rule or an array of rules.  

### .compile([option])

After all the rules are joined in the parsing process, just invoke the method `.compile()` to get your parser. 
The option is used to control whether the parser will keep parsing binaries written to it. The default option is `{ once: false }`. If your parser only do the parsing once, you can set the attribute once to `true`.  

<br /> 
<a name="Rule_Object"></a>

Rule
---------------

To get the rule object `ru`:
 
``` javascript
var DChunks = require('dissolve-chunks'),
    ru = DChunks().Rule();
```
<br /> 

### .squash([ name, ] rules)

The `squash()` allows you to combine a series of rules into a single one. The argument `rules` can be a single rule or an array of rules.

If `name` is given, the parsed result will be assigned to a sub-namespace under the current namespace. Just try the following two examples, you will see the difference. It's intuitive.


* Example(1)
```javascript
var chunkRules = [
    ru.uint8('x'),
    ru.stringPreLenUint8('y'),

    // take off the namespace 'z'
    ru.squash([ ru.uint8('z1'),
                ru.stringPreLenUint8('z2'),
                ru.repeat('z3', ru.uint8) ]),

    ru.repeat('m', ru.stringPreLenUint8)
];
```

* Example(2)
```javascript
var chunkRules = [
    ru.uint8('x'),
    ru.stringPreLenUint8('y'),

    // put 'z2' under the namespace of 'foo'
    ru.squash('z', [ ru.uint8('z1'),
                     ru.squash('foo', ru.stringPreLenUint8('z2')),
                     ru.repeat('z3', ru.uint8) ]),

    ru.repeat('m', ru.stringPreLenUint8)
];
```

<br /> 

### .clause([ ruleName, ] ruleFn)

This method allows you to create your own parsing rule. The `ruleFn` is a function, and what you are doing in the ruleFn is just like writing a **Dissolve** thing.
Let's say we have a string that is formatted in binary with a uint32 preceding field 'len', and we can create a rule `myStringRule` for parsing such a formatted string like:

``` javascript
var myStringRule = ru.clause(function (name) {
    this.uint32('len').tap(function () {
        this.string(name, this.vars.len);
        delete this.var.len;    // we don't want the key 'len' to appear in the parsed result
    });
});

// Use the rule
var chunkRules = [ ..., myStringRule('foo_key'), ... ];
```

You can cache your rule to `ru` if you give it a `ruleName` in the argument, and then you can use the rule by getting it from `ru`. This may help when you are out of the scope with `var myStringRule` and no closure to access it. Add your rule to `ru`:

``` javascript
var myStringRule = ru.clause('lovelyString', function (name) {
    // ...
});

// Use the rule somewhere from ru
var chunkRules = [ ..., ru.lovelyString('foo_key'), ... ];
```

<br /> 

### Pre-installed rules
*Note: LE (little endian), BE (big endian)  

##### 8-bit integer
* `int8(name)`      - rule of parsing a signed 8 bit integer
* `sint8(name)`     - rule of parsing a signed 8 bit integer
* `uint8(name)`     - rule of parsing an unsigned 8 bit integer

##### 16-bit integer 
* `int16(name)`     - rule of parsing a signed, LE 16 bit integer
* `int16le(name)`   - rule of parsing a signed, LE 16 bit integer
* `int16be(name)`   - rule of parsing a signed, BE 16 bit integer
* `sint16(name)`    - rule of parsing a signed, LE 16 bit integer
* `sint16le(name)`  - rule of parsing a signed, LE 16 bit integer
* `sint16be(name)`  - rule of parsing a signed, BE 16 bit integer
* `uint16(name)`    - rule of parsing an unsigned, LE 16 bit integer
* `uint16le(name)`  - rule of parsing an unsigned, LE 16 bit integer
* `uint16be(name)`  - rule of parsing an unsigned, BE 16 bit integer

##### 32-bit integer
* `int32(name)`     - rule of parsing a signed, LE 32 bit integer
* `int32le(name)`   - rule of parsing a signed, LE 32 bit integer
* `int32be(name)`   - rule of parsing a signed, BE 32 bit integer
* `sint32(name)`    - rule of parsing a signed, LE 32 bit integer
* `sint32le(name)`  - rule of parsing a signed, LE 32 bit integer
* `sint32be(name)`  - rule of parsing a signed, BE 32 bit integer
* `uint32(name)`    - rule of parsing an unsigned, LE 32 bit integer
* `uint32le(name)`  - rule of parsing an unsigned, LE 32 bit integer
* `uint32be(name)`  - rule of parsing an unsigned, BE 32 bit integer

##### 64-bit integer
* `int64(name)`     - rule of parsing a signed, LE 64 bit integer
* `int64le(name)`   - rule of parsing a signed, LE 64 bit integer
* `int64be(name)`   - rule of parsing a signed, BE 64 bit integer
* `sint64(name)`    - rule of parsing a signed, LE 64 bit integer
* `sint64le(name)`  - rule of parsing a signed, LE 64 bit integer
* `sint64be(name)`  - rule of parsing a signed, BE 64 bit integer
* `uint64(name)`    - rule of parsing an unsigned, LE 64 bit integer
* `uint64le(name)`  - rule of parsing an unsigned, LE 64 bit integer
* `uint64be(name)`  - rule of parsing an unsigned, BE 64 bit integer

##### 32-bit float and 64-bit double
* `floatbe(name)`   - rule of parsing a BE 32 bit float
* `floatle(name)`   - rule of parsing a LE 32 bit float
* `doublebe(name)`  - rule of parsing a BE 64 bit double
* `doublele(name)`  - rule of parsing a LE 64 bit double

##### Buffer
* `buffer(name, length)`     - rule of parsing a buffer with length
* `bufferPreLenUint8(name)`  - rule of parsing a buffer with a peceding uint8 'len' field
* `bufferPreLenUint16(name)` - rule of parsing a buffer with a peceding uint16 'len' field

##### String
* `string(name, length)`     - rule of parsing a string with length
* `stringPreLenUint8(name)`  - rule of parsing a string with a peceding uint8 'len' field
* `stringPreLenUint16(name)` - rule of parsing a string with a peceding uint8 'len' field

##### Repeat
* `repeat(name, ruleFn [, times])` - rule of parsing an array by repeating the given **rule function**, e.g. `ru.uint8` (not `ru.uint8('xyz')`).
    * If the `times` is given as a *number*, then the `ruleFn` will be repeated according to the `times`.
    * If the `times` is given as a *string*, it indicates the type of the precdeing 'len' field. The `ruleFn` will be repeated according to the parsed `len` number. The argument `times` only accepts strings such as `'uint8'`, `'uint16'`, `'uint16le'`, `'uint16be'`, `'uint32'`, `'uint32le'`, `'uint32be'`, `'uint64'`, `'uint64le'`, and `'uint64be'`.
    * If `times` is absent, the `ruleFn` will be repeated according to the preceding `len` that is typed as an uint8 number. This is the default behavior of repeat().


License
-------

MIT

Contact
-------

* GitHub ([simenkid](http://github.com/simenkid))
* Email ([simenkid@gmail.com](mailto:simenkid@mail.com))
