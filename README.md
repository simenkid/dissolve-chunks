# Dissolve-chunks
A declarative parser generator based on dissolve.  

[![Travis branch](https://img.shields.io/travis/simenkid/dissolve-chunks/master.svg?maxAge=2592000)](https://travis-ci.org/simenkid/dissolve-chunks)
[![npm](https://img.shields.io/npm/v/dissolve-chunks.svg?maxAge=2592000)](https://www.npmjs.com/package/dissolve-chunks)
[![npm](https://img.shields.io/npm/l/dissolve-chunks.svg?maxAge=2592000)](https://www.npmjs.com/package/dissolve-chunks)

<br />
  
## Documentation  

Please visit the [Wiki](https://github.com/simenkid/dissolve-chunks/wiki).

<br />

## Overview  

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
  
<br />

## Features  

* Making your parser in a declarative way.  
* More manageable by cutting the targeting data into smaller chunks and defining the rules for each of them.  
* You can squash some rules into a single rule by using `squash([name,] rules)`. If `name` is specified while squashing, the **DChunks** will automatically put the parsed result under that namespace. It's handy.  
* Making a parser is mostly just about declaring rules. Integrating and compiling the parsing rules is easy.  

<br />

## Installation  

> $ npm install dissolve-chunks --save  
  
<br />

## Usage  

See [Usage](https://github.com/simenkid/dissolve-chunks/wiki#Usage) on the Wiki.  

<br />

## License  

Licensed under [MIT](https://github.com/simenkid/dissolve-chunks/blob/master/LICENSE).
