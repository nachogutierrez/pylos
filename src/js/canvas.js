const ctx2D = canvas => canvas.getContext("2d");
const beginPath = ctx => {
  ctx.beginPath()
  return ctx
}
const rect = (startX, startY, width, height) => ctx => {
  ctx.rect(startX, startY, width, height)
  return ctx
}
const arc = (centerX, centerY, radius) => ctx => {
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  return ctx
}
const fill = color => ctx => {
  const backup = ctx.fillStyle
  ctx.fillStyle = color
  ctx.fill()
  ctx.fillStyle = backup
  return ctx
}
const stroke = (strokeStyle, lineWidth = 1) => ctx => {
  const backups = [ctx.strokeStyle, ctx.lineWidth]
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke()
  ctx.strokeStyle = backups[0];
  ctx.lineWidth = backups[1];
  return ctx
}

const clear = ctx => {
  const canvas = ctx.canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return ctx
}

module.exports = {
  ctx2D,
  beginPath,
  rect,
  arc,
  fill,
  stroke,
  clear
}
