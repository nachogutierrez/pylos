const R = require('ramda')

const { getQueryParameter } = require('../../browser')
const { createPylosStore, createUiStore } = require('./store')
const { pylos: { commitAction }, ui: { disallowRemovalsAction } } = require('./actions')
const { pylos: { COMMIT } } = require('./actionTypes')
const { connectToGame } = require('../../firebase')
const { pushLastMove, handleStateUpdate } = require('./firebase')
const { getCanvas, getCanvasContainer, getInfoPanel, getConfirmButton, getShareButton, getCopiedToClipboardMessage } = require('./ui')
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

    const copiedMessage = getCopiedToClipboardMessage()
    const shareButton = getShareButton()
    if (player === 1) {
      shareButton.addEventListener('click', () => {
        copiedMessage.style.visibility = 'visible'
        copyToClipboard(`${window.location.host}/play?game_id=${game_id}&player=2`)
      })
      shareButton.style.visibility = 'visible'

    }
  }

  return {
    start
  }
})()

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);

    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}

window.addEventListener('load', () => {
  App.start()
})
