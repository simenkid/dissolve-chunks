var Concentrate = require('concentrate'),
    Dissolve = require('dissolve');

var rawObj = {
    field1: 100,
    field2: 200,
    field3: '300',
    field4: {
        f41: 1,
        f42: 'f42',
        f43: 'hello world!'
    },
    //field5: ['xxx', 'ffff', 'aaa', 'pppp' ]
};

var data = Concentrate().uint8(rawObj.field1).uint8(rawObj.field2)
                        .uint8(rawObj.field3.length)
                        .string(rawObj.field3, 'utf8')
                        .uint8(rawObj.field4.f41)
                        .uint8(rawObj.field4.f42.length)
                        .string(rawObj.field4.f42, 'utf8')
                        .uint8(rawObj.field4.f43.length)
                        .string(rawObj.field4.f43, 'utf8');
/*                        .uint8(rawObj.field5.length)
                        .uint8(rawObj.field5[0].length)
                        .string(rawObj.field5[0], 'utf8')
                        .uint8(rawObj.field5[1].length)
                        .string(rawObj.field5[1], 'utf8')
                        .uint8(rawObj.field5[2].length)
                        .string(rawObj.field5[2], 'utf8')
                        .uint8(rawObj.field5[3].length)
                        .string(rawObj.field5[3], 'utf8');*/
data = data.result();

//console.log(data.length);

var parserPie = {
    uint8: function (name) {
        return function (par) {
            par.uint8(name);
            return par;
        };
    },
    string: function (name) {
        return function (par) {
            par.uint8('len').tap(function () {
                this.string(name, this.vars.len);
                delete this.vars.len;
            });
            return par;
        };
    },
    term: function (par) {
        par.tap(function () {
            this.push(this.vars);
            this.vars = {};
        }); 
        return par;
    }
};


var rawObjParser = {
    field1: parserPie.uint8('field1'),
    field2: parserPie.uint8('field2'),
    field3: parserPie.string('field3'),
    field4: {
        f41: parserPie.uint8('f41'),
        f42: parserPie.string('f42'),
        f43: parserPie.string('f43')
    },
    //field5: ['xxx', 'ffff', 'aaa', 'pppp' ]
};

//var rawObjParseOrder = ['field1', 'field2', 'field3', 'field4'];

function pieCompile(name, pies) {
    return function (par) {
        par.tap(name, function () {
            pies.forEach(function (pie) {
                par = pie(par);
            });
        });
        return par;
    }
}

function compile(parser, pies) {
    parser.loop(function () {
        this.tap(function () {
            pies.forEach(function (pie) {
                parser = pie(parser);
            });
        }); 
    });

    return parser;
}

var count = 0;
var field4Par = pieCompile('field4', [ parserPie.uint8('f41'), parserPie.string('f42'), parserPie.string('f43') ]);
rawObjParser.field4 = field4Par;

var myPies = [ parserPie.uint8('field1'), parserPie.uint8('field2'), parserPie.string('field3'), field4Par, parserPie.term ];


var parser = Dissolve();
parser = compile(parser, myPies);

parser.on('readable', function() {
    var e;
    while (e = parser.read()) {
        console.log(e);
    }
});

parser.write(data);
parser.write(data);
parser.write(data);
parser.write(data);