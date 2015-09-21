var Dissolve = require('dissolve');

module.exports = function () {
    var dsv = Dissolve(),
        _chunks = [],
        compiled = false;

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

    dsv.join = function (chunks) {
        if (typeof chunks === 'function') {
            chunks = [ Rule.clause(chunks) ];
        }

        chunks.forEach(function (chunk, idx) {
            if (typeof chunk === 'object') {
                chunks[idx] = dsv._compileChunk(chunk.name, chunk.chunks);
                chunk = chunks[idx];
            } else if (typeof chunk !== 'function') {
                throw new Error('chunk should be a function or a planned object.');
            }

            _chunks.push(chunk);
        });

        return dsv;
    };

    dsv.compile = function (config) {
        var config = config || { once: false };

        if (compiled) {
            throw new Error('The parser has been compiled.');
        }

        _chunks.push(Rule.term);

        _chunks.forEach(function (chunk, idx) {
            if (typeof chunk === 'object') {
                _chunks[idx] = dsv._compileChunk(chunk.name, chunk.chunks);
            } else if (typeof chunk !== 'function') {
                throw new Error('chunk should be a function or a planned object.');
            }
        });

        if (config.once) {
            dsv.tap(function () {
                _chunks.forEach(function (chunk) {
                    dsv = chunk(dsv);
                });
            }); 

            dsv.once("readable", function() {
                var parsed;
                while (parsed = dsv.read()) {
                    dsv.emit('parsed', parsed);
                }
            });
        } else {
            dsv.loop(function () {
                this.tap(function () {
                    _chunks.forEach(function (chunk) {
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
        }
        compiled = true;
        return dsv;
    };

    dsv.Rule = function () {
        return Rule;
    };

    return dsv;
};

var Rule = {
    clause: function (ruleName, ruleFn) {
        var theRule;

        if (typeof ruleName === 'function') {
            ruleFn = ruleName;
            ruleName = null;
        }

        theRule = function (name) {
            return function (par) {
                ruleFn = ruleFn.bind(par);
                ruleFn(name);
                return par;
            };
        };

        if (ruleName) {
            Rule[ruleName] = theRule;
        }
        return theRule;
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
    buffer: function (name, length) {
        return function (par) {
            par.string(name, length);
            return par;
        };
    },
    string: function (name, length) {
        return function (par) {
            par.string(name, length);
            return par;
        };
    },
    bufferPreLenUint8: function (name) {
        return function (par) {
            par.uint8('len').tap(function () {
                this.string(name, this.vars.len);
                delete this.vars.len;
            });
            return par;
        };
    },
    bufferPreLenUint16: function (name) {
        return function (par) {
            par.uint16('len').tap(function () {
                this.string(name, this.vars.len);
                delete this.vars.len;
            });
            return par;
        };
    },
    stringPreLenUint8: function (name) {
        return function (par) {
            par.uint8('len').tap(function () {
                this.string(name, this.vars.len);
                delete this.vars.len;
            });
            return par;
        };
    },
    stringPreLenUint16: function (name) {
        return function (par) {
            par.uint16('len').tap(function () {
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
    repeat: function (name, parFn) {
        return function (par) {
            var tmpName = 'tmp',
                mapped = [],
                repeatCount = 0;

            par.tap(name, function () {
                var rpLength;
                this.uint8('len').loop('tmpArr',function (end) {
                    rpLength = this.vars.len;
                    par = parFn(tmpName)(par);
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