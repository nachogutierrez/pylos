const R = require('ramda')
const { isValidAction, isType, isPlayersTurn, lastAction, beforeLastAction, hasNoHistory, hasHistoryAtLeast, changesTurn } = require('./validators')
const { createBoard, insert, liftsFrom, hasSquare, unblockedBalls } = require('../../pylos')
const { pylos: { insertAction, liftAction, commitAction, removeAction } } = require('./actions')
const { pylos: { INSERT } } = require('./actionTypes')

let state

beforeEach(() => {
  state = {
    board: createBoard(),
    turn: 1,
    removals: 0,
    history: []
  }
})

describe('#changesTurn', () => {
  test('fails if turn doesnt change', () => {
    state.history = [commitAction(1)]
    expect(changesTurn({ state, action: insertAction([3,0,0],1) }).passes).toBeFalsy()
  })

  test('passes if turn changes', () => {
    state.history = [commitAction(2)]
    expect(changesTurn({ state, action: insertAction([3,0,0],1) })).toEqual({ passes: true })
  })
})

describe('#hasHistoryAtLeast', () => {
  test('enough history', () => {
    state.history = [commitAction()]
    expect(hasHistoryAtLeast(1)({ state })).toEqual({ passes: true })
  })

  test('not enough history', () => {
    state.history = [commitAction()]
    expect(hasHistoryAtLeast(2)({ state }).passes).toBeFalsy()
  })
})

describe('#hasNoHistory', () => {
  test('no history', () => {
    expect(hasNoHistory({ state })).toEqual({ passes: true })
  })

  test('some history', () => {
    state.history = [commitAction()]
    expect(hasNoHistory({ state }).passes).toBeFalsy()
  })
})

describe('#lastAction', () => {
  test('is insert type', () => {
    const isInsertAction = isType(INSERT)
    state.history = [insertAction([3,0,0],1)]
    expect(lastAction(isInsertAction)({ state })).toEqual({ passes: true })
  })
})

describe('#isType', () => {
  test('is insert type', () => {
    const isInsertAction = isType(INSERT)
    const action = insertAction([3,0,0], 1)
    expect(isInsertAction({ action })).toEqual({ passes: true })
  })
})

describe('#isPlayersTurn', () => {
  test('', () => {
    const result = isPlayersTurn({ state: { turn: 1 }, action: { player: 1 } })
    expect(result).toEqual({ passes: true })
  })
})

