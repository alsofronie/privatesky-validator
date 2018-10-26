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

    'integer': (value) => {
        try {
            return (value === parseInt(value));
        } catch (e) {
            return false;
        }
    },

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

    'object': (value) => (value !== null && typeof value === 'object'),

    'mixed': (value) => true,

    // TODO: check for invalid dates
    'date': (value) => testRegex(value, '^[0-9]{4}-[0-3][0-9]-[0-3][0-9]$'),

    // TODO: check for invalid dates and/or times
    'datetime': (value) => testRegex(value, '^[0-9]{4}-[0-3][0-9]-[0-3][0-9]$ [0-2][0-9]:[0-5][0-9]:[0-5][0-9]$'),

    // TODO: implement this
    'timestamp': (value) => true,

    // TODO: implement this
    'uuid': (value) => true,
};

var rules = {

    'regexp': (value, definition) => types['string'](value) && testRegex(value, definition['regexp']),

    'min': (value, definition) => {
        var m = definition['min'];
        var t = definition['type'];
        if (t === 'integer') {
            return value >= m;
        } else if (t === 'string' || t === 'array') {
            return value.length >= m;
        }

        return false;
    },

    // TODO: implement this
    'max': (value, definition) => {
        var m = definition['max'];
        var t = definition['type'];
        if (t === 'integer') {
            return value < m;
        } else if (t === 'string' || t === 'array') {
            return value.length < m;
        }

        return false;
    },

    'exact': (value, definition) => (rules['min'](value, definition) && rules['max'](value, definition)),

    'alpha': (value, definition) => testRegexp(value, '[a-zA-Z ]+'),

    'alphanumeric': (value, definition) => testRegexp(value, '[a-zA-Z0-9- ]+'),

    'digits': (value, definition) => testRegexp(value, '[0-9+-]+'),

    'in': (value, definition) => {
        var i;
        for (i = 0; i < definition['in'].length; i++) {
            if (value === definition['in'][i]) {
                return true;
            }
        }

        return false;
    },

    'within': (value, definition) => {
        var i;
        for (i = 0; i < definition['in'].length; i++) {
            if (value == definition['in'][i]) {
                return true;
            }
        }

        return false;
    },

    'required': (value, definition) => {
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
            for (var i = 0; i < value.length; i++) {
                if (!validate(value[i], definition['*'], definition['@key'] + '.*')) {
                    return false;
                }
            }
        } else if (definition['type'] === 'object') {
            for (i = 0; i < Object.keys(definition['*']); i++) {
                if (value[i] === undefined) {
                    return false;
                }

                if (!validate(value[i], definition['*'][i], definition['@key'] + definition['*'][i])) {
                    return false;
                }
            }
        }
        return true;
    },

};

function validate(value, definition, key) {

    key = key || '@base';
    var def = parseDefinition(definition, key);

    if (def['nullable'] === true && value === null) {
        return true;
    }

    if (types[def['type']] === undefined) {
        throw {
            error: true,
            code: 'type_unknown',
            name: key,
            message: 'Unknown type: ' + def['type'] + ' for ' + key,
        }
    }

    if (!types[def['type']](value)) {
        throw {
            error: true,
            code: 'type_invalid',
            name: key,
            message: 'Invalid type: ' + def['type'] + ' for ' + key,
        }
    }

    var rule;
    for (var i = 0; i < Object.keys(def); i++) {
        rule = def[i];

        // We already checked the type
        if (rule !== 'type') {
            if (rules[rule] === undefined) {
                throw {
                    error: true,
                    code: 'rule_unknown',
                    name: key,
                    message: 'Unknown rule ' + rule + ' for ' + key
                }
            }

            if (!rules[rule]) {
                throw {
                    error: true,
                    code: 'invalid',
                    name: key,
                    message: 'Invalid value at rule ' + rule + ' for ' + key
                }
            }
        }
    }

    return true;
}

module.exports = validator;