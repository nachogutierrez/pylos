const { range, fill, clone, boolReducer, mat, zeros } = require('@m/util')

const level = z => zeros (z,z)

const belowSquare = ([i,j]) => [[i,j], [i+1,j], [i,j+1], [i+1,j+1]]
const hasBall = board => z => ([i,j]) => board[z-1][i][j] > 0
const isValidBoardPosition = board => z => ijArr => z === 4 || board[z-1][ijArr[0]][ijArr[1]] === 0  || belowSquare(ijArr).map(hasBall (board) (z+1)).reduce(boolReducer, true)
const positionsAtLevel = z => range(z).map(i => range(z).map(j => [i, j])).reduce((a, b) => a.concat(b))
const isValidBoardLevel = board => z => positionsAtLevel (z).map(isValidBoardPosition (board) (z)).reduce(boolReducer, true)
const isValidBoard = board => range(1,5).map(isValidBoardLevel (board)).reduce(boolReducer, true)

const game = board => ({
  board: board,
  insert: function() {
    const nextBoard = clone(this.board)
    return game(nextBoard)
  }
})

const newBoard = () => range(1,5).map(level)
const newGame = () => game (newBoard())

module.exports = {
  game,
  newBoard,
  newGame,
  belowSquare,
  hasBall,
  isValidBoardPosition,
  isValidBoard,
	positionsAtLevel
}
