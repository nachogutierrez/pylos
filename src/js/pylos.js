const { range, indexes, fill, clone, andReducer, concatReducer, mat, zeros, equals, includes } = require('@m/util')
const { not, pipe, or } = require('@m/functional')

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

// empty positions where a ball could be lifted.
const bases = board => boardPositions().filter(hasBase (board))

// empty positions where a ball could be placed.
const empties = board => (
  boardPositions().filter(not (hasBall (board)))
  .filter(or (isLevel (3), hasBase (board)))
)

// position of balls that can be lifted.
const liftables = board => boardPositions().filter(hasBall (board)).filter(isLiftable (board))

// empty positions were a ball could be lifted from [h,i,j]. liftsFrom is a subset of bases.
const liftsFrom = board => ([h,i,j]) => (
  bases(board)
  .filter(not (pipe(belowSquare, includes ([h,i,j]))))
  .filter(([hp,ip,jp]) => hp < h)
)

const isLevel = h => ([hp,ip,jp]) => h === hp
const hasBallColor = board => ([h,i,j], color) => board[h][i][j] === color
const hasBall = board => ([h,i,j]) => board[h][i][j] > 0
const hasBase = board => ([h,i,j]) => h < 3 && belowSquare([h,i,j]).map(hasBall (board)).reduce(andReducer, true)
const isLiftable = board => ([h,i,j]) => liftsFrom(board)([h,i,j]).length > 0
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

let board = createBoard()
board = insert([3,0,0],1)(board)
board = insert([3,1,0],1)(board)
board = insert([3,0,1],1)(board)
board = insert([3,1,1],1)(board)
board = insert([3,3,3],1)(board)

console.log(empties(board));

module.exports = {
  belowSquare,
  boardPositions,
  empties,
  bases,
  liftables,
  liftsFrom,
  hasBall,
  hasBallColor,
  hasBase,
  isValidBoardPosition,
  isValidBoard,
  insert,
  createBoard
}
