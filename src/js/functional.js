const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x)
const map = f => arr => arr.map(f)
const filter = f => arr => arr.filter(f)
const prop = key => obj => obj[key]
const flatten = arr => arr.reduce((a, b) => [...a, ...b], [])
const zip = (l1, l2) => (
  l1.filter((x,i) => i < l2.length)
  .map((x,i) => ([x, l2[i]]))
)
const applyAll = map(([f, x]) => f(x))

const mapF = (...fns) => x => fns.map(f => f(x))
const not = f => x => !f(x)
const or = (f, g) => x => f(x) || g(x)

const fst = ([a, b]) => a
const snd = ([a, b]) => b

module.exports = {
  pipe,
  map,
  filter,
  prop,
  flatten,
  mapF,
  not,
  or,
  zip,
  applyAll
}
