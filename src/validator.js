// Polyfill for Object.keys.
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys

if (!Object.keys) {
    Object.keys = (function () {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function (obj) {
            if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

// Helper function for regexp, used in many instances
var testRegex = require('./helpers/regex');

// Parses a definition in "standard" (complex format)
var parseDefinition = require('./helpers/parsedef');

var types = {

    'integer': (value) => (value === parseInt(value)),

    'string': (value) => (('' + value) === value),

    'float': (value) => {
        try {
            return (value === parseFloat(value));
        } catch (e) {
            return false;
        }
    },

    'bool': (value) => (value === true || value === false),

    'array': (value) => Array.isArray(value),

    'object': (value) => (value !== null && (!Array.isArray(value) && typeof value === 'object')),

    'mixed': () => true,

    'date': (value) => {

        if (!testRegex(value, '^[0-9]{4}-[0-1][0-9]-[0-3][0-9]$')) {
            return false;
        }
        var d = new Date(value);

        if (Number.isNaN(d.getTime())) {
            return false;
        }

        return d.toISOString().slice(0, 10) === value;
    },

    'datetime': (value) => {
        if (!testRegex(value, '^[0-9]{4}-[0-1][0-9]-[0-3][0-9] [0-2][0-9]:[0-5][0-9]:[0-5][0-9]$')) {
            return false;
        }

        var d = new Date(value.replace(' ', 'T') + '.000Z');
        if (Number.isNaN(d.getTime())) {
            return false;
        }

        return d.toISOString().slice(0, 19).replace('T', ' ') === value;
    },

    // TODO: how to further validate a timestamp?
    'timestamp': (value) => value === parseInt(value),

    'unix': (value) => value === parseInt(value),

    'uuid': (value) => testRegex(value, '/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'),
};

var rules = {

    'regexp': (value, definition) => types['string'](value) && testRegex(value, definition['regexp']),

    'min': (value, definition) => {
        var m = definition['min'];
        var t = definition['type'];

        if (t === 'object') {
            return false;
        }

        if (t === 'string' || t === 'array') {
            return value && value.length >= parseInt(m);
        }

        return value >= m;
    },

    'max': (value, definition) => {
        var m = definition['max'];
        var t = definition['type'];

        if (t === 'object') {
            return false;
        }

        if (t === 'string' || t === 'array') {
            return value.length < parseInt(m);
        }

        return value < m;
    },

    'exact': (value, definition) => {
        var m = definition['exact'];
        var t = definition['type'];

        if (t === 'object') {
            return false;
        }

        if (t === 'string' || t === 'array') {
            return value && value.length === parseInt(m);
        }

        return value === m;
    },

    'alpha': (value, definition) => (definition['alpha'] ? testRegex(value, '^[a-zA-Z ]+$') : testRegex(value, '^[^a-zA-Z ]+$')),

    'alphanumeric': (value, definition) => (definition['alphanumeric'] ? testRegex(value, '^[a-zA-Z0-9- ]+$') : testRegex(value, '^[^a-zA-Z0-9- ]+$')),

    'digits': (value, definition) => (definition['digits'] ? testRegex(value, '^[0-9+-]+$') : testRegex(value, '^[^0-9+-]+$')),

    'in': (value, definition) => {
        var i;
        if (definition['type'] === 'array') {
            // all the array values should be `in`
            for (i = 0; i < value.length; i++) {
                if (definition['in'].indexOf(value[i]) < 0) {
                    return false;
                }
            }
            return true;
        } else {
            for (i = 0; i < definition['in'].length; i++) {
                if (value === definition['in'][i]) {
                    return true;
                }
            }

            return false;
        }
    },

    'not_in': (value, definition) => {
        var i;
        if (definition['type'] === 'array') {
            // all the array values should not be `in`
            for (i = 0; i < value.length; i++) {
                if (definition['not_in'].indexOf(value[i]) >= 0) {
                    return false;
                }
            }
            return true;
        } else {
            for (i = 0; i < definition['not_in'].length; i++) {
                if (value === definition['not_in'][i]) {
                    return false;
                }
            }

            return true;
        }
    },

    'required': (value, definition) => {
        if (value === undefined) {
            return false;
        }
        if (['integer', 'float', 'bool'].indexOf(definition['type']) >= 0) {
            return !value;
        } else if ('array' === definition['type']) {
            return value.length > 0;
        } else if ('object' === definition['type']) {
            return Object.keys(value).length > 0;
        }

        return !value;
    },

    '*': (value, definition) => {
        var i;
        if (definition['type'] === 'array') {
            for (i = 0; i < value.length; i++) {
                if (!validate(value[i], definition['*'], definition['@key'] + '.' + i)) {
                    return false;
                }
            }
            return true;
        } else if (definition['type'] === 'object') {
            for (i = 0; i < Object.keys(definition['*']); i++) {
                if (value[i] === undefined) {
                    return false;
                }

                if (!validate(value[i], definition['*'][i], definition['@key'] + definition['*'][i])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    },

};

function validate(value, definition, key) {

    key = key || '@base';
    var def = parseDefinition(definition, key);

    if (types[def['type']] === undefined) {
        throw {
            error: true,
            code: 'type_unknown',
            name: key,
            message: 'Unknown type: ' + def['type'] + ' for ' + key,
        };
    }

    // Nullable processing first
    if (def['nullable'] === true && value === null) {
        return true;
    }

    // Required processing next
    if (def['required'] === true) {
        if (!rules['required'].call(rules, value, def)) {
            throw {
                error: true,
                code: 'required_invalid',
                name: key,
                message: 'Required ' + key,
            };
        }
    }

    if (!types[def['type']](value)) {
        throw {
            error: true,
            code: 'type_invalid',
            name: key,
            message: value + ' is not ' + def['type'] + ' for ' + key,
        };
    }

    // We need to process the required and nullable first


    Object.keys(def).forEach(rule => {
        // We already checked the type
        if (rule !== 'type' && rule !== '@key' && rule !== 'nullable' && rule !== 'nullable' && rule !== 'required') {

            if (rules[rule] === undefined) {
                throw {
                    error: true,
                    code: 'rule_unknown',
                    name: key,
                    message: 'Unknown rule ' + rule + ' for ' + key
                };
            }

            if (rules[rule].call(rules, value, def) !== true) {
                throw {
                    error: true,
                    code: rule + '_invalid',
                    name: key,
                    message: 'Invalid value at rule ' + rule + ' for ' + key
                };
            }
        }
    });
}

module.exports = (obj, def) => {
    var fields = Object.keys(def);
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        validate(obj[field], def[field], field);
    }
    return true;
};
