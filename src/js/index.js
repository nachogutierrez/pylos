const R = require('ramda')
const { createStore } = require('redux')

const {
    colors: { BOARD: COLOR_BOARD },
    proportions: {
        PCT_OFFSET,
        PCT_UNIT,
        PCT_CUP,
        PCT_SPACING,
        PCT_BORDER_RADIUS,
        PCT_BORDER_OFFSET
    }
} = require('./constants')
const { createBoard, insert, empties, liftables, unblockedBalls, liftsFrom, hasSquare } = require('./pylos')
const { drawBoard, getSquare } = require('./render')
const { ctx2D, beginPath, rect, fill, stroke } = require('./canvas')

const { pylosReducer, uiReducer } = require('./reducers')
const {
  pylos: {
    insertAction,
    liftAction,
    removeAction,
    commitAction
  },
  ui: {
    selectAction,
    unselectAction,
    allowRemovalsAction,
    disallowRemovalsAction,
    changeSizeAction
  }
} = require('./actions')

const uiValues = size => ({
    offset: size*PCT_OFFSET,
    unit: size*PCT_UNIT,
    cup: size*PCT_CUP,
    spacing: size*PCT_SPACING,
    borderRadius: size*PCT_BORDER_RADIUS,
    borderOffset: size*PCT_BORDER_OFFSET
})

const App = (() => {

  let canvas

  const pylosStore = createStore(pylosReducer, {
    board: createBoard(),
    turn: 1,
    history: []
  })

  const uiStore = createStore(uiReducer, {
    size: 800,
    history: []
  })

  function start() {
    console.log('app running')
    canvas = document.getElementById('canvas')
    updateCanvas()
    window.addEventListener('resize', () => {
      updateCanvas()
      render()
    })

    render()

    setListeners()
  }

  function updateCanvas() {
    const { width, height } = getWindowSize()
    const newSize = Math.min(width, height) * 0.85
    uiStore.dispatch(changeSizeAction(newSize))
    canvas.width = newSize
    canvas.height = newSize
  }

  function getUiValues() {
      const size = uiStore.getState().size
      return uiValues(size)
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
        square: getSquare (getUiValues()) (pos)
      }))
    ) (pylosStore.getState().board)

    const valueWithin = (a, from, len) => a >= from && a <= from + len
    const squareContains = ({ x, y }) => square => (
      valueWithin(x, square.x, square.width)
      && valueWithin(y, square.y, square.height)
    )

    const circleContains = ({ x, y }) => square => {
      const centerX = square.x + square.width/2
      const centerY = square.y + square.height/2
      const radius = square.width/2
      return (x - centerX)*(x - centerX) + (y - centerY)*(y - centerY) <= radius*radius
    }

    const toPosition = f => R.pipe(
      sanitizeMouseEvent,
      ({ x, y }) => ({ x, y, squares: getSquares(f) }),
      ({ x, y, squares }) => squares.filter(R.pipe(R.prop('square'), circleContains({x,y}))),
      R.head,
      R.prop('pos')
    )

    // TODO: add listener for commit button, it should be enabled only when canRemove is true
    canvas.addEventListener('click', e => {

      const { turn, board, removals } = pylosStore.getState()
      const { selected, canRemove } = uiStore.getState()

      const emptyPos = toPosition(empties)(e)
      const liftablePos = toPosition(liftables)(e)
      const unblockedBallPos = toPosition(unblockedBalls)(e)

      const willSelect = liftablePos && liftablePos[3] === turn

      if (canRemove) {
        const willRemove = unblockedBallPos && unblockedBallPos[3] === turn // can only remove balls that belong to the player
        if (willRemove) {
          pylosStore.dispatch(removeAction(unblockedBallPos))
          if (pylosStore.getState().removals >= 2) { // cant remove more than 2
            pylosStore.dispatch(commitAction())
            uiStore.dispatch(disallowRemovalsAction())
          }
        }
      } else if (emptyPos) {
        const willInsert = !selected
        const willLift = selected && R.includes(emptyPos, liftsFrom(board)(selected))
        if (willInsert) {
          pylosStore.dispatch(insertAction(emptyPos, turn))
        } else if (willLift) {
          pylosStore.dispatch(liftAction(selected, emptyPos))
        }

        if (willInsert || willLift) {
          uiStore.dispatch(unselectAction())
          if (hasSquare (pylosStore.getState().board) (emptyPos)) {
            // player can opt to remove balls, wait for commit
            uiStore.dispatch(allowRemovalsAction())
          } else {
            // commit immediately
            pylosStore.dispatch(commitAction())
            uiStore.dispatch(disallowRemovalsAction())
          }
        }

      } else if (willSelect) { // either changing selected or unselecting by clicking on already selected ball
        if (R.equals(liftablePos, selected)) {
          uiStore.dispatch(unselectAction())
        } else {
          uiStore.dispatch(selectAction(liftablePos))
        }
      }

      render()
    })

    canvas.addEventListener('mousemove', e => {
        e.preventDefault()
        const rect = e.target.getBoundingClientRect()
        const pos = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }

        document.getElementById('data').innerHTML = `x: ${pos.x} y: ${pos.y}`
    })
  }

  function render() {
    drawBoard(getUiValues())(pylosStore.getState(), uiStore.getState())(canvas)
  }

  return {
    start
  }
})()

function getWindowSize() {
  const w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    width = w.innerWidth || e.clientWidth || g.clientWidth,
    height = w.innerHeight|| e.clientHeight|| g.clientHeight
  return { width, height }
}

window.addEventListener('load', () => {
  App.start()
})
