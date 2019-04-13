const { createStore } = require('redux')
const { pylosReducer, uiReducer } = require('./reducers')

const { createBoard } = require('../../pylos')

const createPylosStore = () => createStore(pylosReducer, {
  board: createBoard(),
  turn: 1,
  history: []
})

const createUiStore = () => createStore(uiReducer, {
  size: 800,
  history: []
})

module.exports = {
  createPylosStore,
  createUiStore
}
