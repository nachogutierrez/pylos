const R = require('ramda')

const { colors: { BALL_PLAYER_1, BALL_PLAYER_2, BOARD, BOARD_BORDER, PYLOS_TEXT, SELECTED } } = require('./constants')
const { balls, empties, liftables, unblockedBalls, boardPositions, isBlocked } = require('./pylos')
const { translate, clear, ctx2D, beginPath, circle, rectangle, roundRectangle, fill, stroke, dimensions, drawText } = require('./canvas')
const { getLastCheckpointActions } = require('./views/play/checkpoints')

const getSquare = ({spacing, offset, unit}) => ([h, i, j]) => {

  const maxSize = 3*spacing + unit
  const size = h*spacing + unit
  const levelOffset = (maxSize - size)/2

  return {
    x: offset - unit/2 + levelOffset + j * spacing,
    y: offset - unit/2 + levelOffset + i * spacing,
    width: unit,
    height: unit
  }
}

const drawBoard = ({ spacing, offset, unit, cup, borderRadius, borderOffset }) => ({ board, turn, removals, history }, { selected, canRemove }) => R.pipe(
  ctx2D,
  clear,
  drawBackground ({ offset, spacing, cup, borderRadius, borderOffset }),
  drawBalls ({ spacing, offset, unit }) (board),
  canRemove ? drawRemovalHints ({ spacing, offset, unit }) ({board, turn}) : R.identity,
  !canRemove ? drawSelected ({ spacing, offset, unit }) (selected) : R.identity,
  history.length > 0 ? drawLastMoveHints ({ spacing, offset, unit }, history) : R.identity
)

const withDimensions = f => ctx => f(dimensions(ctx))(ctx)

const drawLastMoveHints = (options, history) => R.pipe(
  ...getLastCheckpointActions(history).reverse().map(drawActionHint(options))
)

const drawActionHint = options => action => {
  switch(action.type) {
    case 'INSERT': return drawInsertActionHint(options, action)
    case 'LIFT': return drawLiftActionHint(options, action)
    case 'REMOVE': return drawRemoveActionHint(options, action)
  }
  throw Error(`unsupported type ${action.type}`)
}

const drawActionHintCircle = (options, padding, color, position) => {
  const { x, y } = getSquare (options) (position)
  return circle({
      centerX: x + options.unit/2,
      centerY: y + options.unit/2,
      radius: options.unit/2 - padding,
      color: 'rgba(0,0,0,0)',
      strokeColor: color,
      strokeWidth: 3
  })
}

const drawInsertActionHint = (options, action) => drawActionHintCircle(options, options.unit/8, '#0f0', action.position)

const drawLiftActionHint = (options, action) => R.pipe(
  drawActionHintCircle(options, options.unit/8, '#00f', action.from),
  drawActionHintCircle(options, options.unit/8, '#00f', action.to)
)

const drawRemoveActionHint = (options, action) => drawActionHintCircle(options, options.unit/4, '#f00', action.position)

const drawBackground = ({spacing, offset, cup, borderRadius, borderOffset}) => R.pipe(
    drawBoardBackground ({borderRadius}),
    drawBordersBackground ({borderRadius, borderOffset}),
    drawCupsBackground ({spacing, offset, cup}),
    drawPylosText ({borderOffset, borderRadius, offset, cup})
)

const drawPylosText = ({ borderOffset, offset, borderRadius, cup }) => (
    withDimensions(({ width, height }) => drawText({ text: 'PYLOS', fnt: `${cup/5}pt tahoma`, x: width/2, y: (height - offset + cup/2 + height - borderOffset - borderRadius*2)/2, baseline: 'middle', color: PYLOS_TEXT }))
)

const FIRST_LEVEL = boardPositions().filter(([h,i,j]) => h === 3)

const drawCupsBackground = options => R.pipe(
  ...FIRST_LEVEL.map(drawCupBackground (options))
)

