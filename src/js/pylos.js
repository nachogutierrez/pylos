const R = require('ramda')
const { indexes, fill, clone, mat, zeros } = require('./util')

const belowSquare = ([h,i,j]) => (
  [
    [h+1,i,j],
    [h+1,i+1,j],
    [h+1,i,j+1],
    [h+1,i+1,j+1]
  ]
)

const boardPositions = () => R.pipe(
  R.chain(h => indexes(h+1,h+1).map(([i,j]) => ([h,i,j])))
) (R.range(0,4))

// const positionsWithValues = positions => board => positions.map(([h,i,j]) => ([h,i,j,board[h][i][j]]))
const withPlayer = board => ([h,i,j]) => ([h,i,j,board[h][i][j]])

// empty positions where a ball could be lifted.
const bases = board => boardPositions().filter(hasBase (board))

// empty positions where a ball could be placed.
const empties = board => (
  boardPositions()
  .filter(R.complement (hasBall (board)))
  .filter(R.either (isLevel (3), hasBase (board)))
)

// position of balls that can be lifted.
const liftables = board => (
  boardPositions()
  .filter(hasBall (board))
  .filter(isLiftable (board))
  .map(withPlayer (board))
)

const balls = board => (
  boardPositions()
  .filter(hasBall (board))
  .map(withPlayer (board))
)

// empty positions were a ball could be lifted from [h,i,j]. liftsFrom is a subset of bases.
const liftsFrom = board => ([h,i,j]) => (
  bases(board)
  .filter(R.complement (R.pipe(belowSquare, R.includes ([h,i,j]))))
  .filter(R.complement (hasBall (board)))
  .filter(([hp,ip,jp]) => hp < h)
)

const isBlocked = board => ([h,i,j]) => balls(board).filter(R.pipe(belowSquare, R.includes([h,i,j]))).length > 0
const isLevel = h => ([hp,ip,jp]) => h === hp
const isLevelOver = h => ([hp,ip,jp]) => hp < h
const hasBallColor = board => ([h,i,j], color) => board[h][i][j] === color
const hasBall = board => ([h,i,j]) => board[h][i][j] > 0
const hasBase = board => ([h,i,j]) => h < 3 && belowSquare([h,i,j]).map(hasBall (board)).reduce(R.and, true)
const isLiftable = board => ([h,i,j]) => !isBlocked(board)([h,i,j]) && liftsFrom(board)([h,i,j]).length > 0
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

const createBoard = () => R.range(0,4).map(h => zeros(h+1,h+1))

module.exports = {
  belowSquare,
  boardPositions,
  empties,
  bases,
  liftables,
  balls,
  liftsFrom,
  hasBall,
  hasBallColor,
  hasBase,
  isValidBoardPosition,
  isValidBoard,
  insert,
  createBoard,
  withPlayer
}
