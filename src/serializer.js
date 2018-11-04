var deepCopy = require('./helpers/deep');

var Serializer = function (schema) {
    this.schema = schema;
    this.version = '1.0.0';

    this.casts = {
        'integer': (value) => (parseInt(value)),
        'float': (value) => (parseFloat(value)),
        'bool': (value) => (!!value),
        'string': (value) => ('' + value),
    };
};

Serializer.prototype.prepare = function (value, definition, sense) {
    if (this.casts[definition.type]) {
        return this.casts[definition.type](value);
    }

    // treat separately for Date
    if (definition.type === 'date') {
        return (sense ? value.valueOf() : new Date(value));
    }

    var packed;

    if (definition.type === 'array') {
        if (definition['*'] && Array.isArray(value)) {
            packed = [];
            value.forEach(val => {
                packed.push(this.prepare(val, definition['*']));
            });
            return packed;
        }
    } else if (definition.type === 'object') {
        packed = {};
        if (definition['*'] && typeof value === 'object') {
            Object.keys(value).forEach(key => {
                packed[key] = this.prepare(value[key], definition['*']);
            });
            return packed;
        }
    }

    return deepCopy(value);
};

Serializer.prototype.pack = function (payload) {

    var cloned = {};

    var definition = this.schema.getDefinition();

    Object.keys(definition).forEach(field => {
        if (payload[field] === undefined) {
            return;
        }
        cloned[field] = this.prepare(payload[field], definition[field], true);
    });

    return JSON.stringify({
        packer: this.version,
        schema: this.schema.version,
        payload: cloned,
    });
};

Serializer.prototype.unpack = function (packed) {

    var value = JSON.parse(packed);

    if (!value.packer || !value.schema) {
        throw {
            error: true,
            code: 'package_invalid',
            name: 'unpack',
            message: 'Invalid packed supplied',
        };
    }

    if (value.packer !== this.version) {
        throw {
            error: true,
            code: 'package_version_mismatch',
            name: 'unpack',
            message: 'Packer version mismatch',
        };
    }

    if (value.schema !== this.schema.version) {
        throw {
            error: true,
            code: 'package_schema_version_mismatch',
            name: 'unpack',
            message: 'Schema version mismatch',
        };
    }

    var definition = this.schema.getDefinition();

    var cloned = {};

    Object.keys(definition).forEach(field => {
        if (value.payload[field] === undefined) {
            return;
        }
        cloned[field] = this.prepare(value.payload[field], definition[field], false);
    });

    return cloned;
};

module.exports = Serializer;
