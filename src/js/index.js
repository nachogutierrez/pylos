const { createBoard } = require('@m/pylos')

const App = (() => {

  let board = createBoard

  function start() {
    console.log('app running')
  }

  return {
    start
  }
})()

window.addEventListener('load', () => {
  App.start()
})
