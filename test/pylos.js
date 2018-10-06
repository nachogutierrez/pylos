const assert = require('assert')
const { newGame, belowSquare, hasBall, isValidBoardPosition, isValidBoard, positionsAtLevel } = require('@m/pylos')

describe('positionsAtLevel', () => {
	it('should return all valid indexes', () => {
		const expected = [
			[0,0],
			[0,1],
			[0,2],
			[1,0],
			[1,1],
			[1,2],
			[2,0],
			[2,1],
			[2,2]
		]
		actual = positionsAtLevel (3)
		assert.deepEqual(actual, expected)
	})
})

describe('belowSquare', () => {
  it('should return four positions below', () => {
    const expected = [[0, 0], [1, 0], [0, 1], [1, 1]]
    const actual = belowSquare ([0, 0])
    assert.deepEqual(actual, expected)
  })
})

describe('hasBall', () => {
  it('should return false if empty', () => {
    const game = newGame()
    assert(!hasBall (game.board) (4) ([0, 0]))
    game.board[4-1][0][0] = 1
    assert(hasBall (game.board) (4) ([0, 0]))
  })
	it('should return true of it has a ball', () => {
    const game = newGame()
    game.board[4-1][0][0] = 1
    assert(hasBall (game.board) (4) ([0, 0]))
  })
})

describe('isValidBoardPosition', () => {
  it('should return true for level 4 position', () => {
    const game = newGame()
    assert(isValidBoardPosition (game.board) (4) ([0, 0]))
  })
	it('should return true if empty', () => {
		const game = newGame()
    assert(isValidBoardPosition (game.board) (3) ([0, 0]))
	})
	it('should return false if any of four positions below are missing', () => {
		const game = newGame()
    game.board[3-1][0][0] = 1
    assert(!isValidBoardPosition (game.board) (3) ([0, 0]))
    game.board[4-1][0][0] = 1
    assert(!isValidBoardPosition (game.board) (3) ([0, 0]))
    game.board[4-1][1][0] = 1
    assert(!isValidBoardPosition (game.board) (3) ([0, 0]))
    game.board[4-1][0][1] = 1
    assert(!isValidBoardPosition (game.board) (3) ([0, 0]))
	})
	it('should return true if four positions below are filled', () => {
		const game = newGame()
    game.board[3-1][0][0] = 1
    game.board[4-1][0][0] = 1
    game.board[4-1][1][0] = 1
    game.board[4-1][0][1] = 1
    game.board[4-1][1][1] = 1
    assert(isValidBoardPosition (game.board) (3) ([0, 0]))
	})
})

describe('isValidBoard', () => {
  it('should follow 4-below rule', () => {
    const game = newGame()
    assert(isValidBoard (game.board))
    game.board[3-1][0][0] = 1
    assert(!isValidBoard (game.board))
    game.board[4-1][0][0] = 1
    assert(!isValidBoard (game.board))
    game.board[4-1][1][0] = 1
    assert(!isValidBoard (game.board))
    game.board[4-1][0][1] = 1
    assert(!isValidBoard (game.board))
    game.board[4-1][1][1] = 1
    assert(isValidBoard (game.board))
  })
})
