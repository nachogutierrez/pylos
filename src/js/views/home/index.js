const R = require('ramda')

const { ID_BTN_PLAY } = require('./dom')
const { createGame } = require('../../firebase')
const { pipePromise } = require('../../functional')
const { navigateTo } = require('../../browser')

const App = (() => {

  function start() {
    console.log('app running')

    setListeners()
  }

  function setListeners() {
      const playButton = document.getElementById(ID_BTN_PLAY)
      playButton.addEventListener('click', pipePromise(
          createGame,
          game_id => navigateTo('/play', { game_id, player: 1 })
      ))
  }

  return {
    start
  }
})()

window.addEventListener('load', () => {
  App.start()
})