const drawCupBackground = ({ spacing, offset, cup }) => ([h,i,j]) => R.pipe(
    drawCircle ({unit: cup, color: 'rgba(0,0,0,0.2)', lineWidth: 0.5}) (getSquare ({spacing, offset, unit: cup}) ([h,i,j]))
)

const drawBoardBackground = ({ borderRadius }) => (
    withDimensions(({ width, height }) => roundRectangle({ startX: 0, startY: 0, width, height, radius: borderRadius, color: BOARD }))
)

const drawBordersBackground = ({ borderRadius, borderOffset }) => R.pipe(
    drawUpperBorderBackground ({ borderOffset, borderRadius }),
    drawLowerBorderBackground ({ borderOffset, borderRadius }),
    drawRightBorderBackground ({ borderOffset, borderRadius }),
    drawLeftBorderBackground ({ borderOffset, borderRadius })
)

const drawUpperBorderBackground = ({ borderOffset, borderRadius }) => (
    withDimensions(({ width, height }) => roundRectangle({
        startX: borderOffset,
        startY: borderOffset,
        width: width - 2*borderOffset,
        height: 2*borderRadius,
        radius: borderRadius,
        color: BOARD_BORDER
    }))
)

const drawLowerBorderBackground = ({ borderOffset, borderRadius }) => (
    withDimensions(({ width, height }) => roundRectangle({
        startX: borderOffset,
        startY: height - 2*borderRadius - borderOffset,
        width: width - 2*borderOffset,
        height: 2*borderRadius,
        radius: borderRadius,
        color: BOARD_BORDER
    }))
)

const drawRightBorderBackground = ({ borderOffset, borderRadius }) => (
    withDimensions(({ width, height }) => roundRectangle({
        startX: width - 2*borderRadius - borderOffset,
        startY: borderOffset,
        width: 2*borderRadius,
        height: height - 2*borderOffset,
        radius: borderRadius,
        color: BOARD_BORDER
    }))
)

const drawLeftBorderBackground = ({ borderOffset, borderRadius }) => (
    withDimensions(({ width, height }) => roundRectangle({
        startX: borderOffset,
        startY: borderOffset,
        width: 2*borderRadius,
        height: height - 2*borderOffset,
        radius: borderRadius,
        color: BOARD_BORDER
    }))
)

const drawRemovalHints = options => ({board, turn}) => R.pipe(
  ...[x => x, ...unblockedBalls(board).filter(([h,i,j,player]) => player === turn).map(drawSelected (options))]
)

const drawSelected = ({spacing, offset, unit}) => selected => (
  selected ? drawCircle ({unit, color: SELECTED, lineWidth: 0}) (getSquare ({spacing, offset, unit}) (selected)) : R.identity
)

const drawBalls = options => board => R.pipe(
  ...[x => x, ...R.reverse(balls(board)).map(drawBall (options) (board))]
)

const drawBall = ({spacing, offset, unit}) => board => ([h,i,j,player]) => R.pipe(
  drawCircle ({unit, color: getPlayerColor(player), lineWidth: 3}) (getSquare ({spacing, offset, unit}) ([h,i,j])),
  // isBlocked (board) ([h,i,j]) ? drawRectangle ('rgba(0,0,0,0.5)') (getSquare ({spacing, offset, unit: spacing}) ([h,i,j])) : R.identity
)

const drawCircle = ({unit, color, padding = 0, lineWidth = 1}) => ({x, y}) => circle({
    centerX: x + unit/2,
    centerY: y + unit/2,
    radius: unit/2 - padding,
    color,
    strokeColor: '#000',
    strokeWidth: lineWidth
})

const drawRectangle = color => ({ x, y, width, height }) => R.pipe(
    rectangle({startX: x, startY: y, width, height, color})
)

const getPlayerColor = player => player === 1 ? BALL_PLAYER_1 : BALL_PLAYER_2

module.exports = {
  drawBoard,
  getSquare
}
