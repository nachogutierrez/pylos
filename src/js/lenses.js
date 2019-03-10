const R = require('ramda')

const boardLens = R.lensProp('board')
const turnLens = R.lensProp('turn')
const selectedLens = R.lensProp('selected')
const canRemoveLens = R.lensProp('canRemove')
const removalsLens = R.lensProp('removals')
const historyLens = R.lensProp('history')
const sizeLens = R.lensProp('size')

module.exports = {
  boardLens,
  turnLens,
  selectedLens,
  historyLens,
  canRemoveLens,
  removalsLens,
  sizeLens
}
