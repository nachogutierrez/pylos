// beware of shallow copy
const fill = x => n => new Array(n).fill(x)

// cloning is necessary because outer fill uses a shallow copy of the array, so all the rows would point to the same array
const mat = x => (rows, cols) => clone (fill (fill (x) (cols)) (rows))
const zeros = mat (0)

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

const boolReducer = (p1, p2) => p1 && p2

module.exports = {
  fill,
  range,
  clone,
  boolReducer,
  mat,
  zeros
}
