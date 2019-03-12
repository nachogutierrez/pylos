const R = require('ramda')
const { richPredicate, combineRichPredicates, eitherRichPredicates } = require('../../functional')
const { pylos: { INSERT, LIFT, REMOVE, COMMIT } } = require('./actionTypes')
const { ballsLeft, isValidPosition, isPlaceable, liftsFrom, hasSquare, unblockedBalls } = require('../../pylos')

const isType = t => richPredicate(({ action: { type } }) => t === type, ({ action: { type } }) => `expected action type ${t} but got ${type}`)

// isPlayersTurn :: { state: State, action: Action } => boolean
const isPlayersTurn = richPredicate(({ state: { turn }, action: { player } }) => turn === player, ({ state: { turn }, action: { player } }) => `player ${player} attempting to move when it is the turn of player ${turn}`)

const hasBalls = richPredicate(({ state: { board, turn } }) => ballsLeft(board, turn) > 0, ({ state: { turn } }) => `player ${turn} has no balls left`)
const isEmptyPosition = richPredicate(({ state: { board }, action: { position: [h, i, j] } }) => board[h][i][j] === 0, ({ action: { position } }) => `position ${position} is not empty`)
const isUnblockedPosition = richPredicate(({ state: { board }, action: { position, player } }) => R.includes([...position, player], unblockedBalls(board)), ({ action: { position } }) => `expected position ${position} to be unblocked`)
const choseValidPosition = richPredicate(({ action: { position } }) => isValidPosition(position), ({ action: { position } }) => `position ${position} is out of bounds`)
const choseValidFromAndTo = richPredicate(({ action: { from, to } }) => isValidPosition(from) && isValidPosition(to), ({ action: { from, to } }) => `either position ${from} or ${to} are invalid positions`)
const chosePlaceablePosition = richPredicate(({ state: { board }, action: { position } }) => isPlaceable (board) (position), ({ action: { position } }) => `position ${position} is not placeable`)
const choseLiftablePosition = richPredicate(({ state: { board }, action: { from, to } }) => R.includes(to, liftsFrom(board)(from)), ({ action: { from, to } }) => `ball at position ${from} cant be lifted to position ${to}`)
const playedBy = p => richPredicate(({ action: { player } }) => p === player, ({ action: { player } }) => `expected action to be played by player ${p}, but it was played by player ${player}`)

const changesTurn = richPredicate(({ state: { history }, action: { player } }) => R.last(history).player !== player, ({ action: { player } }) => `expected turn to change, but player ${player} played again`)
const keepsTurn = richPredicate(({ state: { history }, action: { player } }) => R.last(history).player === player, ({ action: { player } }) => `expected turn to be kept, but player ${player} played instead`)

const nLastAction = n => predicate => ({ state }) => predicate({ state, action: R.head(state.history.slice(-n)) })
const lastAction = nLastAction(1)
const beforeLastAction = nLastAction(2)

const isInsertOrLift = eitherRichPredicates(isType(INSERT), isType(LIFT))
const hasHistoryAtLeast = n => richPredicate(({ state: { history } }) => Array.isArray(history) && history.length >= n, ({ state: { history } }) => `expected history to have at least ${n} actions, but got ${history.length}`)
const hasNoHistory = richPredicate(({ state: { history } }) => Array.isArray(history) && history.length === 0, ({ state: { history } }) => `expected history to be empty, but got ${history.length} actions`)

const insertCompletedSquare = richPredicate(({ state: { board }, action: { position } }) => hasSquare (board) (position), ({ action: { position } }) => `expected insert at ${position} to complete square, but it didnt`)
const liftCompletedSquare = richPredicate(({ state: { board }, action: { to } }) => hasSquare (board) (to), ({ action: { to } }) => `expected lift from ${from} to ${to} to complete square, but it didnt`)
const completedSquare = eitherRichPredicates(
  combineRichPredicates(isType(INSERT), insertCompletedSquare),
  combineRichPredicates(isType(LIFT), liftCompletedSquare)
)

const isValidInsertAction = combineRichPredicates(
  isPlayersTurn,
  hasBalls,
  eitherRichPredicates(
    hasNoHistory,
    combineRichPredicates(lastAction(isType(COMMIT)), changesTurn)
  ),
  eitherRichPredicates(
    hasHistoryAtLeast(1),
    playedBy(1)
  ),
  choseValidPosition,
  chosePlaceablePosition
)

const isValidLiftAction = combineRichPredicates(
  isPlayersTurn,
  hasHistoryAtLeast(1),
  lastAction(isType(COMMIT)),
  changesTurn,
  choseValidFromAndTo,
  choseLiftablePosition
)

const isValidRemovalAction = combineRichPredicates(
  isPlayersTurn,
  hasHistoryAtLeast(2),
  keepsTurn,
  isUnblockedPosition,
  eitherRichPredicates(
    lastAction(isInsertOrLift),
    combineRichPredicates(beforeLastAction(isInsertOrLift), lastAction(isType(REMOVE))),
  ),
  eitherRichPredicates(
    lastAction(isType(REMOVE)), // trust in previous validation for square completion
    lastAction(completedSquare)
  )
)

const isValidCommitAction = combineRichPredicates(
  isPlayersTurn,
  hasHistoryAtLeast(1),
  keepsTurn,
  eitherRichPredicates(
    lastAction(isInsertOrLift),
    combineRichPredicates(beforeLastAction(isInsertOrLift), lastAction(isType(REMOVE))),
    combineRichPredicates(nLastAction(3)(isInsertOrLift), beforeLastAction(isType(REMOVE)), lastAction(isType(REMOVE)))
  )
)

const isValidAction = eitherRichPredicates(
  combineRichPredicates(isType(INSERT), isValidInsertAction),
  combineRichPredicates(isType(LIFT), isValidLiftAction),
  combineRichPredicates(isType(REMOVE), isValidRemovalAction),
  combineRichPredicates(isType(COMMIT), isValidCommitAction)
)

module.exports = {
  changesTurn,
  hasNoHistory,
  hasHistoryAtLeast,
  lastAction,
  beforeLastAction,
  isType,
  isPlayersTurn,
  isValidInsertAction,
  isValidLiftAction,
  isValidRemovalAction,
  isValidCommitAction,
  isValidAction
}
