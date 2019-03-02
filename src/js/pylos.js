const { range, indexes, fill, clone, andReducer, concatReducer, mat, zeros } = require('@m/util')
const { not } = require('@m/functional')

const belowSquare = ([h,i,j]) => (
  [
    [h+1,i,j],
    [h+1,i+1,j],
    [h+1,i,j+1],
    [h+1,i+1,j+1]
  ]
)

const boardPositions = () => (
  range(4)
  .map(h => indexes(h+1,h+1).map(([i,j]) => ([h,i,j])))
  .reduce(concatReducer, [])
)

// empty positions where a ball could be placed.
const empties = board => boardPositions().filter(not (hasBall (board)))

// empty positions where a ball could be lifted. bases are a subset of empties.
const bases = board => boardPositions().filter(hasBase (board))

// empty positions were a ball could be lifted from [h,i,j]. liftsFrom is a subset of bases.
const liftsFrom = board => ([h,i,j]) => bases(board).filter(([hp,ip,jp]) => hp < h)

const hasBall = board => ([h,i,j]) => board[h][i][j] > 0
const hasBase = board => ([h,i,j]) => h < 3 && belowSquare([h,i,j]).map(hasBall (board)).reduce(andReducer, true)
const isValidBoardPosition = board => ([h,i,j]) => h === 3 || board[h][i][j] === 0  || hasBase (board) ([h,i,j])
const isValidBoard = board => (
  boardPositions()
  .map(isValidBoardPosition (board))
)

const insert = ([h,i,j], ball) => board => {
  const nextBoard = clone(board)
  nextBoard[h][i][j] = ball
  return nextBoard
}

const createBoard = () => range(4).map(h => zeros(h+1,h+1))

module.exports = {
  belowSquare,
  boardPositions,
  empties,
  bases,
  liftsFrom,
  hasBall,
  hasBase,
  isValidBoardPosition,
  isValidBoard,
  insert,
  createBoard
}
