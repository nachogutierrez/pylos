const { createBoard, insert } = require('@m/pylos')
const { drawBoard } = require('@m/render')

const App = (() => {

  let board
  let canvas

  function start() {
    console.log('app running')
    board = createBoard()
    canvas = document.getElementById('canvas')

    board = insert([3,1,1], 1)(board)
    board = insert([3,2,2], 2)(board)

    board = insert([3,2,1], 1)(board)
    board = insert([3,1,2], 2)(board)

    // board = insert([2,1,1], 1)(board)
    board = insert([3,2,3], 2)(board)

    board = insert([3,1,3], 1)(board)
    // board = insert([2,1,2], 2)(board)

    drawBoard(canvas)(board)
  }

  return {
    start
  }
})()

window.addEventListener('load', () => {
  App.start()
})
