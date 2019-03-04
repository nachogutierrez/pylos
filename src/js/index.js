const R = require('ramda')

const { createBoard, insert, empties } = require('./pylos')
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

    const getSquares = () => R.pipe(
      empties,
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

    const toPosition = R.pipe(
      sanitizeMouseEvent,
      ({ x, y }) => ({ x, y, squares: getSquares() }),
      ({ x, y, squares }) => squares.filter(R.pipe(R.prop('square'), squareContains({x,y}))),
      R.head,
      R.prop('pos')
    )

    canvas.addEventListener('click', e => {
      const pos = toPosition(e)
      if (pos) {
        const turn = pylosState.getTurn()
        pylosState.insert(pos, turn)
        pylosState.setTurn(3 - pylosState.getTurn())
        render()
      }
    })
  }

  function render() {
    drawBoard(uiValues)({board: pylosState.getBoard(), turn: pylosState.getTurn()})(canvas)
  }

  return {
    start
  }
})()

window.addEventListener('load', () => {
  App.start()
})
