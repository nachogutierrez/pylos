const R = require('ramda')
const { createStore } = require('redux')

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
    disallowRemovalsAction
  }
} = require('./actions')

const App = (() => {

  const UI_VALUES = {
    size: 800,
    borderPercentage: 0.15,
    offset () {
      return this.size*this.borderPercentage
    },
    spacing () {
      return (this.size*(1 - 2*this.borderPercentage))/23
    },
    unit () {
      return (this.size*(1 - 2*this.borderPercentage) - 3*this.spacing())/4
    },
    snapshot () {
      return {
        size: this.size,
        offset: this.offset(),
        spacing: this.spacing(),
        unit: this.unit()
      }
    }
  }

  let canvas

  const pylosStore = createStore(pylosReducer, {
    board: createBoard(),
    turn: 1,
    history: []
  })

  const uiStore = createStore(uiReducer, {
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
    UI_VALUES.size = Math.min(width, height) * 0.85
    canvas.width = UI_VALUES.size
    canvas.height = UI_VALUES.size
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
        square: getSquare (UI_VALUES.snapshot()) (pos)
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
  }

  function render() {
    drawBoard(UI_VALUES.snapshot())(pylosStore.getState(), uiStore.getState())(canvas)
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
