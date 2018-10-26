module.exports = (value, rule) => {
    value = '' + value;
    var re;
    if (rule.pattern && rule.flags) {
        re = new RegExp(rule.pattern, rule.flags);
    } else {
        re = new RegExp(rule);
    }

    return re.test(value);
};
