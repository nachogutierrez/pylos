const R = require('ramda')

const { filter } = require('../../functional')
const {
  pylos: {
    INSERT,
    LIFT,
    REMOVE,
    COMMIT,
    OVERRIDE_STATE,
    OVERRIDE_HISTORY
  },
  ui: {
    SELECT,
    UNSELECT,
    ALLOW_REMOVALS,
    DISALLOW_REMOVALS,
    CHANGE_SIZE
  }
} = require('./actionTypes')
const { insert, move, remove } = require('../../pylos')
const { boardLens, turnLens, selectedLens, historyLens, canRemoveLens, removalsLens, sizeLens } = require('../../lenses')

// 1 -> 2 -> 1 -> ...
const changeTurn = x => 3 - x

// transducer to filter actions by type
const forType = type => filter(R.pipe(R.prop('type'),R.equals(type)))

const historyReducer = (state, action) => {
  if ([INSERT,LIFT,REMOVE,COMMIT,SELECT,UNSELECT,ALLOW_REMOVALS,DISALLOW_REMOVALS,CHANGE_SIZE].includes(action.type)) {
    return R.over(historyLens, R.append(action), state)
  }
  return state
}

const mergeReducers = (...reducers) => (state, action) => (
  reducers.reduce((s, r) => r(s, action), state)
)

// PYLOS REDUCERS

const insertReducer = forType (INSERT) (
  (state, { position, player }) => R.over(boardLens, insert(position, player), state)
)

const liftReducer = forType (LIFT) (
  (state, { from, to }) => R.over(boardLens, move(from, to), state)
)

const removeReducer = forType (REMOVE) (
  (state, { position }) => R.pipe(
    R.over(boardLens, remove(position)),
    R.over(removalsLens, R.inc)
  ) (state)
)

const commitReducer = forType (COMMIT) (
  (state, _) => R.pipe(
    R.over(turnLens, changeTurn),
    R.set(removalsLens, 0)
  ) (state)
)

const overrideStateReducer = forType (OVERRIDE_STATE) (
  (state, { board, turn, removals }) => R.pipe(
    R.set(boardLens, board),
    R.set(turnLens, turn),
    R.set(removalsLens, removals)
  ) (state)
)

const overrideHistoryReducer = forType (OVERRIDE_HISTORY) (
  (state, { history }) => R.set(historyLens, history, state)
)

// UI REDUCERS

const selectReducer = forType (SELECT) (
  (state, { position }) => R.set(selectedLens, position, state)
)

const unselectReducer = forType (UNSELECT) (
  (state, _) => R.set(selectedLens, undefined, state)
)

const allowRemovalsReducer = forType (ALLOW_REMOVALS) (
  (state, _) => R.set(canRemoveLens, true, state)
)

const disallowRemovalsReducer = forType (DISALLOW_REMOVALS) (
  (state, _) => R.set(canRemoveLens, false, state)
)

const changeSizeReducer = forType (CHANGE_SIZE) (
  (state, { size }) => R.set(sizeLens, size, state)
)

const pylosReducer = mergeReducers(
  historyReducer,
  insertReducer,
  liftReducer,
  removeReducer,
  commitReducer,
  overrideStateReducer,
  overrideHistoryReducer
)

const uiReducer = mergeReducers(
  historyReducer,
  selectReducer,
  unselectReducer,
  allowRemovalsReducer,
  disallowRemovalsReducer,
  changeSizeReducer
)

module.exports = {
  pylosReducer,
  uiReducer
}
