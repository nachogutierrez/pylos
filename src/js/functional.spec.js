const R = require('ramda')
const { richPredicate, eitherRichPredicates, combineRichPredicates } = require('./functional')

const isEven = richPredicate(x => x % 2 === 0, x => 'not even')
const isPositive = richPredicate(x => x > 0, x => 'not even')

describe('#eitherRichPredicates', () => {

  const either = eitherRichPredicates(isEven, isPositive)

  test('all false', () => {
    expect(either(-3).passes).toBeFalsy()
  })

  test('left true', () => {
    expect(either(-2)).toEqual({ passes: true })
  })

  test('right true', () => {
    expect(either(3)).toEqual({ passes: true })
  })
})

describe('#combineRichPredicates', () => {

  const combined = combineRichPredicates(isEven, isPositive)

  test('all true', () => {
    expect(combined(2)).toEqual({ passes: true })
  })

  test('left false', () => {
    expect(combined(3).passes).toBeFalsy()
  })

  test('right false', () => {
    expect(combined(-2).passes).toBeFalsy()
  })
})
