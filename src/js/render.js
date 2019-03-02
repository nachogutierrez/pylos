const { indexes, range } = require('@m/util')
const { empties, liftables } = require('@m/pylos')

const drawBoard = canvas => board => {

  const spacing = 8
  const offset = 0
  const unit = 64

  // TODO: draw empty board

  const levels = range(4)
  levels.reverse()

  levels.forEach(h => {
    indexes(h+1,h+1).forEach(([i,j]) => {
      const inner = (unit/2)*(3 - h)
      const ball = board[h][i][j]
      const ballX = inner + j * (unit + spacing) + spacing
      const ballY = inner + i * (unit + spacing) + spacing
      if (ball > 0) {
        const color = ball === 1 ? '#ffe066' : '#73264d'
        squareCircle(canvas)([ballX, ballY], unit, color, true)
      }
    })
  })

  // draw hints
  empties(board).forEach(([h,i,j]) => {
    const inner = (unit/2)*(3 - h)
    const ballX = inner + j * (unit + spacing) + spacing
    const ballY = inner + i * (unit + spacing) + spacing

    squareCircle(canvas)([ballX, ballY], unit, 'rgba(0,0,0,0.4)', false)
  })

  liftables(board).forEach(([h,i,j]) => {
    const inner = (unit/2)*(3 - h)
    const ballX = inner + j * (unit + spacing) + spacing
    const ballY = inner + i * (unit + spacing) + spacing

    squareCircle(canvas)([ballX, ballY], unit, 'rgba(255,255,255,0.5)', false, 12)
  })

  return board
}

const squareCircle = canvas => ([x,y], unit, color, useStroke, padding = 0) => {
  const context = canvas.getContext('2d');
  const centerX = x + unit/2
  const centerY = y + unit/2
  const radius = unit/2 - padding

  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
  if (useStroke) {
    context.lineWidth = 5;
    context.strokeStyle = '#000';
    context.stroke()
  }
}

module.exports = {
  drawBoard
}
