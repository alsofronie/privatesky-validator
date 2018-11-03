/* eslint-env mocha */
var assert = require('assert');
var Schema = require('./../src/schema');

describe('General functionality', () => {

    it('properties outside schema should not be checked', () => {
        var payload = {
            name: 'Ryan',
            rank: 'private',
            age: 19,
            siblings: ['brother', 'mother']
        };

        var schema = new Schema({
            name: 'string',
            // rank: 'string',
            age: 'integer'
        });

        assert.equal(schema.validate(payload), true);
    });

    it('should be able to create schema without any definition', () => {
        var schema = new Schema();

        assert.notEqual(schema, null);
        assert.notEqual(schema, false);
        assert.notEqual(schema, undefined);
    });

    it('should be able to later add the definition', () => {
        var schema = new Schema();
        schema.setDefinition({ age: 'integer' });

        assert.equal(schema.validate({ age: 12 }), true);
        assert.throws(
            () => schema.validate({ age: '12' }),
            (err) => (err.error && err.code === 'type_invalid')
        );
    });

    it('should be able to add a custom type and validate it', () => {
        var schema = new Schema();
        schema.register('this week', function (value) {
            return value === 'today';
        });

        schema.setDefinition({ day: 'this week' });
        assert.equal(schema.validate({ day: 'today' }), true);
        assert.throws(
            () => schema.validate({ day: 'tomorrow' }),
            (err) => {
                return err.error && err.code === 'type_invalid';
            }
        );
    });

    it('should be able to add a custom rule and validate it', () => {
        var schema = new Schema();
        schema.extend('this week', function (value, definition) {
            return value === definition['this week'];
        });

        schema.setDefinition({ day: { type: 'string', 'this week': 'today' } });
        assert.equal(schema.validate({ day: 'today' }), true);
        assert.throws(
            () => schema.validate({ day: 'tomorrow' }),
            (err) => {
                return err.error && err.code === 'this week_invalid';
            }
        );
    });

    it('should receive full schema object on register new type', () => {

        var schema = new Schema({ person: '@person' });
        var schemaVersion = schema.version;
        assert.equal(schemaVersion !== undefined, true);

        schema.register('@person', (value, schema) => {
            assert.equal(schema.version, schemaVersion);
            return true;
        });

        assert.equal(schema.validate({ person: 'Me' }), true);

    });

    it('should be able create and validate a custom type', () => {

        var schema = new Schema({
            person: '@person'
        });

        schema.register('@person', (value) => {
            return ('object' === typeof value) &&
                (value.hasOwnProperty('name')) &&
                (value.hasOwnProperty('age')) &&
                (value.hasOwnProperty('occupation'));

        });

        assert.equal(schema.validate({
            persons: [
                { name: 'Sherlock Holmes', age: 32, occupation: 'detective genius' },
                { name: 'John Watson', age: 34, occupation: ['medic', 'detective'] }
            ]
        }), true);
    });

    it('should be able to use schema in custom type', () => {

        var schema = new Schema({
            person: {
                type: '@person',
                required: true,
            }
        });

        schema.register('@person', (value, schema) => {
            return schema.check(value, {
                type: 'object',
                '*': {
                    name: {
                        type: 'string',
                        required: true,
                    },
                    age: {
                        type: 'integer',
                        required: true,
                        min: 18
                    }
                }
            }, '@my-person');
        });

        assert.equal(schema.validate({
            person: { name: 'Sherlock Holmes', age: 32, occupation: 'detective genius' },
        }), true);

        assert.throws(
            () => schema.validate({ person: { age: 22 } }),
            (err) => (err.error && err.name === '@my-person.name' && err.code === 'required_invalid')
        );
    });

    it('should be able create and validate an array of custom types', () => {

        var schema = new Schema({
            persons: {
                type: 'array',
                required: true,
                '*': {
                    type: '@person'
                }
            }
        });

        schema.register('@person', (value) => {
            return ('object' === typeof value) &&
                (value.hasOwnProperty('name')) &&
                (value.hasOwnProperty('age')) &&
                (value.hasOwnProperty('occupation'));
        });

        assert.equal(schema.validate({
            persons: [
                { name: 'Sherlock Holmes', age: 32, occupation: 'detective genius' },
                { name: 'John Watson', age: 34, occupation: ['medic', 'detective'] }
            ]
        }), true);

        assert.throws(
            () => schema.validate({
                persons: [
                    { name: 'Sherlock Holmes', age: 32, occupation: 'detective genius' },
                    { name: 'John Watson', age: 34 }
                ]
            }),
            (err) => (err.error && err.code === 'type_invalid')
        );
    });
});
