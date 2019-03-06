const { INSERT, LIFT, SELECT, UNSELECT } = require('./actionTypes')

const insertAction = (position, player) => ({
  type: INSERT,
  position,
  player
})

const liftAction = (from, to) => ({
  type: LIFT,
  from,
  to
})

const selectAction = (position) => ({
  type: SELECT,
  position
})

const unselectAction = () => ({
  type: UNSELECT
})

module.exports = {
  insertAction,
  liftAction,
  selectAction,
  unselectAction
}
