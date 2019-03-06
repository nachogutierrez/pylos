const R = require('ramda')
const { combineReducers } = require('redux')

const { filter } = require('./functional')
const { INSERT, LIFT, SELECT, UNSELECT } = require('./actionTypes')
const { createBoard, insert, move } = require('./pylos')
const { boardLens, turnLens, selectedLens, historyLens } = require('./lenses')

// 1 -> 2 -> 1 -> ...
const changeTurn = x => 3 - x

// transducer to filter actions by type
const forType = type => filter(R.pipe(R.prop('type'),R.equals(type)))

const insertReducer = forType (INSERT) (
  (state, { position, player }) => R.pipe(
    R.over(boardLens, insert(position, player)),
    R.over(turnLens, changeTurn),
    R.set(selectedLens, undefined)
  ) (state)
)

const liftReducer = forType (LIFT) (
  (state, { from, to }) => R.pipe(
    R.over(boardLens, move(from, to)),
    R.over(turnLens, changeTurn),
    R.set(selectedLens, undefined)
  ) (state)
)

const selectReducer = forType (SELECT) (
  (state, { position }) => R.set(selectedLens, position, state)
)

const unselectReducer = forType (UNSELECT) (
  (state, _) => R.set(selectedLens, undefined, state)
)

const historyReducer = (state, action) => R.over(historyLens, R.append(action), state)

const mergeReducers = (...reducers) => (state, action) => (
  reducers.reduce((s, r) => r(s, action), state)
)

pylosReducer = mergeReducers(
  insertReducer,
  liftReducer,
  selectReducer,
  unselectReducer,
  historyReducer
)

module.exports = {
  insertReducer,
  liftReducer,
  selectReducer,
  unselectReducer,
  historyReducer,
  pylosReducer,
  mergeReducers
}
