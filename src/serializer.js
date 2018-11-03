var defaultOptions = {
    validateOnPack: true,
    validateOnUnpack: true,
};

var Serializer = function (schema, options) {
    this.schema = schema;
    this.options = Object.assign(defaultOptions, options);
};

Serializer.prototype.setOptions = function (options) {
    this.options = Object.assign(defaultOptions, options);
};

Serializer.prototype.pack = function (payload, options) {
    if (options) {
        this.setOptions(options);
    }

    // prepareForPack

    if (this.options.validateOnPack) {
        this.schema.validate(payload);
    }

    return JSON.stringify(payload);
};

Serializer.prototype.unpack = function (packed, options) {
    if (options) {
        this.setOptions(options);
    }
    var value = JSON.parse(packed);
    if (this.options.validateOnUnpack) {
        this.schema.validate(value);
    }

    return value;
};

module.exports = Serializer;
