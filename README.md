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
Assume we have a data object valued as
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
The data1 is formmatted as

|  field |   x   |         y         |   z1  |          z2          |           z3           |                 m                 |
|:------:|:-----:|:-----------------:|:-----:|:--------------------:|:----------------------:|:---------------------------------:|
| format |  x(1) |   len(1), y(len)  | z1(1) |    len(1), z2(len)   |     len(1), z3(len)    | len_arr(1), [ len(1), m[i](len) ] |
|  type  | uint8 |   uint8 + string  | uint8 |    uint8 + string    |   uint8 + uint8_array  |      uint8 + [ string_array ]     |
|   raw  |  100  |    <5, 'hello'>   |   30  |     <6, 'world!'>    | <5, [ 1, 2, 3, 4, 5 ]> |      <5, [ <3, 'It'>,  ... ]>     |
|   hex  |   64  | 05 68 65 6c 6c 6f |   1e  | 06 77 6f 72 6c 64 21 |    05 01 02 03 04 05   |         05 03 49 74 20 ...        |

The buffer of the binaries is

    <Buffer 64 05 68 65 6c 6c 6f 1e 06 77 6f 72 6c 64 21 05
            01 02 03 04 05 05 03 49 74 20 06 6d 61 6b 65 73
            20 03 6d 79 20 05 6c 69 66 65 20 07 65 61 73 69
            65 72 2e>

Let's see how to make the parser for data1 by using dissolve-chunks:

```javascript
var DC = require('dissolve-chunks'),
    ru = DC().Rule();		// get the native rules

/***************************************************
 * Delcare your rules
 * 
 *     data1.z is an object(a bigger chunk of data), 
 *     you can declare the rule by { name, rules } for this chunk.
 *     In this way, the parsed result of this chunk will be put
 *     under the namespace of the given name (say, 'z' here)
 */
var chunkRules = [
	ru.uint8('x'),
    ru.stringPreLenUint8('y'),
    {
        name: 'z',
        rules: [ ru.uint8('z1'), ru.stringPreLenUint8('z2'), ru.repeat('z3', ru.uint8) ]
    },
    ru.repeat('m', ru.stringPreLenUint8)	// use repeat() to parse the strings in the array
];

/***************************************************
 * Compile the parser
 * 
 *     1. call DC() to get an instance of Dissolve
 *     2. call join() to let your rules get involved
 *     3. finally invoke compile() to get the parser for data1
 */
var parser = DC().join(chunkRules).compile();

// Listen the 'parsed' event, and the result is the parsed data after all
parser.on('parsed', function (result) {
    console.log(result);
});

```

Methods
-------
There are few methods of dissolve-chunks you may use frequently.

###Join

`join(rule)`

This chainable method allows you to put three types of the rule for compiling. The argument `rule` can be

* A function
    * you can join a rule function at any point
* A rule chunk of { name, rules }
    * the chunk will be
* An array of parsing rules
    * here
 

###Compile
`compile([option])`

This chainable method allows you to put three types of the rule for compiling. The argument `rule` can be

###Rule
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

###Rule().clause
`Rule().clause([ruleName,] ruleFn)`

This chainable method allows you to put three types of the rule for compiling. The argument `rule` can be

note: LE (little endian), BE (BE)

### 8-bit interger

* `int8(name)`      - signed 8 bit integer
* `sint8(name)`     - signed 8 bit integer
* `uint8(name)`     - unsigned 8 bit integer

###16-bit interger
* `int16(name)`     - signed, LE 16 bit integer
* `int16le(name)`   - signed, LE 16 bit integer
* `int16be(name)`   - signed, BE 16 bit integer
* `sint16(name)`    - signed, LE 16 bit integer
* `sint16le(name)`  - signed, LE 16 bit integer
* `sint16be(name)`  - signed, BE 16 bit integer
* `uint16(name)`    - unsigned, LE 16 bit integer
* `uint16le(name)`  - unsigned, LE 16 bit integer
* `uint16be(name)`  - unsigned, BE 16 bit integer

###32-bit interger
* `int32(name)`     - signed, LE 32 bit integer
* `int32le(name)`   - signed, LE 32 bit integer
* `int32be(name)`   - signed, BE 32 bit integer
* `sint32(name)`    - signed, LE 32 bit integer
* `sint32le(name)`  - signed, LE 32 bit integer
* `sint32be(name)`  - signed, BE 32 bit integer
* `uint32(name)`    - unsigned, LE 32 bit integer
* `uint32le(name)`  - unsigned, LE 32 bit integer
* `uint32be(name)`  - unsigned, BE 32 bit integer

###64-bit interger
* `int64(name)`     - signed, LE 64 bit integer
* `int64le(name)`   - signed, LE 64 bit integer
* `int64be(name)`   - signed, BE 64 bit integer
* `sint64(name)`    - signed, LE 64 bit integer
* `sint64le(name)`  - signed, LE 64 bit integer
* `sint64be(name)`  - signed, BE 64 bit integer
* `uint64(name)`    - unsigned, LE 64 bit integer
* `uint64le(name)`  - unsigned, LE 64 bit integer
* `uint64be(name)`  - unsigned, BE 64 bit integer

###32-bit float and 64-bit double
* `floatbe(data)`   - BE 32 bit float
* `floatle(data)`   - LE 32 bit float
* `doublebe(data)`  - BE 64 bit double
* `doublele(data)`  - LE 64 bit double

###Buffer
* `buffer(name, length)`     - LE 64 bit double
* `bufferPreLenUint8(name)`  - LE 64 bit double
* `bufferPreLenUint16(name)` - LE 64 bit double

###String
* `string(name, length)`     - LE 64 bit double
* `stringPreLenUint8(name)`  - LE 64 bit double
* `stringPreLenUint16(name)` - LE 64 bit double

###Repeat
* `repeat(name, parFn)` - Repeat the given parsing rule


###Term
* `term(name)`          - Terminate the parsing


License
-------

MIT

Contact
-------

* GitHub ([simenkid](http://github.com/simenkid))
* Email ([simenkid@gmail.com](mailto:simenkid@mail.com))

