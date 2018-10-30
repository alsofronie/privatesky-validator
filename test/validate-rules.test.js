/* eslint-env mocha */
var assert = require('assert');
var validator = require('../src/validator');

describe('Validating rules', () => {

    describe('Rule: Min', () => {

        it('should pass for bigger integer value', () => {
            assert.equal(validator({ age: 18 }, { age: { type: 'integer', min: 17 } }), true);
        });

        it('should pass for equal integer value', () => {
            assert.equal(validator({ age: 18 }, { age: { type: 'integer', min: 18 } }), true);
        });

        it('should fail for invalid integer', () => {
            assert.throws(
                () => validator({ age: 18 }, { age: { type: 'integer', min: 19 } }),
                (err) => err.code === 'min_invalid'
            );
        });

        it('should pass for bigger float value', () => {
            assert.equal(validator({ age: 18.0 }, { age: { type: 'float', min: 17.99 } }), true);
        });

        it('should pass for equal float value', () => {
            assert.equal(validator({ age: 18.123 }, { age: { type: 'float', min: 18.123 } }), true);
        });

        it('should fail for invalid float', () => {
            assert.throws(
                () => validator({ age: 18.123 }, { age: { type: 'float', min: 18.124 } }),
                (err) => err.code === 'min_invalid'
            );
        });

        it('should pass for bigger string length', () => {
            assert.equal(validator({ name: 'Albert Einstein' }, { name: { type: 'string', min: 14 } }), true);
        });

        it('should pass for equal string length', () => {
            assert.equal(validator({ name: 'Albert Einstein' }, { name: { type: 'string', min: 15 } }), true);
        });

        it('should fail for invalid string length', () => {
            assert.throws(
                () => validator({ name: 'Albert Einstein' }, { name: { type: 'string', min: 16 } }),
                (err) => err.code === 'min_invalid'
            );
        });

        it('should fail for empty string', () => {
            assert.throws(
                () => validator({ name: '' }, { name: { type: 'string', min: 16 } }),
                (err) => err.code === 'min_invalid'
            );
        });

        it('should pass for bigger array length', () => {
            assert.equal(validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', min: 3 } }), true);
        });

        it('should pass for equal array length', () => {
            assert.equal(validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', min: 4 } }), true);
        });

        it('should fail for invalid array length', () => {
            assert.throws(
                () => validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', min: 5 } }),
                (err) => err.code === 'min_invalid'
            );
        });

        it('should fail for empty array', () => {
            assert.throws(
                () => validator({ options: [] }, { options: { type: 'array', min: 16 } }),
                (err) => err.code === 'min_invalid'
            );
        });

    });

    describe('Rule: Max', () => {

        it('should pass for smaller integer value', () => {
            assert.equal(validator({ age: 18 }, { age: { type: 'integer', max: 19 } }), true);
        });

        it('should fail for equal integer value', () => {
            assert.throws(
                () => validator({ age: 18 }, { age: { type: 'integer', max: 18 } }),
                (err) => err.code === 'max_invalid'
            );
        });

        it('should fail for invalid integer', () => {
            assert.throws(
                () => validator({ age: 18 }, { age: { type: 'integer', max: 17 } }),
                (err) => err.code === 'max_invalid'
            );
        });

        it('should pass for smaller string length', () => {
            assert.equal(validator({ name: 'Albert Einstein' }, { name: { type: 'string', max: 16 } }), true);
        });

        it('should fail for equal string length', () => {
            assert.throws(
                () => validator({ name: 'Albert Einstein' }, { name: { type: 'string', max: 15 } }),
                (err) => err.code === 'max_invalid'
            );
        });

        it('should fail for invalid string length', () => {
            assert.throws(
                () => validator({ name: 'Albert Einstein' }, { name: { type: 'string', max: 14 } }),
                (err) => err.code === 'max_invalid'
            );
        });

        it('should pass for empty string', () => {
            assert.equal(validator({ name: '' }, { name: { type: 'string', max: 16 } }), true);
        });

        it('should pass for smaller array length', () => {
            assert.equal(validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', max: 5 } }), true);
        });

        it('should fail for equal array length', () => {
            assert.throws(
                () => validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', max: 4 } }),
                (err) => err.code === 'max_invalid'
            );
        });

        it('should fail for invalid array length', () => {
            assert.throws(
                () => validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', max: 3 } }),
                (err) => err.code === 'max_invalid'
            );
        });

        it('should pass for empty array', () => {
            assert.equal(validator({ options: [] }, { options: { type: 'array', max: 1 } }), true);
        });

    });

    describe('Rule: Exact', () => {

        it('should pass for equal integer value', () => {
            assert.equal(validator({ age: 18 }, { age: { type: 'integer', exact: 18 } }), true);
        });

        it('should pass for negative equal integer value', () => {
            assert.equal(validator({ age: -18 }, { age: { type: 'integer', exact: -18 } }), true);
        });

        it('should fail for non-equal integer value', () => {
            assert.throws(
                () => validator({ age: 18 }, { age: { type: 'integer', exact: 17 } }),
                (err) => err.code === 'exact_invalid'
            );
        });

        it('should fail for negative non-equal integer value', () => {
            assert.throws(
                () => validator({ age: -18 }, { age: { type: 'integer', exact: -17 } }),
                (err) => err.code === 'exact_invalid'
            );
        });

        it('should pass for equal string length', () => {
            assert.equal(validator({ name: 'Albert Einstein' }, { name: { type: 'string', exact: 15 } }), true);
        });

        it('should fail for non-equal string length', () => {
            assert.throws(
                () => validator({ name: 'Albert Einstein' }, { name: { type: 'string', exact: 16 } }),
                (err) => err.code === 'exact_invalid'
            );
        });

        it('should fail for non-equal string length', () => {
            assert.throws(
                () => validator({ name: 'Albert Einstein' }, { name: { type: 'string', exact: 14 } }),
                (err) => err.code === 'exact_invalid'
            );
        });

        it('should pass for equal array length', () => {
            assert.equal(validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', exact: 4 } }), true);
        });

        it('should fail for non-equal array length', () => {
            assert.throws(
                () => validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', exact: 5 } }),
                (err) => err.code === 'exact_invalid'
            );
        });

        it('should fail for non-equal array length', () => {
            assert.throws(
                () => validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', exact: 3 } }),
                (err) => err.code === 'exact_invalid'
            );
        });

        it('should fail for empty array', () => {
            assert.throws(
                () => validator({ options: [] }, { options: { type: 'array', exact: 1 } }),
                (err) => err.code === 'exact_invalid'
            );
        });

        it('should pass for empty array with exact 0', () => {
            assert.equal(validator({ options: [] }, { options: { type: 'array', exact: 0 } }), true);
        });

    });

    describe('Rule: alpha', () => {

        it('should pass for alpha-only string', () => {
            assert.equal(validator({ name: 'Obi Wan Kenobi' }, { name: { type: 'string', alpha: true } }), true);
        });

        it('should fail for strings with digits', () => {
            assert.throws(
                () => validator({ name: 'Kink Louis The 14th' }, { name: { type: 'string', alpha: true } }),
                (err) => err.code === 'alpha_invalid'
            );
        });

        it('should fail for strings with comma', () => {
            assert.throws(
                () => validator({ name: 'Help me, please' }, { name: { type: 'string', alpha: true } }),
                (err) => err.code === 'alpha_invalid'
            );
        });

        it('should fail for strings with dots', () => {
            assert.throws(
                () => validator({ name: 'Here we go...' }, { name: { type: 'string', alpha: true } }),
                (err) => err.code === 'alpha_invalid'
            );
        });

        it('should pass for negating rule and digits string', () => {
            assert.equal(validator({ name: '9873945873945' }, { name: { type: 'string', alpha: false } }), true);
        });

    });

    describe('Rule: alphanumeric', () => {

        it('should pass for valid strings', () => {
            assert.equal(validator({ name: 'Kink Louis The 14th' }, { name: { type: 'string', alphanumeric: true } }), true);
        });

        it('should fail for string with exclamation mark', () => {
            assert.throws(
                () => validator({ name: 'I got you, babe!' }, { name: { type: 'string', alphanumeric: true } }),
                (err) => err.code === 'alphanumeric_invalid'
            );
        });

    });

    describe('Rule: in', () => {

        it('should pass for valid integer', () => {
            assert.equal(validator({ age: 18 }, { age: { type: 'integer', in: [11, 12, 13, 18, 19] } }), true);
        });

        it('should fail for invalid integer', () => {
            assert.throws(
                () => validator({ age: 17 }, { age: { type: 'integer', in: [11, 12, 13, 18, 19] } }),
                (err) => err.code === 'in_invalid'
            );
        });

        it('should pass for valid string', () => {
            assert.equal(validator({ name: 'Luke' }, { name: { type: 'string', in: ['Luke', 'Leia', 'Yoda'] } }), true);
        });

        it('should fail for invalid string', () => {
            assert.throws(
                () => validator({ name: 'Vader' }, { name: { type: 'string', in: ['Luke', 'Leia', 'Yoda'] } }),
                (err) => err.code === 'in_invalid'
            );
        });

        it('should pass for valid array', () => {
            assert.equal(validator({ options: [1, 2, 3, 1, 3, 2] }, { options: { type: 'array', in: [1, 2, 3] } }), true);
        });

        it('should fail for invalid array values', () => {
            assert.throws(
                () => validator({ options: [1, 2, 3, 4, 1, 3, 2] }, { options: { type: 'array', in: [1, 2, 3] } }),
                (err) => err.code === 'in_invalid'
            );
        });

    });

    describe('Rule: not_in', () => {

        it('should pass for missing integer', () => {
            assert.equal(validator({ age: 17 }, { age: { type: 'integer', not_in: [11, 12, 13, 18, 19] } }), true);
        });

        it('should fail for present integer', () => {
            assert.throws(
                () => validator({ age: 18 }, { age: { type: 'integer', not_in: [11, 12, 13, 18, 19] } }),
                (err) => err.code === 'not_in_invalid'
            );
        });

        it('should pass for missing string', () => {
            assert.equal(validator({ name: 'Vader' }, { name: { type: 'string', not_in: ['Luke', 'Leia', 'Yoda'] } }), true);
        });

        it('should fail for present string', () => {
            assert.throws(
                () => validator({ name: 'Luke' }, { name: { type: 'string', not_in: ['Luke', 'Leia', 'Yoda'] } }),
                (err) => err.code === 'not_in_invalid'
            );
        });

        it('should pass for valid array', () => {
            assert.equal(validator({ options: [1, 2, 3, 1, 3, 2] }, { options: { type: 'array', not_in: [0, 4, 5] } }), true);
        });

        it('should fail for invalid array values', () => {
            assert.throws(
                () => validator({ options: [1, 2, 3, 4, 1, 3, 2] }, { options: { type: 'array', not_in: [0, 4, 5] } }),
                (err) => err.code === 'not_in_invalid'
            );
        });

    });

    describe('Validating arrays', () => {
        var def = {
            ages: {
                type: 'array',
                min: 3,
                max: 10,
                '*': {
                    type: 'integer',
                    min: 18,
                    max: 26
                }
            }
        };

        it('should correctly validate an integer array', () => {
            var passing = { ages: [18, 19, 20, 21, 22, 23, 24, 25] };
            assert.equal(validator(passing, def), true);
        });

        it('should correctly invalidate an invalid array', () => {
            var failing = { ages: [18, 19, 25, 30] };
            assert.throws(
                () => validator(failing, def),
                (err) => (err.code === 'max_invalid' && err.name === 'ages.3')
            );
        });
    });

    describe('Validating objects', () => {
        var def = {
            actor: {
                type: 'object',
                '*': {
                    name: {
                        type: 'string',
                        min: 3,
                        max: 15
                    },
                    age: {
                        type: 'integer',
                        min: 18,
                        max: 50
                    }
                }
            }
        };

        it('should correctly validate an object', () => {
            var actor = {
                name: 'Jason Bourne',
                age: 30,
            };
            assert.equal(validator({ actor }, def), true);
        });

        it('should correctly invalidate an object', () => {
            var oldActor = {
                name: 'Gandalf',
                age: 170,
            };
            assert.throws(
                () => validator({ actor: oldActor }, def),
                (err) => (err.code === 'max_invalid' && err.name === 'actor.age')
            );
        });
    });

    describe('Validating array of objects', () => {
        var def = {
            actors: {
                type: 'array',
                '*': {
                    type: 'object',
                    '*': {
                        name: 'string',
                        age: {
                            type: 'integer',
                            min: 18,
                            max: 50
                        }
                    }
                }
            }
        };

        it('should correctly validate an array of objects', () => {
            var actors = [
                { name: 'Jason Bourne', age: 30 },
                { name: 'Thomas Anderson (Neo)', age: 45 },
            ];
            assert.equal(validator({ actors }, def), true);
        });

        it('should correctly invalidate an array of objects', () => {
            var actors = [
                { name: 'Jason Bourne', age: 30 },
                { name: 'Thomas Anderson (Neo)', age: 45 },
                { name: 'Gandalf', age: 185 },
            ];
            assert.throws(
                () => validator({ actors }, def),
                (err) => (err.code === 'max_invalid' && err.name === 'actors.2.age')
            );
        });
    });
});