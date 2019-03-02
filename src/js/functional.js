const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x)
const map = f => arr => arr.map(f)
const filter = f => arr => arr.filter(f)
const prop = key => obj => obj[key]
const flatten = arr => arr.reduce((a, b) => [...a, ...b], [])

const mapF = (...fns) => x => fns.map(f => f(x))

const not = f => x => !f(x)

module.exports = {
  pipe,
  map,
  filter,
  prop,
  flatten,
  mapF,
  not
}
