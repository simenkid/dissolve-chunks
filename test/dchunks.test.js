var expect = require('chai').expect,
    Dissolve = require('dissolve'),
    DChunks = require('../index.js');  // dissolve-chunks module

describe('Module Equipped Properties and Methods Check', function() {
    var dc = DChunks(),
        ru = dc.Rule();

    describe('#dc Equipped Functions', function() {
        it('.join should be a function', function () {
            expect(dc.join).to.be.a('function');
        });

        it('.compile should be a function', function () {
            expect(dc.compile).to.be.a('function');
        });
    });

    describe('#ru Equipped Functions', function() {
        it('.squash should be a function', function () {
            expect(ru.squash).to.be.a('function');
        });

        it('.clause should be a function', function () {
            expect(ru.clause).to.be.a('function');
        });

        it('.term should be a function', function () {
            expect(ru.term).to.be.a('function');
        });

        it('.buffer should be a function', function () {
            expect(ru.buffer).to.be.a('function');
        });

        it('.string should be a function', function () {
            expect(ru.string).to.be.a('function');
        });

        it('.repeat should be a function', function () {
            expect(ru.repeat).to.be.a('function');
        });

        it('.bufferPreLenUint8 should be a function', function () {
            expect(ru.bufferPreLenUint8).to.be.a('function');
        });

        it('.bufferPreLenUint16 should be a function', function () {
            expect(ru.bufferPreLenUint16).to.be.a('function');
        });

        it('.stringPreLenUint8 should be a function', function () {
            expect(ru.stringPreLenUint8).to.be.a('function');
        });

        it('.stringPreLenUint16 should be a function', function () {
            expect(ru.stringPreLenUint16).to.be.a('function');
        });
    });
});

describe('Parsing', function() {
    var dc = DChunks(),
        ru = dc.Rule();

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

    var data1_buf = new Buffer([ 0x64, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x1e, 
                                 0x06, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
                                 0x05, 0x01, 0x02, 0x03, 0x04, 0x05,
                                 0x05, 0x03, 0x49, 0x74, 0x20, 
                                       0x06, 0x6d, 0x61, 0x6b, 0x65, 0x73, 0x20,
                                       0x03, 0x6d, 0x79, 0x20,
                                       0x05, 0x6c, 0x69, 0x66, 0x65, 0x20,
                                       0x07, 0x65, 0x61, 0x73, 0x69, 0x65, 0x72, 0x2e ]);

    var chunkRules = [
        ru.uint8('x'),
        ru.stringPreLenUint8('y'),
        ru.squash('z', [ ru.uint8('z1'),
                         ru.stringPreLenUint8('z2'),
                         ru.repeat('z3', ru.uint8) ]),
        ru.repeat('m', ru.stringPreLenUint8)
    ];

    var parser = DChunks().join(chunkRules).compile();

    describe('#parser.write', function() {
        it('should have the correct parsed result', function (done) {
            parser.once('parsed', function (data) {
                expect(data1).to.eql(data);
                done();
            });
        
            parser.write(data1_buf);
        });
    });

});