/* eslint-env mocha */
var assert = require('assert');
var Schema = require('./../src/schema');
var Serializer = require('./../src/serializer');

describe('Serializer Core', () => {

    it('should correctly pack and unpack a simple object', () => {
        var schema = new Schema({ 'names': { type: 'array' } });
        var payload = {
            names: [
                'Anakin Skywalker',
                'Luke Skywalker',
            ]
        };
        var serializer = new Serializer(schema);
        var package = serializer.pack(payload);
        var unpacked = serializer.unpack(package);
        assert.deepEqual(unpacked, payload);
    });

    it('should correctly pack and unpack a Date object', () => {

        var schema = new Schema({ birth_date: { type: 'date' } });
        var payload = {
            birth_date: new Date(2000, 3, 4, 5, 6, 7, 8)
        };
        var serializer = new Serializer(schema);
        var package = serializer.pack(payload);
        var unpacked = serializer.unpack(package);

        assert.equal(unpacked.birth_date instanceof Date, true);
        assert.equal(unpacked.birth_date.valueOf(), payload.birth_date.valueOf());
        assert.deepEqual(unpacked.birth_date, payload.birth_date);

    });
});