/* eslint-env mocha */
var assert = require('assert');
var Schema = require('./../src/schema');

var validator = function (obj, definition) {
    var schema = new Schema(definition);
    return schema.validate(obj);
};

describe('Validating types', () => {

    describe('Nullable', () => {

        it('should pass a nullable value, even with other enforced rules', () => {

            var schema = new Schema({
                name: {
                    type: 'string',
                    nullable: true,
                    min: 10,
                    max: 255
                }
            });

            assert.equal(schema.validate({ name: null }), true);
        });
    });

    describe('Testing types with correct values', () => {

        it('should pass positive floating point', () => {
            var schema = new Schema({ price: 'float' });
            assert.equal(schema.validate({ price: 1.99 }), true);
        });

        it('should pass negative floating point', () => {
            var schema = new Schema({ price: 'float' });
            assert.equal(schema.validate({ price: -1.99 }), true);
        });

        it('should pass zero floating point', () => {
            assert.equal(validator({ rebate: 0 }, { rebate: 'float' }), true);
        });

        it('should pass bool true', () => {
            assert.equal(validator({ enabled: true }, { enabled: 'bool' }), true);
        });

        it('should pass bool false', () => {
            assert.equal(validator({ active: false }, { active: 'bool' }), true);
        });

        it('should pass array', () => {
            assert.equal(validator({ options: [1, 2, 3] }, { options: 'array' }), true);
        });

        it('should pass empty array', () => {
            assert.equal(validator({ options: [] }, { options: 'array' }), true);
        });

        it('should pass object', () => {
            assert.equal(validator({ prefs: { a: true, b: false } }, { prefs: 'object' }), true);
        });

        it('should pass empty object', () => {
            assert.equal(validator({ prefs: {} }, { prefs: 'object' }), true);
        });

        it('should pass a date value', () => {
            assert.equal(validator({ now: new Date() }, { born_at: 'date' }), true);
        });

    });

    describe('Integer type', () => {

        it('should pass positive integer value', () => {
            assert.equal(validator({ age: 20 }, { age: 'integer' }), true);
        });

        it('should pass negative integer value', () => {
            assert.equal(validator({ credit: -1220 }, { credit: 'integer' }), true);
        });

        it('should pass zero as integer value', () => {
            assert.equal(validator({ debt: 0 }, { debt: 'integer' }), true);
        });

        [
            { age: '20' },
            { age: true, },
            { age: { value: 20 } },
            { age: 3.1415926 },
            { age: () => true },
            { age: [1, 2, 3], },
            { age: [] },
        ].forEach(val => {
            it('should fail for ' + typeof val.age + ' value', () => {
                assert.throws(
                    () => validator(val, { age: 'integer' }),
                    (err) => err.error
                );
            });
        });
    });

    describe('String type', () => {

        it('should pass non-empty string value ', () => {
            assert.equal(validator({ name: 'Jon Appleseed' }, { name: 'string' }), true);
        });

        it('should pass empty string value', () => {
            assert.equal(validator({ name: '' }, { name: 'string' }), true);
        });

        [
            { name: 20 },
            { name: true, },
            { name: { value: 'Jack' } },
            { name: 3.1415926 },
            { name: () => true },
            { name: ['A', 'B', 'C'], },
            { name: [] },
        ].forEach(val => {
            it('should fail for ' + typeof val.name + ' value', () => {
                assert.throws(
                    () => validator(val, { name: 'string' }),
                    (err) => err.error
                );
            });
        });

    });

    describe('Floating point type', () => {
        it('should pass positive floating point value', () => {
            assert.equal(validator({ price: 1.99 }, { price: 'float' }), true);
        });

        it('should pass integer value positive', () => {
            assert.equal(validator({ price: 199 }, { price: 'float' }), true);
        });

        it('should pass negative floating point value', () => {
            assert.equal(validator({ price: -1.99 }, { price: 'float' }), true);
        });

        it('should pass negative integer value', () => {
            assert.equal(validator({ price: -199 }, { price: 'float' }), true);
        });

        it('should pass zero floating point value', () => {
            assert.equal(validator({ rebate: 0.0 }, { rebate: 'float' }), true);
        });

        it('should pass zero integer value', () => {
            assert.equal(validator({ rebate: 0 }, { rebate: 'float' }), true);
        });

        [
            { price: '20' },
            { price: true, },
            { price: { value: 'Jack' } },
            { price: () => true },
            { price: ['A', 'B', 'C'], },
            { price: [] },
        ].forEach(val => {
            it('should fail for ' + typeof val.price + ' value', () => {
                assert.throws(
                    () => validator(val, { price: 'float' }),
                    (err) => err.error
                );
            });
        });
    });

    describe('Boolean type', () => {

        it('should pass bool true value', () => {
            assert.equal(validator({ enabled: true }, { enabled: 'bool' }), true);
        });

        it('should pass bool false value', () => {
            assert.equal(validator({ active: false }, { active: 'bool' }), true);
        });

        [
            { name: 20 },
            { name: [], },
            { name: ['A', 'B', 'C'], },
            { name: '20' },
            { name: 'true' },
            { name: 'false' },
            { name: { value: 'Jack' } },
            { name: 3.1415926 },
            { name: () => true }
        ].forEach(val => {
            it('should fail for ' + typeof val.name + ' value', () => {
                assert.throws(
                    () => validator(val, { name: 'bool' }),
                    (err) => err.error
                );
            });
        });
    });

    describe('ISO Date', () => {
        [
            { born_at: '2000-11-01' },
            { born_at: '2000-02-29' },
        ].forEach(val => {
            it('should pass for for ' + val.born_at + ' valid date', () => {
                assert.equal(validator(val, { born_at: 'iso_date' }), true);
            });
        });

        [
            { born_at: '2000-11-00' },
            { born_at: '2000-13-00' },
            { born_at: '2000-00-01' },
            { born_at: '2000-01-32' },
            { born_at: '2001-02-29' },
            { born_at: '2001-02-29 11:22:33' },
            { born_at: '2000-11-00 11:22:33' },
            { born_at: '2000-13-00 11:22:33' },
            { born_at: '2000-00-01 11:22:33' },
            { born_at: '2000-01-32 11:22:33' },
            { born_at: '2000-01-01 00:00:60' },
            { born_at: '2000-01-01 00:00:96' },
            { born_at: '2000-01-01 24:00:00' },
            { born_at: '2000-01-01 75:00:00' },
            { born_at: '2000-01-01 00:60:00' },
            { born_at: '2000-01-01 00:73:00' },
        ].forEach(val => {
            it('should fail for ' + val.born_at + ' invalid date', () => {
                assert.throws(
                    () => validator(val, { born_at: 'iso_date_long' }),
                    (err) => err.error
                );
            });
        });
    });

    describe('Array', () => {

        it('should pass an array value', () => {
            assert.equal(validator({ options: [1, 2, 3] }, { options: 'array' }), true);
        });

        it('should pass an empty array value', () => {
            assert.equal(validator({ options: [] }, { options: 'array' }), true);
        });

        [
            { options: '20' },
            { options: true, },
            { options: { value: 'Jack' } },
            { options: () => true },
            { options: 300, },
        ].forEach(val => {
            it('should fail for ' + typeof val.options + ' value', () => {
                assert.throws(
                    () => validator(val, { options: 'array' }),
                    (err) => err.error
                );
            });
        });
    });

    describe('Object', () => {

        it('should pass an object value', () => {
            assert.equal(validator({ options: { a: 10, b: 20 } }, { options: 'object' }), true);
        });

        it('should pass an empty object value', () => {
            assert.equal(validator({ options: {} }, { options: 'object' }), true);
        });

        it('should fail for array value', () => {
            assert.throws(
                () => validator({ options: ['Peter', 'Pan'] }, { options: 'object' }),
                (err) => err.error
            );
        });

        [
            { options: '20' },
            { options: true, },
            { options: () => ({ a: true, b: 2, c: 3 }) },
            { options: 300, },
        ].forEach(val => {
            it('should fail for ' + typeof val.options + ' value', () => {
                assert.throws(
                    () => validator(val, { options: 'object' }),
                    (err) => err.error
                );
            });
        });
    });
});