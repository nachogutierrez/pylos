const R = require('ramda')

const { toLocalActions, toFirebaseAction } = require('./converters')
const { pylos: { COMMIT } } = require('./actionTypes')
const { updateGameUi } = require('./gameUi')
const { createPylosStore } = require('./store')
const { getInterval, flip } = require('../../functional')
const { pushAction } = require('../../firebase')
const { isValidAction } = require('./validators')
const { pylos: { overrideStateAction, overrideHistoryAction } } = require('./actions')

const filterValidActions = actions => {
  const validActions = []
  const store = createPylosStore()

  actions.forEach(action => {
    const { passes, error } = isValidAction({ state: store.getState(), action })
    if (passes) {
      store.dispatch(action)
      validActions.push(action)
    } else {
      console.log(`invalid action of type ${action.type}: ${error}`);
    }
  })

  return validActions
}

const reduceActions = actions => {
  const store = createPylosStore()
  actions.forEach(store.dispatch)
  return store.getState()
}

const overridePylosHistory = pylosStore => actions => {
  const resultingState = reduceActions(actions)
  pylosStore.dispatch(overrideStateAction(resultingState))
  pylosStore.dispatch(overrideHistoryAction(actions))
  return actions
}

// overrideAndRender :: { pylosStore, uiStore, player } => [Action] => ()
const overrideAndRender = p => R.pipe(
  overridePylosHistory(p.pylosStore),
  () => updateGameUi(p)
)
const hasNewActions = pylosStore => actions => !R.equals(actions, pylosStore.getState().history)

// FIXME: call to render requires reference to uiStore and player id, maybe downstream in a way similar to updateGameUi?
const handleStateUpdate = p => R.pipe(
  R.chain(toLocalActions),
  filterValidActions,
  R.when(hasNewActions(p.pylosStore), overrideAndRender(p))
)

const isType = expectedType => ({ type }) => type === expectedType

const getCheckpoints = R.pipe(
  R.addIndex(R.map)((action, i) => ({ ...action, i })),
  R.filter(isType (COMMIT)) // TODO: replace with constant
)

const getLastCheckpointInterval = checkpoints => {
  const fromIndex = checkpoints.length === 1 ? 0 : checkpoints[checkpoints.length - 2].i + 1
  const toIndex = checkpoints[checkpoints.length - 1].i - 1
  return [fromIndex, toIndex]
}

const getLastCheckpointActions = history => R.pipe(
  getCheckpoints,
  getLastCheckpointInterval,
  flip(getInterval) (history)
)(history)

const pushLastMove = game_id => R.pipe(
  getLastCheckpointActions,
  toFirebaseAction,
  firebaseAction => pushAction(game_id)(firebaseAction)
)

module.exports = {
  pushLastMove,
  handleStateUpdate
}