describe('#isValidAction', () => {

  describe('#isValidInsertAction', () => {

    test('initial move', () => {
      const result = isValidAction({ state, action: insertAction([3,0,0], state.turn) })
      expect(result).toEqual({ passes: true })
    })

    test('cant play if not my turn', () => {
      const result = isValidAction({ state, action: insertAction([3,0,0], 2) })
      expect(result.passes).toBeFalsy()
    })

    test('cant insert again after commit', () => {
      state.board = insert ([3,0,0], 1) (state.board)
      state.history = [insert([3,0,0],1), commitAction(1)]
      state.turn = 1
      const result = isValidAction({ state, action: insert([3,0,1],1) })
      expect(result.passes).toBeFalsy()
    })

    test('cant insert in floating position', () => {
      const result = isValidAction({ state, action: insertAction([2,0,0], state.turn) })
      expect(result.passes).toBeFalsy()
    })

    test('can place on top of base', () => {
      state.board = insert ([3,0,0], 1) (state.board)
      state.board = insert ([3,1,0], 2) (state.board)
      state.board = insert ([3,0,1], 1) (state.board)
      state.board = insert ([3,1,1], 2) (state.board)
      const result = isValidAction({ state, action: insertAction([2,0,0], state.turn) })
      expect(result).toEqual({ passes: true })
    })

    test('cant override existing ball', () => {
      state.board = insert ([3,0,0], 1) (state.board)
      state.turn = 2
      const result = isValidAction({ state, action: insertAction([3,0,0], state.turn) })
      expect(result.passes).toBeFalsy()
    })

    test('cant use invalid position', () => {
      const result = isValidAction({ state, action: insertAction([4,0,0], state.turn) })
      expect(result.passes).toBeFalsy()
    })

    test('can place ball number 15', () => {
      for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
          if (i === 3 && j === 3) {
            continue
          }
          if (i === 3 && j === 2) {
            continue
          }
          state.board = insert ([3,i,j], 1) (state.board)
        }
      }
      const result = isValidAction({ state, action: insertAction([3,3,2], state.turn) })
      expect(result).toEqual({ passes: true })
    })

    test('cant place ball number 16', () => {
      for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
          if (i === 3 && j === 3) {
            continue
          }
          state.board = insert ([3,i,j], 1) (state.board)
        }
      }
      const result = isValidAction({ state, action: insertAction([3,3,3], state.turn) })
      expect(result.passes).toBeFalsy()
    })
  })

  describe('#isValidLiftAction', () => {
    test('basic lift', () => {
      state.board = insert ([3,0,0], 1) (state.board)
      state.board = insert ([3,1,0], 2) (state.board)
      state.board = insert ([3,0,1], 1) (state.board)
      state.board = insert ([3,1,1], 1) (state.board)
      state.board = insert ([3,2,2], 2) (state.board)
      state.turn = 2
      state.history = [commitAction(1)]
      const result = isValidAction({ state, action: liftAction([3,2,2], [2,0,0], state.turn) })
      expect(result).toEqual({ passes: true })
    })

    test('cant play if not my turn', () => {
      state.board = insert ([3,0,0], 1) (state.board)
      state.board = insert ([3,1,0], 2) (state.board)
      state.board = insert ([3,0,1], 1) (state.board)
      state.board = insert ([3,1,1], 1) (state.board)
      state.board = insert ([3,2,2], 2) (state.board)
      state.turn = 2
      const result = isValidAction({ state, action: liftAction([3,2,2], [2,0,0], 1) })
      expect(result.passes).toBeFalsy()
    })

    test('cant lift again after commit', () => {
      state.board = insert ([3,0,0], 1) (state.board)
      state.board = insert ([3,1,0], 2) (state.board)
      state.board = insert ([3,0,1], 1) (state.board)
      state.board = insert ([3,1,1], 2) (state.board)
      state.board = insert ([3,2,2], 1) (state.board)
      state.history = [insertAction([3,2,2],1), commitAction(1)]
      state.turn = 1
      const result = isValidAction({ state, action: liftAction([3,2,2], [2,0,0], 1) })
      expect(result.passes).toBeFalsy()
    })

    test('cant lift to the same level (level 3)', () => {
      state.board = insert ([3,0,0], 1) (state.board)
      state.board = insert ([3,0,1], 2) (state.board)
      const result = isValidAction({ state, action: liftAction([3,0,0], [3,1,0], state.turn) })
      expect(result.passes).toBeFalsy()
    })

    test('cant lift to the same level (level 2)', () => {
      state.board = insert ([3,0,0], 1) (state.board)
      state.board = insert ([3,1,0], 2) (state.board)
      state.board = insert ([3,0,1], 1) (state.board)
      state.board = insert ([3,1,1], 2) (state.board)

      state.board = insert ([3,2,2], 1) (state.board)
      state.board = insert ([3,2,3], 2) (state.board)
      state.board = insert ([3,3,2], 1) (state.board)
      state.board = insert ([3,3,3], 2) (state.board)

      state.board = insert ([2,0,0], 1) (state.board)
      const result = isValidAction({ state, action: liftAction([2,0,0], [2,2,2], state.turn) })
      expect(result.passes).toBeFalsy()
    })
  })

  describe('#isValidRemovalAction', () => {

    test('insert remove', () => {
      state.board = insert ([3,0,0], 1) (state.board)
      state.board = insert ([3,1,0], 1) (state.board)
      state.board = insert ([3,0,1], 1) (state.board)
      state.board = insert ([3,1,1], 1) (state.board)

      state.history = [
        commitAction(),
        insertAction([3,1,1],1)
      ]

      const result = isValidAction({ state, action: removeAction([3,0,0], state.turn) })
      expect(result).toEqual({ passes: true })
    })

    test('lift remove', () => {
      state.board = insert ([3,0,0], 1) (state.board)
      state.board = insert ([3,0,1], 1) (state.board)
      state.board = insert ([3,0,2], 1) (state.board)
      state.board = insert ([3,1,0], 1) (state.board)
      state.board = insert ([3,1,1], 1) (state.board)
      state.board = insert ([3,1,2], 1) (state.board)
      state.board = insert ([3,2,0], 1) (state.board)
      state.board = insert ([3,2,1], 1) (state.board)
      state.board = insert ([3,2,2], 1) (state.board)

      state.board = insert ([2,0,0], 1) (state.board)
      state.board = insert ([2,0,1], 1) (state.board)
      state.board = insert ([2,1,0], 1) (state.board)
      state.board = insert ([2,1,1], 1) (state.board)

      state.history = [
        commitAction(state.turn),
        liftAction([3,3,3],[2,1,1],state.turn)
      ]

      const result = isValidAction({ state, action: removeAction([2,1,1], state.turn) })
      expect(result).toEqual({ passes: true })
    })

    test('cant remove from mixed square', () => {
      state.board = insert ([3,0,0], 1) (state.board)
      state.board = insert ([3,1,0], 2) (state.board)
      state.board = insert ([3,0,1], 2) (state.board)
      state.board = insert ([3,1,1], 1) (state.board)

      state.history = [
        commitAction(),
        insertAction([3,1,1],1)
      ]

      const result = isValidAction({ state, action: removeAction([3,0,0], state.turn) })
      expect(result.passes).toBeFalsy()
    })

    test('cant remove if blocked', () => {
      state.board = insert ([3,1,0], 1) (state.board)
      state.board = insert ([3,0,0], 2) (state.board)
      state.board = insert ([3,1,1], 1) (state.board)
      state.board = insert ([3,0,1], 2) (state.board)

      state.board = insert ([3,2,0], 1) (state.board)
      state.board = insert ([2,0,0], 2) (state.board)
      state.board = insert ([3,2,1], 1) (state.board)

      state.history = [
        commitAction(),
        insertAction([3,2,1],1)
      ]

      const result = isValidAction({ state, action: removeAction([3,1,0], state.turn) })
      expect(result.passes).toBeFalsy()
    })

    test('cant remove if no square', () => {
      state.board = insert ([3,1,0], 1) (state.board)
      state.board = insert ([3,0,0], 1) (state.board)
      state.board = insert ([3,1,1], 1) (state.board)

      state.history = [
        commitAction(),
        insertAction([3,1,1],1)
      ]

      const result = isValidAction({ state, action: removeAction([3,1,1], state.turn) })
      expect(result.passes).toBeFalsy()
    })

    test('cant remove a third time', () => {
      state.board = insert ([3,0,0], 1) (state.board)
      state.board = insert ([3,0,1], 1) (state.board)
      state.board = insert ([3,1,0], 1) (state.board)
      state.board = insert ([3,1,1], 1) (state.board)

      state.history = [
        removeAction([3,2,2],1),
        removeAction([3,2,3],1)
      ]

      const result = isValidAction({ state, action: removeAction([3,1,1], state.turn) })
      expect(result.passes).toBeFalsy()
    })
  })

  describe('#isValidCommitAction', () => {

    test('after insert', () => {
      state.board = insert ([3,0,0], 1) (state.board)
      state.history = [insertAction([3,0,0], state.turn)]
      const result = isValidAction({ state, action: commitAction(state.turn) })
      expect(result).toEqual({ passes: true })
    })

    test('after one removal works', () => {
      state.history = [insertAction([3,0,0], state.turn), removeAction([3,0,0], state.turn)]
      const result = isValidAction({ state, action: commitAction(state.turn) })
      expect(result).toEqual({ passes: true })
    })

    test('after two removal works', () => {
      state.history = [insertAction([3,0,0], state.turn), removeAction([3,0,0], state.turn), removeAction([3,0,1], state.turn)]
      const result = isValidAction({ state, action: commitAction(state.turn) })
      expect(result).toEqual({ passes: true })
    })

    test('after three removal fails', () => {
      state.history = [insertAction([3,0,0], state.turn), removeAction([3,0,0], state.turn), removeAction([3,0,1], state.turn), removeAction([3,0,2], state.turn)]
      const result = isValidAction({ state, action: commitAction(state.turn) })
      expect(result.passes).toBeFalsy()
    })
  })
})
