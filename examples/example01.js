var DChunks = require('../index'),
    ru = DChunks().Rule();

var data1 = [
    0x64,  // x
    0x05,  // length of y
    0x68, 0x65, 0x6c, 0x6c, 0x6f,          // y
    0x1e,  // z1
    0x06,  // length of z2
    0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,    // z2
    0x05,  // length of z3
    0x01, 0x02, 0x03, 0x04, 0x05,          // z3
    0x05,  // length of m
    0x03,  // length of m[0]
    0x49, 0x74, 0x20,          // m[0]
    0x06,  // length of m[1]
    0x6d, 0x61, 0x6b, 0x65, 0x73, 0x20,
    0x03,
    0x6d, 0x79, 0x20,
    0x05,
    0x6c, 0x69, 0x66, 0x65, 0x20,
    0x07,
    0x65, 0x61, 0x73, 0x69, 0x65, 0x72, 0x2e
];

var data1_buf = new Buffer(data1);

var chunkRules = [
    ru.squash([ru.uint8('x'), ru.stringPreLenUint8('y')]),
    ru.squash('z', [ ru.uint8('z1'), ru.stringPreLenUint8('z2'), ru.repeat('z3', ru.uint8) ]),
    ru.repeat('m', ru.stringPreLenUint8)
];

var parser = DChunks().join(chunkRules).compile();

parser.on('parsed', function (result) {
    console.log(result);
});

parser.write(data1_buf);