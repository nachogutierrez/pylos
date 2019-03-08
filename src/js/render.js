const R = require('ramda')

const { balls, empties, liftables, unblockedBalls } = require('./pylos')
const { clear, ctx2D, beginPath, arc, fill, stroke } = require('./canvas')

const getSquare = ({spacing, offset, unit}) => ([h, i, j]) => ({
  x: offset + ((unit/2)*(3 - h)) + j * (unit + spacing) + spacing,
  y: offset + ((unit/2)*(3 - h)) + i * (unit + spacing) + spacing,
  width: unit,
  height: unit
})

const drawBoard = ({ spacing, offset, unit }) => ({ board, turn, removals }, { selected, canRemove }) => R.pipe(
  ctx2D,
  clear,
  // TODO: draw board background
  drawBalls ({ spacing, offset, unit }) (board),
  drawEmptyHints ({ spacing, offset, unit }) ({board, turn}),
  canRemove ? drawRemovalHints ({ spacing, offset, unit }) ({board, turn}) : R.identity,
  !canRemove ? drawLiftableHints ({ spacing, offset, unit }) ({board, turn}) : R.identity,
  !canRemove ? drawSelected ({ spacing, offset, unit }) (selected) : R.identity
)

const drawEmptyHints = options => ({board, turn}) => R.pipe(
  ...[x => x, ...empties(board).map(drawEmptyHint (options))]
)

const drawEmptyHint = ({spacing, offset, unit}) => ([h,i,j]) => R.pipe(
  drawCircle ({unit, color: 'rgba(0,0,0,0.2)', lineWidth: 1}) (getSquare ({spacing, offset, unit}) ([h,i,j]))
)

const drawLiftableHints = options => ({board, turn}) => R.pipe(
  ...[x => x, ...liftables(board).filter(([h,i,j,player]) => player === turn).map(drawLiftableHint (options))]
)

const drawLiftableHint = ({spacing, offset, unit}) => ([h,i,j,player]) => R.pipe(
  drawCircle ({unit, color: 'rgba(255,0,0,0.2)', lineWidth: 1, padding: 16}) (getSquare ({spacing, offset, unit}) ([h,i,j]))
)

const drawRemovalHints = options => ({board, turn}) => R.pipe(
  ...[x => x, ...unblockedBalls(board).filter(([h,i,j,player]) => player === turn).map(drawRemovalHint (options))]
)

const drawRemovalHint = ({spacing, offset, unit}) => ([h,i,j,player]) => R.pipe(
  drawCircle ({unit, color: 'rgba(0,255,0,1)', lineWidth: 1, padding: 16}) (getSquare ({spacing, offset, unit}) ([h,i,j]))
)

const drawSelected = ({spacing, offset, unit}) => selected => (
  selected ? drawCircle ({unit, color: '#000', lineWidth: 1, padding: 16}) (getSquare ({spacing, offset, unit}) (selected)) : R.identity
)

const drawBalls = options => board => R.pipe(
  ...[x => x, ...R.reverse(balls(board)).map(drawBall (options))]
)

const drawBall = ({spacing, offset, unit}) => ([h,i,j,player]) => R.pipe(
  drawCircle ({unit, color: getPlayerColor(player)}) (getSquare ({spacing, offset, unit}) ([h,i,j]))
)

const drawCircle = ({unit, color, padding = 0, lineWidth = 4}) => ({x, y}) => R.pipe(
  beginPath,
  arc(x + unit/2, y + unit/2, unit/2 - padding),
  fill(color),
  stroke('#000', lineWidth)
)

// TODO: take this colors from configuration
const getPlayerColor = player => player === 1 ? '#ffe066' : '#73264d'

module.exports = {
  drawBoard,
  getSquare
}
