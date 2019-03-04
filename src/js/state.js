const R = require('ramda')
const { createBoard, insert } = require('./pylos')

const createState = (from = {}) => {
  let state = from

  return {
    view: lens => R.view(lens, state),
    set: (lens, x) => {
      state = R.set(lens, x, state)
      return R.clone(state)
    },
    over: (lens, f) => {
      state = R.over(lens, f, state)
      return R.clone(state)
    },
    all: () => R.clone(state)
  }
}

const createPylosState = () => {
  let state = createState({
    board: createBoard(),
    turn: 1
  })

  return {
    getBoard: () => state.view(R.lensProp('board')),
    getTurn: () => state.view(R.lensProp('turn')),
    insert: ([h,i,j], player) => state.over(R.lensProp('board'), insert([h,i,j], player)),
    setTurn: turn => state.set(R.lensProp('turn'), turn),
    reset: () => {
      state.set(R.lensProp('turn'), 1)
      return state.set(R.lensProp('board'), createBoard)
    }
  }
}

const pylosState = createPylosState()

pylosState.insert([3,1,1], 1)
pylosState.setTurn(2)

module.exports = {
  createState,
  createPylosState
}
