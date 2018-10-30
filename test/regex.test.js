/* eslint-env mocha */
var assert = require('assert');
var re = require('./../src/helpers/regex');

describe('Regexp Helper Library', () => {

    describe('Errors and validation', () => {

        it('should validate the presence of regex pattern', () => {
            assert.throws(
                () => {
                    re();
                },
                (err) => {
                    return (typeof err === 'object') && err.error == true && err.code === 'pattern_invalid';
                }
            );
        });

    });

    describe('Core functionality', () => {

        it('should correctly run a regex specified inline', () => {
            var result = re('Luke Skywalker', 'Sky[^r]+r$');
            assert.equal(result, true);
        });

        it('should fail a regex specified without flags', () => {
            var result = re('Anakin Skywalker', 'sky');
            assert.equal(result, false);
        });

        it('should fail a regex specified without flags, complete form', () => {
            var result = re('Anakin Skywalker', { pattern: 'sky' });
            assert.equal(result, false);
        });

        it('should correctly run a regex specified with flags', () => {
            var result = re('Anakin Skywalker', { pattern: 'sky', flags: 'i' });
            assert.equal(result, true);
        });
    });
});