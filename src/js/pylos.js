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

const fourSquares = ([h,i,j]) => (
  [
    [[h,i,j], [h,i+1,j], [h,i+1,j+1], [h,i,j+1]],
    [[h,i,j], [h,i-1,j], [h,i-1,j+1], [h,i,j+1]],
    [[h,i,j], [h,i-1,j], [h,i-1,j-1], [h,i,j-1]],
    [[h,i,j], [h,i+1,j], [h,i+1,j-1], [h,i,j-1]]
  ].filter(square => square.map(isValidPosition).reduce(R.and, true))
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

const unblockedBalls = board => (
  balls(board)
  .filter(R.complement(isBlocked (board)))
)

// empty positions were a ball could be lifted from [h,i,j]. liftsFrom is a subset of bases.
const liftsFrom = board => ([h,i,j]) => (
  bases(board)
  .filter(R.complement (R.pipe(belowSquare, R.includes ([h,i,j]))))
  .filter(([hp,ip,jp]) => hp < h)
)

const isBlocked = board => ([h,i,j]) => balls(board).filter(R.pipe(belowSquare, R.includes([h,i,j]))).length > 0
const isLevel = h => ([hp,ip,jp]) => h === hp
const isLevelOver = h => ([hp,ip,jp]) => hp < h
const hasSquare = board => R.pipe(
  fourSquares,
  R.map(R.map(withPlayer (board))),
  R.map(R.countBy(([h,i,j,player]) => player)),
  R.filter(x => x['1'] === 4 || x['2'] === 4),
  R.length,
  R.lt(0)
)
const hasBallColor = board => ([h,i,j], color) => board[h][i][j] === color
const hasBall = board => ([h,i,j]) => board[h][i][j] > 0
const hasBase = board => ([h,i,j]) => !hasBall(board)([h,i,j]) && h < 3 && belowSquare([h,i,j]).map(hasBall (board)).reduce(R.and, true)
const isLiftable = board => ([h,i,j]) => !isBlocked(board)([h,i,j]) && liftsFrom(board)([h,i,j]).length > 0
const isValidPosition = ([h,i,j]) => 0 <= h && h <= 3 && 0 <= i && i <= h && 0 <= j && j <= h
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

const remove = ([h,i,j]) => board => {
  const nextBoard = clone(board)
  nextBoard[h][i][j] = 0
  return nextBoard
}

const move = ([fromH,fromI,fromJ], [toH,toI,toJ]) => board => {
  const nextBoard = clone(board)
  nextBoard[toH][toI][toJ] = nextBoard[fromH][fromI][fromJ]
  nextBoard[fromH][fromI][fromJ] = 0
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
  unblockedBalls,
  liftsFrom,
  hasBall,
  hasBallColor,
  hasBase,
  hasSquare,
  isValidBoardPosition,
  isValidBoard,
  insert,
  move,
  remove,
  createBoard,
  withPlayer,
  fourSquares,
  isBlocked
}
