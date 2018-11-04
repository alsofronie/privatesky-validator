var rex = require('./helpers/regex');
var parse = require('./helpers/normalize-def');

var Schema = function (definition) {

    this.definition = definition || {};

    this.version = '1.0.0';

    this.types = {
        'integer': (value) => (value === parseInt(value)),
        'string': (value) => (('' + value) === value),
        'float': (value) => (!Number.isNaN(parseFloat(value)) && value === parseFloat(value)),
        'bool': (value) => (value === true || value === false),
        'array': (value) => Array.isArray(value),
        'object': (value) => (value !== null && (!Array.isArray(value) && typeof value === 'object')),
        'mixed': () => true,
        'date': (value) => (value && typeof value.getMonth === 'function'),
        'iso_date': (value) => (this.types.iso_date_short(value) || this.types.iso_date_long(value)),
        'iso_date_short': (value) => {
            if (!rex(value, '^[0-9]{4}-[0-1][0-9]-[0-3][0-9]$')) {
                return false;
            }
            var d = new Date(value);

            if (Number.isNaN(d.getTime())) {
                return false;
            }

            return d.toISOString().slice(0, 10) === value;
        },
        'iso_date_long': (value) => {
            if (!rex(value, '^[0-9]{4}-[0-1][0-9]-[0-3][0-9] [0-2][0-9]:[0-5][0-9]:[0-5][0-9]$')) {
                return false;
            }

            var d = new Date(value.replace(' ', 'T') + '.000Z');
            if (Number.isNaN(d.getTime())) {
                return false;
            }

            return d.toISOString().slice(0, 19).replace('T', ' ') === value;
        },
        'uuid': (value) => rex(value, '/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'),
    };

    this.rules = {
        'regexp': (value, definition) => (this.types['string'](value) && rex(value, definition['regexp'])),
        'min': (value, definition) => (value >= definition['min']),
        'min:object': () => false,
        'min:string': (value, definition) => (value.length >= definition.min),
        'min:array': (value, definition) => (value.length >= definition.min),
        'min:date': (value, definition) => (value.valueOf() >= new Date(definition['min']).valueOf()),
        'max': (value, definition) => (value <= definition.max),
        'max:object': () => false,
        'max:string': (value, definition) => (value.length <= definition.max),
        'max:array': (value, definition) => (value.length <= definition.max),
        'max:date': (value, definition) => (value.valueOf() <= new Date(definition['min']).valueOf()),
        'exact': (value, definition) => (value === definition['exact']),
        'exact:object': () => false,
        'exact:string': (value, definition) => (value.length === definition.exact),
        'exact:array': (value, definition) => (value.length === definition.exact),
        'exact:date': (value, definition) => ((new Date(value)).valueOf() === new Date(definition['exact']).valueOf()),
        'alpha': (value, definition) => (definition['alpha'] ? rex(value, '^[a-zA-Z ]+$') : rex(value, '^[^a-zA-Z ]+$')),
        'alphanumeric': (value, definition) => (definition['alphanumeric'] ? rex(value, '^[a-zA-Z0-9- ]+$') : rex(value, '^[^a-zA-Z0-9- ]+$')),
        'digits': (value, definition) => (definition['digits'] ? rex(value, '^[0-9+-]+$') : rex(value, '^[^0-9+-]+$')),
        'in': (value, definition) => (definition['in'].indexOf(value) >= 0),
        'in:array': (value, definition) => (!value.find(v => definition.in.indexOf(v) < 0)),
        'not_in': (value, definition) => (definition['not_in'].indexOf(value) < 0),
        'not_in:array': (value, definition) => (!value.find(v => definition.not_in.indexOf(v) >= 0)),
        'required': (value) => (!!value),
        'required:integer': (value) => (!value),
        'required:float': (value) => (!value),
        'required:bool': (value) => (value === true || value === false),
        'required:array': (value) => (value && value.length > 0),
        'required:object': (value) => (value && Object.keys(value).length > 0),

        '*': () => false,
        '*:array': (value, definition) => (value.forEach((v, i) => this.check(v, definition['*'], definition['@key'] + '.' + i)) || true),
        '*:object': (value, definition) => (Object.keys(definition['*']).forEach(r => this.check(value[r], definition['*'][r], definition['@key'] + '.' + r)) || true),
    };
};

Schema.prototype.setDefinition = function (definition) {
    this.definition = definition;
};

Schema.prototype.getDefinition = function () {
    var cloned = {};
    Object.keys(this.definition).forEach(field => {
        cloned[field] = parse(this.definition[field], field);
    });
    return cloned;
};

Schema.prototype.register = function (name, callback) {
    this.types[name] = callback;
};

Schema.prototype.extend = function (name, callback) {
    this.rules[name] = callback;
};

Schema.prototype.check = function (value, definition, key) {

    key = key || '@base';
    var def = parse(definition, key);

    if (this.types[def.type] === undefined) {
        throw {
            error: true,
            code: 'type_unknown',
            name: key,
            message: 'Unknown type: ' + def['type'] + ' for ' + key,
        };
    }

    var type = def.type;

    // Nullable processing first
    if (def.nullable === true && value === null) {
        return true;
    }

    // Required processing next
    if (def.required && !this.rules.required(value, def, this)) {
        throw {
            error: true,
            code: 'required_invalid',
            name: key,
            message: 'Required ' + key,
        };
    } else if (!def.required && value === undefined) {
        return true;
    }

    if (!this.types[type](value, this)) {
        throw {
            error: true,
            code: 'type_invalid',
            name: key,
            message: value + ' is not ' + type + ' for ' + key,
        };
    }

    Object.keys(def).forEach(chk => {
        // We already checked the things 
        if (['type', '@key', 'nullable', 'required'].indexOf(chk) < 0) {
            var rule = chk;
            if (this.rules[chk + ':' + type] !== undefined) {
                rule = chk + ':' + type;
            }

            if (this.rules[rule] === undefined) {
                throw {
                    error: true,
                    code: 'rule_unknown',
                    name: key,
                    message: 'Unknown rule ' + rule + ' for ' + key
                };
            }

            if (this.rules[rule](value, def, this) !== true) {
                throw {
                    error: true,
                    code: chk + '_invalid',
                    name: key,
                    message: 'Invalid value at rule ' + chk + ' (' + rule + ')' + ' for ' + key
                };
            }
        }
    });

    return true;
};

Schema.prototype.validate = function (obj) {
    if (!this.definition) {
        throw {
            error: true,
            code: 'definition_invalid',
            name: '',
            message: 'Invalid or empty definition',
        };
    }

    Object.keys(this.definition).forEach(field => this.check(obj[field], this.definition[field], field));
    return true;
};

module.exports = Schema;
