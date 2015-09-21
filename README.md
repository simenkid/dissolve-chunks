Dissolve-chunks
===============

Dissolve-chunks is a declarative parser generator based on dissolve.

Overview
--------

It is quite easy to use Dissolve to parse the packed binaries into any kinds of data. Thank Dissovle for its friendly APIs and chaining methods. It really makes my life easier.


Features
--------


* Declarative

Installation
------------

Available via [npm](http://npmjs.org/):

> $ npm install dissolve-chunks


Usage
-----
Assume we have a data object valued as

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

The data1 is formmatted as

x(1) + len(1) + y(n) + z1(1) + len(1) + z2(n) + len(1) + z3(n) + len(1) + 

The buffer is
xxxxx

	var DCs = require('dissvole-chunks),
		r = DCs().Rule();
	
	var ruleChunks = [
		r.uint8('x'),
		r.stringPreLenUint8('y'),
		{
			name: 'z',
			rules: [
				r.uint8('z1'),
				r.stringPreLenUint8('z2'),
				r.repeat('z3', r.uint8),
			]
		},
		r.repeat('m', r.stringPreLenUint8)
	];
	
	var parser = DCs().join(ruleChunks).compile();

	parser.on('parsed', function (result) {
		console.log(result);
	});


Methods
-------



Join
---

`join(rule)`

 

Compile
----

`compile([option])`



Chunk Rules
---------------

First get the Rule instance:
 
``` javascript
var 
    ddsadadas

```

	var DChunks = require('dissolve-chunks);
    var rule = DChunks().Rule();

* `rule.int8(name)` - signed 8 bit integer
* `rule.sint8(name)` - signed 8 bit integer
* `rule.uint8(name)` - unsigned 8 bit integer
* `rule.int16(name)` - signed, little endian 16 bit integer
* `rule.int16le(name)` - signed, little endian 16 bit integer
* `rule.int16be(name)` - signed, big endian 16 bit integer
* `rule.sint16(name)` - signed, little endian 16 bit integer
* `rule.sint16le(name)` - signed, little endian 16 bit integer
* `rule.sint16be(name)` - signed, big endian 16 bit integer
* `rule.uint16(name)` - unsigned, little endian 16 bit integer
* `rule.uint16le(name)` - unsigned, little endian 16 bit integer
* `rule.uint16be(name)` - unsigned, big endian 16 bit integer
* `rule.int32(name)` - signed, little endian 32 bit integer
* `rule.int32le(name)` - signed, little endian 32 bit integer
* `rule.int32be(name)` - signed, big endian 32 bit integer
* `rule.sint32(name)` - signed, little endian 32 bit integer
* `rule.sint32le(name)` - signed, little endian 32 bit integer
* `rule.sint32be(name)` - signed, big endian 32 bit integer
* `rule.uint32(name)` - unsigned, little endian 32 bit integer
* `rule.uint32le(name)` - unsigned, little endian 32 bit integer
* `rule.uint32be(name)` - unsigned, big endian 32 bit integer
* `rule.int64(name)` - signed, little endian 64 bit integer
* `rule.int64le(name)` - signed, little endian 64 bit integer
* `rule.int64be(name)` - signed, big endian 64 bit integer
* `rule.sint64(name)` - signed, little endian 64 bit integer
* `rule.sint64le(name)` - signed, little endian 64 bit integer
* `rule.sint64be(name)` - signed, big endian 64 bit integer
* `rule.uint64(name)` - unsigned, little endian 64 bit integer
* `rule.uint64le(name)` - unsigned, little endian 64 bit integer
* `rule.uint64be(name)` - unsigned, big endian 64 bit integer
* `rule.floatbe(data)` - big endian 32 bit float
* `rule.floatle(data)` - little endian 32 bit float
* `rule.doublebe(data)` - big endian 64 bit double
* `rule.doublele(data)` - little endian 64 bit double
* `rule.buffer(name, length)` - little endian 64 bit double
* `rule.string(name, length)` - little endian 64 bit double
* `rule.bufferPreLenUint8(name)` - little endian 64 bit double
* `rule.bufferPreLenUint16(name)` - little endian 64 bit double
* `rule.stringPreLenUint8(name)` - little endian 64 bit double
* `rule.stringPreLenUint16(name)` - little endian 64 bit double
* `rule.term(name)` - little endian 64 bit double
* `rule.repeat(name, parFn)` - little endian 64 bit double

License
-------

MIT

Contact
-------

* GitHub ([simenkid](http://github.com/simenkid))
* Email ([simenkid@gmail.com](mailto:simenkid@mail.com))