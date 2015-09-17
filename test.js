var Concentrate = require('concentrate'),
    Dissolver = require('./index.js');

var rawObj = {
    field1: 100,
    field2: 200,
    field3: '300',
    field4: {
        f41: 1,
        f42: 'f42',
        f43: 'hello world!'
    },
    field5: ['xxx', 'ffff', 'aaa', 'pppp' ]
};

var data = Concentrate().uint8(rawObj.field1).uint8(rawObj.field2)
                        .uint8(rawObj.field3.length)
                        .string(rawObj.field3, 'utf8')
                        .uint8(rawObj.field4.f41)
                        .uint8(rawObj.field4.f42.length)
                        .string(rawObj.field4.f42, 'utf8')
                        .uint8(rawObj.field4.f43.length)
                        .string(rawObj.field4.f43, 'utf8')
                        .uint8(rawObj.field5.length)
                        .uint8(rawObj.field5[0].length)
                        .string(rawObj.field5[0], 'utf8')
                        .uint8(rawObj.field5[1].length)
                        .string(rawObj.field5[1], 'utf8')
                        .uint8(rawObj.field5[2].length)
                        .string(rawObj.field5[2], 'utf8')
                        .uint8(rawObj.field5[3].length)
                        .string(rawObj.field5[3], 'utf8');
data = data.result();


var parser1 = Dissolver().uint8('field1').uint8('field2');

var parser2 = Dissolver().uint8('len').tap(function () {
    this.string('field3', this.vars.len);
    delete this.vars.len;
});

var parser3 = Dissolver().tap('field4', function () {
    this.uint8('f41').uint8('len').tap(function () {
        this.string('f42', this.vars.len);
        delete this.vars.len;
    }).uint8('len').tap(function () {
        this.string('f43', this.vars.len);
        delete this.vars.len;
    });
});

var parser4 = Dissolver().uint8('len').tap(function () {
    var x = this.vars.len;

    this.loop('field5', function (end) {
        this.uint8('len').tap(function () {
            x--;
            this.string('xxx', this.vars.len);

            delete this.vars.len;
            if (!x) {
                end();
            }
        });
        //end();
    }).tap(function () {
        var temp = [];
        this.vars.field5.forEach(function(n) {
             temp.push(n.xxx);
        });
        this.vars.field5 = temp;
    });

    delete this.vars.len;
});



//function getParser() {
    var bigParser = Dissolver();

    bigParser.engage(parser1).tap(function () {
        this.engage(parser2);
    }).tap(function () {
        this.engage(parser3).engage(parser4);
    }).terminate();

    /*bigParser.on('parsed', function (parsed) {
        console.log(parsed);
    });*/

    bigParser.on('data', function (x) {
        console.log('READ');
        console.log(x);
/*
        var e;
        while (e = bigParser.read()) {
            console.log(e);
        }*/
    });
 //     return bigParser;
 // }

setInterval(function () {
    //console.log(data);
    //        console.log(bigParser);

/*    console.log(bigParser);*/
    bigParser.write(data);
    //console.log();
}, 1500);
