const R = require('ramda')

const { createBoard, insert, empties, liftables, liftsFrom } = require('./pylos')
const { drawBoard, getSquare } = require('./render')
const { createPylosState } = require('./state')
const { ctx2D, beginPath, rect, fill, stroke } = require('./canvas')

const App = (() => {

  const pylosState = createPylosState()

  const uiValues = {
    spacing: 8,
    offset: 64,
    unit: 64
  }
  let canvas

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
    ) (pylosState.getBoard())

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
      const turn = pylosState.getTurn()
      const selected = pylosState.getSelected()
      const board = pylosState.getBoard()
      const emptyPos = toPosition(empties)(e)
      const liftablePos = toPosition(liftables)(e)
      if (emptyPos) {
        if (!selected) {
          pylosState.insert(emptyPos, turn)
          pylosState.setTurn(3 - pylosState.getTurn())
          pylosState.setSelected(undefined)
        } else if (selected && R.includes(emptyPos, liftsFrom(board)(selected))) {
          pylosState.move(selected, emptyPos)
          pylosState.setTurn(3 - pylosState.getTurn())
          pylosState.setSelected(undefined)
        }
      } else if (liftablePos && liftablePos[3] === turn) {
        if (R.equals(liftablePos, selected)) {
          pylosState.setSelected(undefined)
        } else {
          pylosState.setSelected(liftablePos)
        }
      }
      render()
    })
  }

  function render() {
    drawBoard(uiValues)(pylosState.all())(canvas)
  }

  return {
    start
  }
})()

window.addEventListener('load', () => {
  App.start()
})
