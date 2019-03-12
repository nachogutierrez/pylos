const sanitizeMouseEvent = e => {
  e.preventDefault()
  const rect = e.target.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

module.exports = {
    sanitizeMouseEvent
}
