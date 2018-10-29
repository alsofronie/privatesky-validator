module.exports = (value, rule) => {
    if (!rule) {
        throw {
            error: true,
            code: 'pattern_invalid',
            message: 'The regexp rule is not specified'
        };
    }

    value = '' + value;
    var re;
    if (rule.pattern) {
        re = new RegExp(rule.pattern, (rule.flags ? rule.flags : ''));
    } else {
        re = new RegExp(rule);
    }

    return !!re.test(value);
};
