const {
  pylos: {
    INSERT,
    LIFT,
    REMOVE,
    COMMIT
  },
  ui: {
    SELECT,
    UNSELECT,
    ALLOW_REMOVALS,
    DISALLOW_REMOVALS
  }
} = require('./actionTypes')

// PYLOS ACTIONS

const insertAction = (position, player) => ({ type: INSERT, position, player })

const liftAction = (from, to) => ({ type: LIFT, from, to })

const removeAction = position => ({ type: REMOVE, position })

const commitAction = () => ({ type: COMMIT })

// UI ACTIONS

const selectAction = position => ({ type: SELECT, position })

const unselectAction = () => ({ type: UNSELECT })

const allowRemovalsAction = () => ({ type: ALLOW_REMOVALS })

const disallowRemovalsAction = () => ({ type: DISALLOW_REMOVALS })

module.exports = {
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
    disallowRemovalsAction
  }
}
