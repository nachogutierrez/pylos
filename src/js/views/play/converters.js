const R = require('ramda')
const { pylos: { insertAction, liftAction, commitAction, removeAction } } = require('./actions')
const { pylos: { INSERT } } = require('./actionTypes')
const { mapF } = require('../../functional')

const toInsertAction = ({ player, insert: { position: { h, i, j } } }) => insertAction([h,i,j], player)
const toLiftAction = ({ player, lift: {from: { h:fromH, i:fromI, j:fromJ }, to: { h:toH, i:toI, j:toJ }} }) => liftAction([fromH,fromI,fromJ], [toH,toI,toJ], player)
const toRemovalActions = ({ player, removals }) => !removals ? [] : removals.map(({ h, i, j }) => removeAction([h,i,j], player))
const toCommitAction = ({ player }) => commitAction(player)
const toMainAction = R.ifElse(
  ({ type }) => type === 'insert',
  toInsertAction,
  toLiftAction
)
const toLocalActions = R.pipe(mapF(toMainAction, toRemovalActions, toCommitAction), R.flatten)

const toObjectPosition = ([h, i, j]) => ({ h, i, j })

const toFirebaseInsert = mainAction => ({
  type: 'insert',
  player: mainAction.player,
  insert: {
    position: {...toObjectPosition(mainAction.position)}
  }
})
const toFirebaseLift = mainAction => ({
  type: 'lift',
  player: mainAction.player,
  lift: {
    from: {...toObjectPosition(mainAction.from)},
    to: {...toObjectPosition(mainAction.to)}
  }
})
const toFirebaseMain = R.ifElse(({ type }) => type === INSERT, toFirebaseInsert, toFirebaseLift)
const toFirebaseRemoval = removalAction => ({...toObjectPosition(removalAction.position)})
const toFirebaseRemovals = (...removalActions) => (R.isEmpty(removalActions) ? {} : { removals: R.map(toFirebaseRemoval, removalActions) })
// const toFirebaseRemovals = (...removalActions) => R.map(toFirebaseRemoval, removalActions ? removalActions : [])
const toFirebaseAction = ([mainAction, ...removalActions]) => ({
  ...toFirebaseMain(mainAction),
  ...toFirebaseRemovals(...removalActions)
})

module.exports = {
  toLocalActions,
  toFirebaseAction
}
