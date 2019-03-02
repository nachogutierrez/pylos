const assert = require('assert')
const { indexes } = require('@m/util')

describe('indexes', () => {
	it('should return proper indexes of 3x2 matrix', () => {
		const expected = [
			[0, 0],
			[0, 1],
			[1, 0],
			[1, 1],
			[2, 0],
			[2, 1]
		]
		const actual = indexes (3, 2)
		assert.deepEqual(actual, expected)
	})
})
