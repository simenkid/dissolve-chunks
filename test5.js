var Concentrate = require('concentrate'),
    Dissolve = require('./index'),
    parserPie = Dissolve().Pie();

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

var rawObjParser = {
    //field5: ['xxx', 'ffff', 'aaa', 'pppp' ]
};

var parserPies = [
    parserPie.uint8('field1'),
    parserPie.uint8('field2'),
    parserPie.string('field3'),
    {
        name: 'field4',
        pies: [ 
            parserPie.uint8('f41'),
            parserPie.string('f42'),
            parserPie.string('f43')
        ]
    },
    parserPie.repeat('field5', parserPie.string)
];

var parser = Dissolve().compile(parserPies);

parser.on('parsed', function(x) {
    console.log(x);
});

parser.write(data);
parser.write(data);
parser.write(data);
parser.write(data);