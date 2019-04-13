const R = require('ramda')

const {
  pylos: {
    insertAction,
    liftAction,
    removeAction,
    commitAction
  },
  ui: {
    selectAction,
    unselectAction,
    allowRemovalsAction,
    disallowRemovalsAction,
    changeSizeAction
  }
} = require('./actions')
const { getSquare } = require('../../render')
const { circleContains } = require('../../geometry')
const { sanitizeMouseEvent } = require('../../eventUtil')
const { empties, unblockedBalls, insert, move, liftsFrom, hasSquare, belongsToPlayer, isPlaceable, isLiftable } = require('../../pylos')
const { sizeToUiValues } = require('./ui')

// getSquareAndPosition :: UIValues => Position => {square: Square, position: Position}
const getSquareAndPosition = uiValues => position => ({
    square: getSquare (uiValues) (position),
    position
})

// getAllValidPositions :: Board => [Position]
const getAllValidPositions = board => ([...empties(board), ...unblockedBalls(board)])

// getPositionClicked :: (PylosState, UIState) => Point => Position
const getPositionClicked = ({ board }, { size }) => point => R.pipe(
  getAllValidPositions, // Board => [Position]
  R.map(getSquareAndPosition (sizeToUiValues(size))), // [Position] => [{ square: Square, position: Position }]
  R.filter(({ square }) => circleContains (point) (square)), // [{ square: Square, position: Position }] => [{ square: Square, position: Position }]
  R.head, // [{ square: Square, position: Position }] => { square: Square, position: Position }
  R.prop('position') // { square: Square, position: Position } => Position
) (board)

const handleCanvasClick = (player, { board, turn, removals }, { selected, canRemove, size }) => R.pipe(
  sanitizeMouseEvent,
  getPositionClicked({ board }, { size }),
  R.ifElse(R.isNil, R.always({}), handlePositionClick(player, { board, turn, removals }, { selected, canRemove, size }))
)

const handlePositionClick = (player, { board, turn, removals }, { selected, canRemove }) => position => {
  if (player !== turn) {
    return {}
  }
  if (canRemove) {
    if (belongsToPlayer (board, turn) (position)) {
      if (removals + 1 === 2) {
        return { pylos: [removeAction(position, turn), commitAction(turn)], ui: [disallowRemovalsAction(), unselectAction()] }
      } else {
        return { pylos: [removeAction(position, turn)] }
      }
    } else {
      return {}
    }
  } else {
    if (selected) {
      if (R.includes(position, liftsFrom (board) (selected))) {
        if (hasSquare (move (selected, position) (board)) (position)) {
          return { pylos: [liftAction(selected, position, turn)], ui: [allowRemovalsAction()] }
        } else {
          return { pylos: [liftAction(selected, position, turn), commitAction(turn)], ui: [unselectAction()] }
        }
      } else if (!R.equals(selected, position) && isLiftable (board) (position)) {
        return { ui: [selectAction(position)] }
      } else if (R.equals(selected, position)) {
        return { ui: [unselectAction()] }
      } else {
        return {}
      }
    } else {
      if (isPlaceable (board) (position)) {
        if (hasSquare (insert (position, turn) (board)) (position)) {
          return { pylos: [insertAction(position, turn)], ui: [allowRemovalsAction()] }
        } else {
          return { pylos: [insertAction(position, turn), commitAction(turn)], ui: [unselectAction()] }
        }
      } else if (isLiftable (board) (position)) {
        return { ui: [selectAction(position)] }
      } else {
        return {}
      }
    }
  }
}

const flushActions = store => actions => {
  if (actions) {
    actions.forEach(store.dispatch)
  }
}

const flushAllActions = (pylosStore, uiStore) => allActions => {
  console.log(allActions);
  flushActions (pylosStore) (allActions.pylos)
  flushActions (uiStore) (allActions.ui)
  return allActions
}

const canvasClickListener = (player, pylosStore, uiStore) => event => R.pipe(
  handleCanvasClick(player, pylosStore.getState(), uiStore.getState()),
  flushAllActions(pylosStore, uiStore)
) (event)

module.exports = {
    canvasClickListener,
    handlePositionClick
}
