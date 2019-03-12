const { toLocalActions, toFirebaseAction } = require('./converters')
const { pylos: { insertAction, liftAction, commitAction, removeAction } } = require('./actions')

let player

beforeEach(() => {
  player = 1
})

describe('#toLocalActions', () => {

  test('simple insert', () => {
    const firebaseAction = {
      type: 'insert',
      player,
      insert: {
        position: { h: 3, i: 0, j: 0 }
      }
    }
    const actual = toLocalActions(firebaseAction)
    const expected = [insertAction([3,0,0], player), commitAction(player)]
    expect(actual).toEqual(expected)
  })

  test('simple with one removal', () => {
    const firebaseAction = {
      type: 'insert',
      player,
      insert: {
        position: { h: 3, i: 0, j: 0 }
      },
      removals: [
        { h: 3, i: 1, j: 1 }
      ]
    }
    const actual = toLocalActions(firebaseAction)
    const expected = [insertAction([3,0,0], player), removeAction([3,1,1], player), commitAction(player)]
    expect(actual).toEqual(expected)
  })

  test('simple with two removals', () => {
    const firebaseAction = {
      type: 'insert',
      player,
      insert: {
        position: { h: 3, i: 0, j: 0 }
      },
      removals: [
        { h: 3, i: 1, j: 1 },
        { h: 3, i: 1, j: 0 }
      ]
    }
    const actual = toLocalActions(firebaseAction)
    const expected = [insertAction([3,0,0], player), removeAction([3,1,1], player), removeAction([3,1,0], player), commitAction(player)]
    expect(actual).toEqual(expected)
  })
})

describe('#toFirebaseAction', () => {

  test('simple insert', () => {
    const actual = toFirebaseAction([insertAction([3,0,0], player)])
    const expected = {
      type: 'insert',
      player,
      insert: {
        position: { h: 3, i: 0, j: 0 }
      }
    }
    expect(actual).toEqual(expected)
  })

  test('insert with one removal', () => {
    const actual = toFirebaseAction([insertAction([3,0,0], player), removeAction([3,1,1], 1)])
    const expected = {
      type: 'insert',
      player,
      insert: {
        position: { h: 3, i: 0, j: 0 }
      },
      removals: [
        { h: 3, i: 1, j: 1 }
      ]
    }
    expect(actual).toEqual(expected)
  })

  test('insert with two removals', () => {
    const actual = toFirebaseAction([insertAction([3,0,0], player), removeAction([3,1,1], 1), removeAction([3,0,1], 1)])
    const expected = {
      type: 'insert',
      player,
      insert: {
        position: { h: 3, i: 0, j: 0 }
      },
      removals: [
        { h: 3, i: 1, j: 1 },
        { h: 3, i: 0, j: 1 }
      ]
    }
    expect(actual).toEqual(expected)
  })

  test('simple lift', () => {
    const actual = toFirebaseAction([liftAction([3,2,2], [2,0,0], player)])
    const expected = {
      type: 'lift',
      player,
      lift: {
        from: { h: 3, i: 2, j: 2 },
        to: { h: 2, i: 0, j: 0 }
      }
    }
    expect(actual).toEqual(expected)
  })
})
