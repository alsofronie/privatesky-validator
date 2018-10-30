module.exports = (definition, key) => {

    if (!key) {
        throw {
            error: true,
            code: 'key_invalid',
            message: 'Invalid call to definition parser, no key supplied'
        };
    }

    var def = {};
    if (typeof definition === 'string') {
        def = {
            '@key': key,
            'nullable': false,
            'type': definition
        };
    } else {
        def = Object.assign({}, definition);
    }

    if (!def['type']) {
        throw {
            error: true,
            code: 'definition_invalid',
            message: 'A type must be present within definition',
        };
    }

    def['@key'] = key;

    if (def['nullable'] === undefined) {
        def['nullable'] = false;
    }

    return def;
};
