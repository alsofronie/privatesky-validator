var deepCopy = function (source) {

    var cloned = source;

    if (Array.isArray(source)) {
        cloned = [];
        source.forEach(item => {
            cloned.push(deepCopy(item));
        });
    } else if (source instanceof Date) {
        cloned = new Date(source.valueOf());
    } else if (typeof (source) === 'object') {
        cloned = {};
        Object.keys(source).forEach(key => {
            cloned[key] = deepCopy(source[key]);
        });
    }

    return cloned;
};

module.exports = deepCopy;