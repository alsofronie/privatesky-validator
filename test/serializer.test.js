/* eslint-env mocha */
var assert = require('assert');
var Schema = require('./../src/schema');
var Serializer = require('./../src/serializer');

describe('Packing', () => {

    it('should correctly pack a simple object', () => {
        var schema = new Schema({ 'names': { type: 'array' } });
        var payload = [
            'Anakin Skywalker',
            'Luke Skywalker',
        ];
        var serializer = new Serializer(schema);
        var packed = '["Anakin Skywalker","Luke Skywalker"]';
        assert.equal(serializer.pack(payload), packed);
    });

    it('should correctly unpack a simple object', () => {
        var schema = new Schema({ 'names': { type: 'array' } });
        var packed = '["Anakin Skywalker","Luke Skywalker"]';
        var payload = [
            'Anakin Skywalker',
            'Luke Skywalker',
        ];

        var serializer = new Serializer(schema);
        var unpacked = serializer.unpack(packed);
        assert.deepEqual(unpacked, payload);
    });
});