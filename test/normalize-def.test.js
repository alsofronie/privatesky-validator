/* eslint-env mocha */
var assert = require('assert');
var normalize = require('../src/helpers/normalize-def');

describe('Normalize Definition Helper Library', () => {
    describe('initial', () => {
        it('should exist and be a function', () => {
            assert.equal('function', typeof normalize);
        });

        it('should return something when called', () => {
            assert.notEqual(undefined, normalize('integer', '_base'));
        });

        it('should return non-null value when called', () => {
            assert.notEqual(null, normalize('integer', 'base'));
        });

        it('should return an object when called', () => {
            assert.equal('object', typeof normalize('integer', 'base'));
        });
    });

    describe('Errors and validation', () => {

        it('should throw a well-formed error if an empty definition is supplied', () => {
            assert.throws(
                () => {
                    normalize('', 'key');
                },
                (err) => {
                    return (typeof err === 'object') &&
                        err.error === true &&
                        err.code === 'definition_invalid';
                }
            );
        });

        it('should throw a well-formed error if a null definition is supplied', () => {
            assert.throws(
                () => {
                    normalize(null, 'key');
                },
                (err) => {
                    return (typeof err === 'object') &&
                        err.error === true &&
                        err.code === 'definition_invalid';
                }
            );
        });

        it('should throw a well-formed error if null key supplied', () => {
            assert.throws(
                () => {
                    normalize('integer', null);
                },
                (err) => {
                    return (typeof err === 'object') &&
                        err.error === true &&
                        err.code === 'key_invalid';
                }
            );
        });

        it('should throw a well-formed error if empty key supplied', () => {
            assert.throws(
                () => {
                    normalize('integer', '');
                },
                (err) => {
                    return (typeof err === 'object') &&
                        err.error === true &&
                        err.code === 'key_invalid';
                }
            );
        });

        it('should throw a well-formed error if no key supplied', () => {
            assert.throws(
                () => {
                    normalize('integer');
                },
                (err) => {
                    return (typeof err === 'object') &&
                        err.error === true &&
                        err.code === 'key_invalid';
                }
            );
        });
    });

    describe('Core functionality', () => {

        it('should not validate the type', () => {
            assert.deepEqual(normalize('non existent type', 'a'), {
                '@key': 'a',
                nullable: false,
                type: 'non existent type',
                required: false
            });
        });

        it('should correctly return a simple syntax definition', () => {
            assert.deepEqual(normalize('integer', 'age'), {
                '@key': 'age',
                nullable: false,
                type: 'integer',
                required: false
            });
        });

        it('should correctly return a complex definition without nullable', () => {
            assert.deepEqual(normalize({ type: 'integer' }, 'age'), {
                '@key': 'age',
                nullable: false,
                type: 'integer',
                required: false
            });
        });

        it('should correctly return a complex definition with nullable', () => {
            assert.deepEqual(normalize({ type: 'integer', nullable: false }, 'age'), {
                '@key': 'age',
                nullable: false,
                type: 'integer',
                required: false
            });
        });

        it('should correctly keep the nullable true option if supplied', () => {
            var def = {
                type: 'integer',
                nullable: true
            };
            assert.deepEqual(normalize(def, 'age'), {
                '@key': 'age',
                nullable: true,
                type: 'integer',
                required: false
            });
        });

        it('should preserve any other properties of the definition object', () => {
            var def = {
                type: 'integer',
                anotherProperty: {
                    one: 'two',
                    three: [4, 5, 6]
                },
                'another property': ['here']
            };
            assert.deepEqual(normalize(def, 'age'), {
                '@key': 'age',
                nullable: false,
                required: false,
                type: 'integer',
                anotherProperty: {
                    one: 'two',
                    three: [4, 5, 6]
                },
                'another property': ['here']
            });
        });
    });
});
