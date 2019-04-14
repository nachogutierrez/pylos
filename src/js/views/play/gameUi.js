const R = require('ramda')

const {
  getCanvas,
  getInfoPanel,
  getPanel,
  getPanelBall,
  getPanelBallsLeft,
  getPanelNote,
  getGameOverMessage,
  sizeToUiValues,
  getConfirmButton
} = require('./ui')
const { ui: { changeSizeAction } } = require('./actions')
const { getWindowSize } = require('../../browser')
const { sizeLens } = require('../../lenses')
const { colors: { BALL_PLAYER_1, BALL_PLAYER_2 } } = require('../../constants')
const { ballsLeft, isGameOver } = require('../../pylos')
const { drawBoard } = require('../../render')

const getState = store => store.getState()
const uiStoreToUiValues = R.pipe(
  getState,
  R.view(sizeLens),
  sizeToUiValues
)

const setBallSize = p => {
  const { unit } = uiStoreToUiValues(p.uiStore)
  setElementSize(getPanelBall('left'), unit)
  setElementSize(getPanelBall('right'), unit)
  return p
}

const setBallColor = p => {
  setElementColor(getPanelBall('left'), BALL_PLAYER_1)
  setElementColor(getPanelBall('right'), BALL_PLAYER_2)
  return p
}

const setBallsLeft = p => {
  const { board } = p.pylosStore.getState()
  const ballsLeft1 = ballsLeft(board, 1)
  const ballsLeft2 = ballsLeft(board, 2)
  getPanelBallsLeft('left').innerHTML = `${ballsLeft1}`
  getPanelBallsLeft('right').innerHTML = `${ballsLeft2}`
  return p
}

const setPanelNotes = p => {
  const player = p.player
  const leftNote = getPanelNote('left')
  const rightNote = getPanelNote('right')
  if (player === 1) {
      leftNote.innerHTML = 'you'
      rightNote.innerHTML = 'opponent'
  } else {
      leftNote.innerHTML = 'opponent'
      rightNote.innerHTML = 'you'
  }
  return p
}

const setTurn = p => {
  const { turn } = p.pylosStore.getState()
  const leftPanel = getPanel('left')
  const rightPanel = getPanel('right')
  leftPanel.classList.remove('turn')
  rightPanel.classList.remove('turn')
  if (turn === 1) {
      leftPanel.classList.add('turn')
  } else {
      rightPanel.classList.add('turn')
  }
  return p
}

const setConfirmButtonVisibility = p => {
  const { canRemove } = p.uiStore.getState()
  if (canRemove) {
    setElementVisibility(getConfirmButton(), 'visible')
  } else {
    setElementVisibility(getConfirmButton(), 'hidden')
  }
  return p
}

const updateBoard = p => {
  drawBoard (uiStoreToUiValues(p.uiStore)) (p.pylosStore.getState(), p.uiStore.getState()) (getCanvas())
  return p
}

const setGameOverMessage = p => {
  const { board } = p.pylosStore.getState()
  const player = p.player
  if (isGameOver(board)) {
      const gameOverEl = getGameOverMessage()
      let message
      if (ballsLeft(board, player) <= 0) {
          message = 'DEFEAT'
      } else {
          message = 'VICTORY'
      }

      gameOverEl.innerHTML = message
      setElementVisibility(gameOverEl, 'visible')
  }
  return p
}

const setElementColor = (el, color) => {
  el.style.background = color;
}

const setElementSize = (el, size) => {
  el.style.width = `${size}px`
  el.style.height = `${size}px`
}

const setElementVisibility = (el, visibility) => {
  el.style.visibility = visibility
}

const calculateNewSize = ({ width, height }) => width < 560 ? 0.7*width : 0.5*height

const resizeCanvas = canvas => newSize => {
  canvas.style.width = `${newSize}px`
  canvas.style.height = `${newSize}px`
  const scale = window.devicePixelRatio;
  canvas.width = newSize * scale;
  canvas.height = newSize * scale;
  canvas.getContext('2d').scale(scale, scale)
  return newSize
}

const resizeInfoPanel = infoPanel => newSize => {
  infoPanel.style.width = `${newSize}px`
  infoPanel.style.height = `${newSize/2.5}px`
  return newSize
}

const updateCanvas = p => R.pipe(
  getWindowSize,
  calculateNewSize,
  resizeCanvas(getCanvas()),
  resizeInfoPanel(getInfoPanel()),
  R.pipe(changeSizeAction, p.uiStore.dispatch),
  () => p
)()

// updateGameUi :: { pylosStore, uiStore, player } => { pylosStore, uiStore, player }
const updateGameUi = R.pipe(
  updateCanvas,
  setBallSize,
  setBallColor,
  setBallsLeft,
  setPanelNotes,
  setTurn,
  setConfirmButtonVisibility,
  updateBoard,
  setGameOverMessage
)

module.exports = {
  updateGameUi
}
