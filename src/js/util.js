const { zip } = require('@m/functional')

// beware of shallow copy
const fill = x => n => new Array(n).fill(x)

// cloning is necessary because outer fill uses a shallow copy of the array, so all the rows would point to the same array
const mat = x => (rows, cols) => clone (fill (fill (x) (cols)) (rows))
const zeros = mat (0)
const indexes = (n, m) => range(n).map(i => range(m).map(j => ([i, j]))).reduce(concatReducer, [])

const range = (n, m) => {
  if (!m) return [...Array(n).keys()]
  const size = m - n
  const arr = new Array(size)
  for (let i = 0; i < arr.length; i++) {
    arr[i] = n + i
  }
  return arr
}



const clone = x => Array.isArray(x) ? x.map(clone) : x

const equals = (a, b) => {
  if (Array.isArray(a)) {
    return (
      Array.isArray(b)
      && a.length === b.length
      && zip(a,b).map(([x,y]) => equals(x,y)).reduce(andReducer, true)
    )
  }
  return a === b
}
const includes = x => arr => arr.find(y => equals(x,y)) !== undefined

const andReducer = (p1, p2) => p1 && p2
const concatReducer = (a, b) => a.concat(b)

module.exports = {
  fill,
  range,
  indexes,
  clone,
  equals,
  andReducer,
  concatReducer,
  mat,
  zeros,
  includes
}
