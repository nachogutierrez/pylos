const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x)
const pipePromise = (...fns) => x => fns.reduce((prom, f) => prom.then(f), Promise.resolve(x))
const map = f => step => (a, c) => step(a, f(c))
const filter = predicate => step => (a, c) => predicate(c) ? step(a, c) : a // transducer
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

const getInterval = ([from, to]) => arr => (
  arr.filter((_, i) => from <= i && i <= to)
)

const flip = f => a => b => f (b) (a)

const richPredicate = (predicate, error) => x => (predicate(x) ? { passes: true } : { passes: false, error: error(x) })

const combineRichPredicates = (...richPredicates) => x => {
  for (let i = 0; i < richPredicates.length; i++) {
    const current = richPredicates[i](x)
    if (!current.passes) {
      return current
    }
  }
  return { passes: true }
}

const eitherRichPredicates = (...richPredicates) => x => {
  const errors = []
  for (let i = 0; i < richPredicates.length; i++) {
    const current = richPredicates[i](x)
    if (current.passes) {
      return current
    }
    errors.push(current.error)
  }
  return { passes: false, error: errors.join(', ') }
}

module.exports = {
  flip,
  pipe,
  pipePromise,
  map,
  filter,
  prop,
  flatten,
  mapF,
  not,
  or,
  zip,
  applyAll,
  getInterval,
  richPredicate,
  combineRichPredicates,
  eitherRichPredicates
}
