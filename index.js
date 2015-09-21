var Dissolve = require('dissolve');

module.exports = function () {
    var dsv = Dissolve();

    dsv._compileChunk = function (name, chunks) {
        return function (par) {
            par.tap(name, function () {
                chunks.forEach(function (chunk, idx) {
                    if (typeof chunk === 'object') {
                        chunks[idx] = dsv._compileChunk(chunk.name, chunk.chunks);
                        chunk = chunks[idx];
                    } else if (typeof chunk !== 'function') {
                        throw new Error('chunk should be a function or a planned object.');
                    }
                    par = chunk(par);
                });
            });
            return par;
        }
    }

    dsv.compile = function (chunks) {
        chunks.push(Rule.term);

        chunks.forEach(function (chunk, idx) {
            if (typeof chunk === 'object') {
                chunks[idx] = dsv._compileChunk(chunk.name, chunk.chunks);
            } else if (typeof chunk !== 'function') {
                throw new Error('chunk should be a function or a planned object.');
            }
        });

        dsv.loop(function () {
            this.tap(function () {
                chunks.forEach(function (chunk) {
                    dsv = chunk(dsv);
                });
            }); 
        });

        dsv.on("readable", function() {
            var parsed;
            while (parsed = dsv.read()) {
                dsv.emit('parsed', parsed);
            }
        });

        return dsv;
    };

    dsv.finish = function () {

    };

    dsv.Rule = function () {
        return Rule;
    };

    return dsv;
};

var Rule = {
    clause: function (name, ruleFn) {
        Rule[name] = function (name) {

        };
    },
    int8: function (name) {
        return function (par) {
            par.int8(name);
            return par;
        };
    },
    sint8: function (name) {
        return function (par) {
            par.sint8(name);
            return par;
        };
    },
    uint8: function (name) {
        return function (par) {
            par.uint8(name);
            return par;
        };
    },
    int16: function (name) {
        return function (par) {
            par.int16(name);
            return par;
        };
    },
    int16le: function (name) {
        return function (par) {
            par.int16le(name);
            return par;
        };
    },
    int16be: function (name) {
        return function (par) {
            par.int16be(name);
            return par;
        };
    },
    sint16: function (name) {
        return function (par) {
            par.sint16(name);
            return par;
        };
    },
    sint16le: function (name) {
        return function (par) {
            par.sint16le(name);
            return par;
        };
    },
    sint16be: function (name) {
        return function (par) {
            par.sint16be(name);
            return par;
        };
    },
    uint16: function (name) {
        return function (par) {
            par.uint16(name);
            return par;
        };
    },
    uint16le: function (name) {
        return function (par) {
            par.uint16le(name);
            return par;
        };
    },
    uint16be: function (name) {
        return function (par) {
            par.uint16be(name);
            return par;
        };
    },
    int32: function (name) {
        return function (par) {
            par.int32(name);
            return par;
        };
    },
    int32le: function (name) {
        return function (par) {
            par.int32le(name);
            return par;
        };
    },
    int32be: function (name) {
        return function (par) {
            par.int32be(name);
            return par;
        };
    },
    sint32: function (name) {
        return function (par) {
            par.sint32(name);
            return par;
        };
    },
    sint32le: function (name) {
        return function (par) {
            par.sint32le(name);
            return par;
        };
    },
    sint32be: function (name) {
        return function (par) {
            par.sint32be(name);
            return par;
        };
    },
    uint32: function (name) {
        return function (par) {
            par.uint32(name);
            return par;
        };
    },
    uint32le: function (name) {
        return function (par) {
            par.uint32le(name);
            return par;
        };
    },
    uint32be: function (name) {
        return function (par) {
            par.uint32be(name);
            return par;
        };
    },
    int64: function (name) {
        return function (par) {
            par.int64(name);
            return par;
        };
    },
    int64le: function (name) {
        return function (par) {
            par.int64le(name);
            return par;
        };
    },
    int64be: function (name) {
        return function (par) {
            par.int64be(name);
            return par;
        };
    },
    sint64: function (name) {
        return function (par) {
            par.sint64(name);
            return par;
        };
    },
    sint64le: function (name) {
        return function (par) {
            par.sint64le(name);
            return par;
        };
    },
    sint64be: function (name) {
        return function (par) {
            par.sint64be(name);
            return par;
        };
    },
    uint64: function (name) {
        return function (par) {
            par.uint64(name);
            return par;
        };
    },
    uint64le: function (name) {
        return function (par) {
            par.uint64le(name);
            return par;
        };
    },
    uint64be: function (name) {
        return function (par) {
            par.uint64be(name);
            return par;
        };
    },
    floatbe: function (name) {
        return function (par) {
            par.floatbe(name);
            return par;
        };
    },
    floatle: function (name) {
        return function (par) {
            par.floatle(name);
            return par;
        };
    },
    doublebe: function (name) {
        return function (par) {
            par.doublebe(name);
            return par;
        };
    },
    doublele: function (name) {
        return function (par) {
            par.doublele(name);
            return par;
        };
    },
    buffer: function (name) {
        return function (par) {
            par.uint8('len').tap(function () {
                this.string(name, this.vars.len);
                delete this.vars.len;
            });
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
    },
    repeat: function (name, pieFn) {
        return function (par) {
            var tmpName = 'tmp',
                mapped = [],
                repeatCount = 0;

            par.tap(name, function () {
                var rpLength;
                this.uint8('len').loop('tmpArr',function (end) {
                    rpLength = this.vars.len;
                    par = pieFn(tmpName)(par);
                    repeatCount += 1;

                    if (repeatCount === rpLength) {
                        end();
                    }
                }).tap(function () {
                    delete this.vars.len;

                    this.vars.tmpArr.forEach(function (n) {
                        mapped.push(n[tmpName]);
                    });
                    this.vars = mapped;
                });
            }).tap(function () {
                this.vars[name] = mapped;
            });

            return par;
        };
    }
};