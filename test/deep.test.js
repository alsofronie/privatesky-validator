/* eslint-env mocha */
var assert = require('assert');
var deepCopy = require('./../src/helpers/deep');


describe('Deep Copy', () => {

    it('should prove shallow copy on Object.assign', () => {
        var original = {
            name: 'Original',
            inside: {
                name: 'Inside original'
            },
            items: ['one', 'two', 'three']
        };

        var copy = Object.assign({}, original);

        copy.name = 'Copy';
        copy.inside.name = 'Inside copy';
        copy.items[1] = 'modified';

        assert.equal(Array.isArray(copy.items), true);

        assert.equal(original.name, 'Original');
        assert.equal(original.inside.name, 'Inside copy');
        assert.equal(original.items[1], 'modified');
    });

    it('should prove deepCopy on Object.assign', () => {
        var original = {
            name: 'Original',
            inside: {
                name: 'Inside original'
            },
            items: ['one', 'two', 'three']
        };

        var copy = deepCopy(original);

        copy.name = 'Copy';
        copy.inside.name = 'Inside copy';
        copy.items[1] = 'modified';

        assert.equal(Array.isArray(copy.items), true);

        assert.equal(original.name, 'Original');
        assert.equal(original.inside.name, 'Inside original');
        assert.equal(original.items[1], 'two');


    });
});