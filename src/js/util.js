const R = require('ramda')

const clone = x => typeof(x) === 'object' ? R.map(clone, x) : x

const fill = x => n => R.range(0,n).map(_ => clone(x))
const mat = x => (rows, cols) => fill (fill (x) (cols)) (rows)
const zeros = mat (0)
const indexes = (n, m) => R.pipe(
  R.chain(i => R.range(0,m).map(j => ([i, j])))
) (R.range(0,n))

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

module.exports = {
  fill,
  indexes,
  clone,
  mat,
  zeros,
  uuidv4
}
