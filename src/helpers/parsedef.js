module.exports = (definition, key) => {
    if (typeof definition === 'string') {
        return {
            '@key': key,
            'nullable': false,
            'type': definition
        };
    }

    var def = Object.assign({}, definition);

    if (def['type'] === undefined) {
        throw {
            error: true,
            code: 'definition_invalid',
            message: 'A type must be present within definition',
        }
    }

    if (def['nullable'] === undefined) {
        def['nullable'] = false;
    }

    def['@key'] = key;

    return def;
}