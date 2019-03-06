const R = require('ramda')
const { createStore } = require('redux')

const { pylosReducer, insertReducer } = require('./reducers')
const { insertAction, liftAction, selectAction, unselectAction } = require('./actions')
const { createBoard, insert, empties, liftables, liftsFrom } = require('./pylos')
const { drawBoard, getSquare } = require('./render')
const { ctx2D, beginPath, rect, fill, stroke } = require('./canvas')

const App = (() => {

  const uiValues = {
    spacing: 8,
    offset: 64,
    unit: 64
  }
  let canvas
  const initialState = {
    board: createBoard(),
    turn: 1,
    ui: {},
    history: []
  }
  const store = createStore(pylosReducer, initialState)

  function start() {
    console.log('app running')
    canvas = document.getElementById('canvas')

    render()

    setListeners()
  }

  function setListeners() {

    const sanitizeMouseEvent = e => {
      e.preventDefault()
      const rect = e.target.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    const getSquares = f => R.pipe(
      f,
      R.map(pos => ({
        pos,
        square: getSquare (uiValues) (pos)
      }))
    ) (store.getState().board)

    const valueWithin = (a, from, len) => a >= from && a <= from + len
    const squareContains = ({ x, y }) => square => (
      valueWithin(x, square.x, square.width)
      && valueWithin(y, square.y, square.height)
    )

    const toPosition = f => R.pipe(
      sanitizeMouseEvent,
      ({ x, y }) => ({ x, y, squares: getSquares(f) }),
      ({ x, y, squares }) => squares.filter(R.pipe(R.prop('square'), squareContains({x,y}))),
      R.head,
      R.prop('pos')
    )

    canvas.addEventListener('click', e => {

      const { turn, board, ui: { selected } } = store.getState()
      const emptyPos = toPosition(empties)(e)
      const liftablePos = toPosition(liftables)(e)

      if (emptyPos) {
        if (!selected) {
          store.dispatch(insertAction(emptyPos, turn))
        } else if (selected && R.includes(emptyPos, liftsFrom(board)(selected))) {
          store.dispatch(liftAction(selected, emptyPos))
        }
      } else if (liftablePos && liftablePos[3] === turn) {
        if (R.equals(liftablePos, selected)) {
          store.dispatch(unselectAction())
        } else {
          store.dispatch(selectAction(liftablePos))
        }
      }

      render()
    })
  }

  function render() {
    drawBoard(uiValues)(store.getState())(canvas)
  }

  return {
    start
  }
})()

window.addEventListener('load', () => {
  App.start()
})
