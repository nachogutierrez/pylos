const R = require('ramda')

const boardLens = R.lensProp('board')
const turnLens = R.lensProp('turn')
const selectedLens = R.lensPath(['ui', 'selected'])
const historyLens = R.lensProp('history')

module.exports = {
  boardLens,
  turnLens,
  selectedLens,
  historyLens
}
