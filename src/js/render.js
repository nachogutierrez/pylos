const R = require('ramda')

const { mapF } = require('./functional')
const { indexes, range } = require('./util')
const { balls, empties, liftables, withPlayer } = require('./pylos')
const { clear, ctx2D, beginPath, rect, arc, fill, stroke } = require('./canvas')

const getSquare = ({spacing, offset, unit}) => ([h, i, j]) => ({
  x: offset + ((unit/2)*(3 - h)) + j * (unit + spacing) + spacing,
  y: offset + ((unit/2)*(3 - h)) + i * (unit + spacing) + spacing,
  width: unit,
  height: unit
})

const drawBoard = ({ spacing, offset, unit }) => ({ board, turn }) => R.pipe(
  ctx2D,
  clear,
  drawBalls ({ spacing, offset, unit }) (board),
  drawHints ({ spacing, offset, unit }) ({board, turn})
)

const drawBalls = options => board => R.pipe(
  ...[x => x, ...R.reverse(balls(board)).map(drawBall (options))]
)

const drawHints = options => ({board, turn}) => R.pipe(
  ...[x => x, ...empties(board).map(drawEmptyHint (options))],
  ...[x => x, ...liftables(board).filter(([h,i,j,player]) => player === turn).map(drawLiftableHint (options))]
)

const drawBall = ({spacing, offset, unit}) => ([h,i,j,player]) => R.pipe(
  drawCircle ({unit, color: getPlayerColor(player)}) (getSquare ({spacing, offset, unit}) ([h,i,j]))
)

const drawEmptyHint = ({spacing, offset, unit}) => ([h,i,j]) => R.pipe(
  drawCircle ({unit, color: 'rgba(0,0,0,0.2)', lineWidth: 1}) (getSquare ({spacing, offset, unit}) ([h,i,j]))
)

const drawLiftableHint = ({spacing, offset, unit}) => ([h,i,j,player]) => R.pipe(
  drawCircle ({unit, color: 'rgba(255,0,0,0.2)', lineWidth: 1, padding: 16}) (getSquare ({spacing, offset, unit}) ([h,i,j]))
)

const drawCircle = ({unit, color, padding = 0, lineWidth = 4}) => ({x, y}) => R.pipe(
  beginPath,
  arc(x + unit/2, y + unit/2, unit/2 - padding),
  fill(color),
  stroke('#000', lineWidth)
)

const getPlayerColor = player => player === 1 ? '#ffe066' : '#73264d'

module.exports = {
  drawBoard,
  getSquare
}
