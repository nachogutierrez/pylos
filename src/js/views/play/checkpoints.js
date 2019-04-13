const R = require('ramda')

const { getInterval, flip } = require('../../functional')
const { pylos: { COMMIT } } = require('./actionTypes')

const isType = expectedType => ({ type }) => type === expectedType

const getCheckpoints = R.pipe(
  R.addIndex(R.map)((action, i) => ({ ...action, i })),
  R.filter(isType (COMMIT))
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

module.exports = {
  getLastCheckpointActions
}
