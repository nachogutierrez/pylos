const { createBoard, insert } = require('../../pylos')
const { handlePositionClick } = require('./listeners')
const { pylos: { insertAction, liftAction, commitAction, removeAction }, ui: { selectAction, unselectAction, allowRemovalsAction, disallowRemovalsAction } } = require('./actions')

let board
let player = 1

beforeEach(() => {
  board = createBoard()
})

describe('#handlePositionClick', () => {

  describe('canRemove = true', () => {
    test('remove last ball commits immediately', () => {
      const position = [3,0,0]
      board = insert (position, 1) (board)
      const actual = handlePositionClick (player, { board, turn: 1, removals: 1 }, { canRemove: true }) (position)
      const expected = {
        pylos: [removeAction(position, player), commitAction(player)],
        ui: [disallowRemovalsAction(), unselectAction()]
      }
      expect(actual).toEqual(expected)
    })

    test('remove ball', () => {
      const position = [3,0,0]
      board = insert (position, 1) (board)
      const actual = handlePositionClick (player, { board, turn: 1, removals: 0 }, { canRemove: true }) (position)
      const expected = {
        pylos: [removeAction(position, player)]
      }
      expect(actual).toEqual(expected)
    })

    test('cant remove empty positions', () => {
      const position = [3,0,0]
      const actual = handlePositionClick (player, { board, turn: 1 }, { canRemove: true }) (position)
      const expected = {}
      expect(actual).toEqual(expected)
    })

    test('clicking opponent pieces does nothing', () => {
      const position = [3,0,0]
      board = insert (position, 2) (board)
      const actual = handlePositionClick (player, { board, turn: 1 }, { canRemove: true }) (position)
      const expected = {}
      expect(actual).toEqual(expected)
    })
  })

  describe('canRemove = false', () => {

    describe('has selected', () => {
      test('included in liftsFrom, hasSquare', () => {
        board = insert ([3,0,0], 1) (board)
        board = insert ([3,0,1], 1) (board)
        board = insert ([3,0,2], 1) (board)
        board = insert ([3,1,0], 1) (board)
        board = insert ([3,1,1], 1) (board)
        board = insert ([3,1,2], 1) (board)
        board = insert ([3,2,0], 1) (board)
        board = insert ([3,2,1], 1) (board)
        board = insert ([3,2,2], 1) (board)

        board = insert ([2,0,0], 1) (board)
        board = insert ([2,0,1], 1) (board)
        board = insert ([2,1,0], 1) (board)

        board = insert ([3,3,3], 1) (board)

        const position = [2,1,1]
        const actual = handlePositionClick (player, { board, turn: 1 }, { selected: [3,3,3] }) (position)
        const expected = {
            pylos: [liftAction([3,3,3], position, player)],
            ui: [allowRemovalsAction()]
        }
        expect(actual).toEqual(expected)
      })

      test('included in liftsFrom, no hasSquare', () => {
        board = insert ([3,0,0], 1) (board)
        board = insert ([3,0,1], 2) (board)
        board = insert ([3,1,0], 2) (board)
        board = insert ([3,1,1], 1) (board)
        board = insert ([3,2,2], 1) (board)
        const position = [2,0,0]
        const actual = handlePositionClick (player, { board, turn: 1 }, { selected: [3,2,2] }) (position)
        const expected = {
            pylos: [liftAction([3,2,2], position, player), commitAction(player)],
            ui: [unselectAction()]
        }
        expect(actual).toEqual(expected)
      })

      test('is tapping selected', () => {
        board = insert ([3,0,0], 1) (board)
        board = insert ([3,0,1], 2) (board)
        board = insert ([3,1,0], 2) (board)
        board = insert ([3,1,1], 1) (board)
        board = insert ([3,2,2], 1) (board)
        const position = [3,2,2]
        const actual = handlePositionClick (player, { board, turn: 1 }, { selected: [3,2,2] }) (position)
        const expected = {
            ui: [unselectAction()]
        }
        expect(actual).toEqual(expected)
      })

      test('is reselecting', () => {
        board = insert ([3,0,0], 1) (board)
        board = insert ([3,0,1], 2) (board)
        board = insert ([3,1,0], 2) (board)
        board = insert ([3,1,1], 1) (board)

        board = insert ([3,2,2], 1) (board)
        board = insert ([3,3,3], 1) (board)

        const position = [3,2,2]
        const actual = handlePositionClick (player, { board, turn: 1 }, { selected: [3,3,3] }) (position)
        const expected = {
            ui: [selectAction(position)]
        }
        expect(actual).toEqual(expected)
      })

      test('floating position generates no action', () => {
        const position = [2,1,1]
        const actual = handlePositionClick (player, { board, turn: 1 }, { selected: [3,2,2] }) (position)
        const expected = {}
        expect(actual).toEqual(expected)
      })
    })

    describe('selected = undefined', () => {
      test('isPlaceable, hasSquare', () => {
        board = insert ([3,0,0], 1) (board)
        board = insert ([3,0,1], 1) (board)
        board = insert ([3,1,0], 1) (board)
        const position = [3,1,1]
        const turn = 1
        const actual = handlePositionClick (player, { board, turn }, {}) (position)
        const expected = {
            pylos: [insertAction(position, turn, player)],
            ui: [allowRemovalsAction()]
        }
        expect(actual).toEqual(expected)
      })

      test('isPlaceable, no hasSquare', () => {
        const position = [3,0,0]
        const turn = 1
        const actual = handlePositionClick (player, { board, turn }, {}) (position)
        const expected = {
            pylos: [insertAction(position, turn, player), commitAction(player)],
            ui: [unselectAction()]
        }
        expect(actual).toEqual(expected)
      })

      test('isLiftable', () => {
        board = insert ([3,0,0], 1) (board)
        board = insert ([3,0,1], 2) (board)
        board = insert ([3,1,0], 2) (board)
        board = insert ([3,1,1], 1) (board)
        board = insert ([3,2,2], 1) (board)
        const position = [3,2,2]
        const turn = 1
        const actual = handlePositionClick (player, { board, turn }, {}) (position)
        const expected = {
            ui: [selectAction(position)]
        }
        expect(actual).toEqual(expected)
      })

      test('blocked ball generates no action', () => {
        board = insert ([3,0,0], 1) (board)
        board = insert ([3,0,1], 2) (board)
        board = insert ([3,1,0], 2) (board)
        board = insert ([3,1,1], 1) (board)
        board = insert ([2,0,0], 1) (board)
        const position = [3,0,0]
        const turn = 1
        const actual = handlePositionClick (player, { board, turn }, {}) (position)
        const expected = {}
        expect(actual).toEqual(expected)
      })

      test('floating position generates no action', () => {
        const position = [2,0,0]
        const turn = 1
        const actual = handlePositionClick (player, { board, turn }, {}) (position)
        const expected = {}
        expect(actual).toEqual(expected)
      })
    })
  })
})
