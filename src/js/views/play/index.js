const R = require('ramda')
const { createStore } = require('redux')

const {
    proportions: {
        PCT_OFFSET,
        PCT_UNIT,
        PCT_CUP,
        PCT_SPACING,
        PCT_BORDER_RADIUS,
        PCT_BORDER_OFFSET
    }
} = require('../../constants')
const { mapF } = require('../../functional')
const { createBoard, empties, liftables, unblockedBalls, liftsFrom, hasSquare } = require('../../pylos')
const { drawBoard, getSquare } = require('../../render')
const { getWindowSize, getQueryParameter} = require('../../browser')
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
const { ID_CANVAS, ID_DATA } = require('./dom')
const { connectToGame, insertMove, liftMove } = require('../../firebase')

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
  let game_id
  let player

  let pylosStore = createStore(pylosReducer, {
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
    handleParameters()
    canvas = document.getElementById(ID_CANVAS)
    window.addEventListener('resize', () => {
      updateCanvas()
      render()
    })

    updateCanvas()
    render()

    setListeners()
  }

  function handleParameters() {
      game_id = getQueryParameter('game_id')
      player = parseInt(getQueryParameter('player'), 10)

      if (!game_id) {
          throw new Error('game_id is missing')
      }
      if (player !== 1 && player !== 2) {
          throw new Error('player is missing');
      }

      connectToGame (handleStateUpdate) (game_id)
  }

  function handleStateUpdate(firebaseState) {
      const newHistory = firebaseStateToHistory(firebaseState)
      pylosStore = createStore(pylosReducer, {
        board: createBoard(),
        turn: 1,
        history: []
      })
      console.log({firebaseState, newHistory});
      hydrateStore (newHistory) (pylosStore)
      render()
  }

  const hydrateStore = history => store => {
      history.forEach(store.dispatch)
      return store
  }

  // TODO: move these mapping functions elsewhere
  const firebaseMoveToInsertAction = ({insert: {player, position: { h, i, j }}}) => insertAction([h,i,j], player)
  const firebaseMoveToLiftAction = ({ lift: {from: { h:fromH, i:fromI, j:fromJ }, to: { h:toH, i:toI, j:toJ }} }) => liftAction([fromH,fromI,fromJ], [toH,toI,toJ])
  const firebaseMoveToMainAction = R.ifElse(
      ({ type }) => type === 'insert',
      firebaseMoveToInsertAction,
      firebaseMoveToLiftAction
  )
  const firebaseMoveToRemovalActions = ({ removals }) => !removals ? [] : removals.map(firebaseRemovalToRemovalAction)
  const firebaseRemovalToRemovalAction = ({ h, i, j }) => removeAction([h,i,j])
  const firebaseMoveToCommitAction = move => commitAction()
  const firebaseMoveToActions = R.pipe(mapF(firebaseMoveToMainAction, firebaseMoveToRemovalActions, firebaseMoveToCommitAction), R.flatten)
  const firebaseStateToHistory = R.chain(firebaseMoveToActions)

  function afterCommit() {
      const { history } = pylosStore.getState()
      const checkpoints = history.map((action, i) => ({...action, i})).filter(({type}) => type === 'COMMIT')
      const fromIndex = checkpoints.length === 1 ? 1 : checkpoints[checkpoints.length - 2].i + 1
      const toIndex = checkpoints[checkpoints.length - 1].i - 1
      const [mainAction, ...removalActions] = history.filter((_, i) => fromIndex <= i && i <= toIndex)
      const removals = removalActions ? removalActions.map(R.prop('position')) : []
      const { type } = mainAction

      console.log({history, fromIndex, toIndex});
      if (type === 'INSERT') {
          const { position, player } = mainAction
          insertMove (position, player, removals) (game_id)
      } else if (type === 'LIFT') {
          const { from, to } = mainAction
          liftMove (from, to, removals) (game_id)
      } else {
          console.error(`invalid type ${type}`);
      }
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
      if (turn !== player) {
          console.log('cant play when it is not your turn!');
          return
      }

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
            afterCommit()
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

            afterCommit()
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

        document.getElementById(ID_DATA).innerHTML = `x: ${pos.x} y: ${pos.y}`
    })
  }

  function render() {
    drawBoard(getUiValues())(pylosStore.getState(), uiStore.getState())(canvas)
  }

  return {
    start
  }
})()

window.addEventListener('load', () => {
  App.start()
})
