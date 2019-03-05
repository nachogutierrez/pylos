const R = require('ramda')
const { createBoard, insert, move } = require('./pylos')

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
    getSelected: () => state.view(R.lensProp('selected')),
    insert: ([h,i,j], player) => state.over(R.lensProp('board'), insert([h,i,j], player)),
    move: ([fromH,fromI,fromJ], [toH,toI,toJ]) => state.over(R.lensProp('board'), move([fromH,fromI,fromJ], [toH,toI,toJ])),
    setTurn: turn => state.set(R.lensProp('turn'), turn),
    setSelected: selected => state.set(R.lensProp('selected'), selected),
    reset: () => {
      state.set(R.lensProp('turn'), 1)
      return state.set(R.lensProp('board'), createBoard)
    },
    all: () => state.all()
  }
}

const pylosState = createPylosState()

pylosState.insert([3,1,1], 1)
pylosState.setTurn(2)

module.exports = {
  createState,
  createPylosState
}
