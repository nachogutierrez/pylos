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

// PYLOS ACTIONS

const insertAction = (position, player) => ({ type: INSERT, position, player })

const liftAction = (from, to, player) => ({ type: LIFT, from, to, player })

const removeAction = (position, player) => ({ type: REMOVE, position, player })

const commitAction = (player) => ({ type: COMMIT, player })

const overrideStateAction = resultingState => ({ type: OVERRIDE_STATE, ...resultingState })

const overrideHistoryAction = history => ({ type: OVERRIDE_HISTORY, history })

// UI ACTIONS

const selectAction = position => ({ type: SELECT, position })

const unselectAction = () => ({ type: UNSELECT })

const allowRemovalsAction = () => ({ type: ALLOW_REMOVALS })

const disallowRemovalsAction = () => ({ type: DISALLOW_REMOVALS })

const changeSizeAction = (size) => ({ type: CHANGE_SIZE, size })

module.exports = {
  pylos: {
    insertAction,
    liftAction,
    removeAction,
    commitAction,
    overrideStateAction,
    overrideHistoryAction
  },
  ui: {
    selectAction,
    unselectAction,
    allowRemovalsAction,
    disallowRemovalsAction,
    changeSizeAction
  }
}
