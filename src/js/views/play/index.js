const R = require('ramda')

const { getQueryParameter } = require('../../browser')
const { createPylosStore, createUiStore } = require('./store')
const { pylos: { commitAction }, ui: { disallowRemovalsAction } } = require('./actions')
const { pylos: { COMMIT } } = require('./actionTypes')
const { connectToGame } = require('../../firebase')
const { pushLastMove, handleStateUpdate } = require('./firebase')
const { getCanvas, getCanvasContainer, getInfoPanel, getConfirmButton } = require('./ui')
const { updateGameUi } = require('./gameUi')

const { canvasClickListener } = require('./listeners')

const App = (() => {

  let canvas
  let canvasContainer
  let infoPanel
  let game_id
  let player

  const pylosStore = createPylosStore()
  const uiStore = createUiStore()

  function start() {
    console.log('app running')
    handleParameters()
    canvas = getCanvas()
    canvasContainer = getCanvasContainer()
    infoPanel = getInfoPanel()

    window.addEventListener('resize', () => {
      updateGameUi({ uiStore, pylosStore, player })
    })

    updateGameUi({ uiStore, pylosStore, player })

    setListeners()
  }

  // TODO: maybe move?
  function handleParameters() {
      game_id = getQueryParameter('game_id')
      player = parseInt(getQueryParameter('player'), 10)

      console.log(`playing as player ${player} in game ${game_id}`);

      if (!game_id) {
          throw new Error('game_id is missing')
      }
      if (player !== 1 && player !== 2) {
          throw new Error('player is missing');
      }

      const handler = handleStateUpdate ({ pylosStore, uiStore, player })
      connectToGame (handler) (game_id)
  }


  // TODO: move
  const hasToSync = actions => (
    actions && actions.length > 0 && R.last(actions).type === COMMIT
  )

  function setListeners() {

    getCanvas().addEventListener('click', R.pipe(
      canvasClickListener (player, pylosStore, uiStore),
      R.prop('pylos'),
      R.when(hasToSync, () => pushLastMove (game_id) (pylosStore.getState().history)),
      () => updateGameUi({ uiStore, pylosStore, player })
    ))

    getConfirmButton().addEventListener('click', () => {
        pylosStore.dispatch(commitAction(player))
        uiStore.dispatch(disallowRemovalsAction())
        pushLastMove (game_id) (pylosStore.getState().history)
        updateGameUi({ uiStore, pylosStore, player })
    })
  }

  return {
    start
  }
})()

window.addEventListener('load', () => {
  App.start()
})
