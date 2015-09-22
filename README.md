Dissolve-chunks
===============

Dissolve-chunks is a declarative parser generator based on dissolve.


Overview
--------

It is quite easy to use [Dissolve](https://www.npmjs.com/package/dissolve) to parse the packed binaries into any kinds of data. Thank Dissovle for its friendly APIs and chaining methods. It really makes my life easier.

With dissolve-chunks, you can make a parser by defining the parsing rules for each chunk of the binaries. This means that you need not to write your parsing codes from the beginning to the end of the binaries. You can seperate your targeting data into small chunks, and then define the parsing rules for each of them. After all rules are ready, you can call the chainable method **join()** to sequentially connect all your rules . Finally, just call **compile()** to get your parser.


Features
--------

* Making your parser in a declarative way
* More manageable by cutting the targeting data into small chunks and define the rules for each of them.
* Integrating and compiling the parsing rules is easy.


Installation
------------

Available via [npm](http://npmjs.org/):

> $ npm install dissolve-chunks


Usage
-----

### 1. Prepare the binaries to parse
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

The `data1` is formmatted in binaries as the following table. For a string or an array, a field 'len' precedes to indicate the length of the string or array.

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

The buffer of data1 will look like :
```javascript
<Buffer 64 05 68 65 6c 6c 6f 1e 06 77 6f 72 6c 64 21 05
        01 02 03 04 05 05 03 49 74 20 06 6d 61 6b 65 73
        20 03 6d 79 20 05 6c 69 66 65 20 07 65 61 73 69
        65 72 2e>
```
Next, let's see how to make the parser for `data1` by using dissolve-chunks.

### 2. Step by step: Delcare the rules and Compile them into a parser

This exmple is available here: [exmaple01.js](http://npmjs.org/).
#### 2.1 Require the *dissolve-chunks* module and get the rule object

```javascript
var DC = require('dissolve-chunks'),
    ru = DC().Rule();       // get the native rules
```

#### 2.2 Declare your rules

* `data1_buf` is the binary packet of the data object `data1`, which is a very big chunk of data.

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
* `data1` consists of many smaller data chunks, such as `data1.x`, `data1.y`, `data1.z`, and `data1.m`.
    * `data1.x` is the smallest chuck, since it is typed as an `uint8` data and consumes 1 byte.
    * To parse this simple chunk of data, we can declare a rule called `ru.uint('x')` for it. Here, 'x' is the key of the parsed value to pair with.
* `data1.y` is a string, i.e. a chunk of chars.
    * In `data1_buf`, this string is formatted with a preceding 'len' field, an `uint8` number, to indicate its length.
    *  We can arrange a rule called `ru.stringPreLenUint8('y')` for parsing it.
* `data1.z` is an object under `data1`, and it is a data chunk of medium size. We will talk about it later.
* `data1.m` is an array of strings.
    * To parse an array of certain type of data, we can use the `repeat()` rule.
    * In this exmaple, `ru.repeat('m', ru.stringPreLenUint8)` means that using the `ru.stringPreLenUint` rule repeatly to parse the entries in the array and pairing the resulted array to the key `'m'`.

Let's go back to `data1.z1`.

* For such a medium-szie data chunk, we can prepare a **rule object** to tell the *dissovle-chunks* to compile it as a single rule.
    * The **rule object** has 2 properties, named `name` and `rules`.
    * The value parsed by this rule will be paired to the key `'z'` given by the property `name`.
    * The property `rules` is a series of rules used to parse `data1.z`.

The rule for parsing the big chunk of `data1_buf` is declared with many smaller chunk parsing rules that are oredred in an array `data1ChunkRules`.
```javascript
var data1ChunkRules = [
    ru.uint8('x'),
    ru.stringPreLenUint8('y'),
    {
        name: 'z',
        rules: [ ru.uint8('z1'), ru.stringPreLenUint8('z2'), ru.repeat('z3', ru.uint8) ]
    },
    ru.repeat('m', ru.stringPreLenUint8)    // use repeat() to parse the strings in the array
];
```

#### 2.3 Compile the parser and listen for *'parsed'* event

* Firstly, call DC() to get an instance of the *dissolve-chunks*.
* Then, call join() to let your rules get involved in the parsing process.
* Finally, invoke compile() method to make the parser for `data1_buf`.

```javascript
var parser = DC().join(data1ChunkRules).compile();

// Listen the 'parsed' event, and the result is the parsed data after all
parser.on('parsed', function (result) {
    console.log(result);
});
```

#### 2.4 Write the binaries to the parser

```javascript
parser.write(data1_buf);
```

#### 2.5 Run
> $ node example.js


Methods
-------
There are few methods of dissolve-chunks you may use frequently.
[TODO]

### Join [TODO]

`join(rule)`

This chainable method allows you to put three types of the rule for compiling. The argument `rule` can be

* A function
    * you can join a rule function at any point
* A rule chunk of { name, rules }
    * the chunk will be
* An array of parsing rules
    * here
 

### Compile [TODO]
`compile([option])`

This chainable method allows you to put three types of the rule for compiling. The argument `rule` can be

### Rule [TODO]
`Rule()`

This chainable method allows you to put three types of the rule for compiling. The argument `rule` can be

Rules
---------------

First get the Rule instance:
 
``` javascript
var 
    ddsadadas

```

    var DChunks = require('dissolve-chunks);
    var ru = DChunks().Rule();

#### Rule().clause [TODO]
`Rule().clause([ruleName,] ruleFn)`

This chainable method allows you to put three types of the rule for compiling. The argument `rule` can be

note: LE (little endian), BE (BE)

#### 8-bit interger
* `int8(name)`      - signed 8 bit integer
* `sint8(name)`     - signed 8 bit integer
* `uint8(name)`     - unsigned 8 bit integer

#### 16-bit interger 
* `int16(name)`     - signed, LE 16 bit integer
* `int16le(name)`   - signed, LE 16 bit integer
* `int16be(name)`   - signed, BE 16 bit integer
* `sint16(name)`    - signed, LE 16 bit integer
* `sint16le(name)`  - signed, LE 16 bit integer
* `sint16be(name)`  - signed, BE 16 bit integer
* `uint16(name)`    - unsigned, LE 16 bit integer
* `uint16le(name)`  - unsigned, LE 16 bit integer
* `uint16be(name)`  - unsigned, BE 16 bit integer

#### 32-bit interger
* `int32(name)`     - signed, LE 32 bit integer
* `int32le(name)`   - signed, LE 32 bit integer
* `int32be(name)`   - signed, BE 32 bit integer
* `sint32(name)`    - signed, LE 32 bit integer
* `sint32le(name)`  - signed, LE 32 bit integer
* `sint32be(name)`  - signed, BE 32 bit integer
* `uint32(name)`    - unsigned, LE 32 bit integer
* `uint32le(name)`  - unsigned, LE 32 bit integer
* `uint32be(name)`  - unsigned, BE 32 bit integer

#### 64-bit interger
* `int64(name)`     - signed, LE 64 bit integer
* `int64le(name)`   - signed, LE 64 bit integer
* `int64be(name)`   - signed, BE 64 bit integer
* `sint64(name)`    - signed, LE 64 bit integer
* `sint64le(name)`  - signed, LE 64 bit integer
* `sint64be(name)`  - signed, BE 64 bit integer
* `uint64(name)`    - unsigned, LE 64 bit integer
* `uint64le(name)`  - unsigned, LE 64 bit integer
* `uint64be(name)`  - unsigned, BE 64 bit integer

#### 32-bit float and 64-bit double
* `floatbe(data)`   - BE 32 bit float
* `floatle(data)`   - LE 32 bit float
* `doublebe(data)`  - BE 64 bit double
* `doublele(data)`  - LE 64 bit double

#### Buffer [TODO]
* `buffer(name, length)`     - 
* `bufferPreLenUint8(name)`  - 
* `bufferPreLenUint16(name)` -

#### String [TODO]
* `string(name, length)`     - 
* `stringPreLenUint8(name)`  - 
* `stringPreLenUint16(name)` - 

#### Repeat [TODO]
* `repeat(name, parFn)` - Repeat the given parsing rule


#### Term 
* `term(name)`          - Terminate the series of the parsing rules 


License
-------

MIT

Contact
-------

* GitHub ([simenkid](http://github.com/simenkid))
* Email ([simenkid@gmail.com](mailto:simenkid@mail.com))

