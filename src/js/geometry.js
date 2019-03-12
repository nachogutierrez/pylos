const { valueWithin } = require('./math')

const squareContains = ({ x, y }) => square => (
  valueWithin(x, square.x, square.x + square.width)
  && valueWithin(y, square.y, square.y + square.height)
)

const circleContains = ({ x, y }) => square => {
  const centerX = square.x + square.width/2
  const centerY = square.y + square.height/2
  const radius = square.width/2
  return (x - centerX)*(x - centerX) + (y - centerY)*(y - centerY) <= radius*radius
}

module.exports = {
    squareContains,
    circleContains
}
