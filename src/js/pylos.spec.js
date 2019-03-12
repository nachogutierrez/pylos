const {
  isPlaceable,
  isLiftable,
  isBlocked,
  insert,
  createBoard
} = require('./pylos')

let board

beforeEach(() => {
  board = createBoard()
})

describe('#isPlaceable', () => {
  test('occupied position cant be placed', () => {
    board = insert ([3,0,0], 1) (board)
    expect(isPlaceable (board) ([3,0,0])).toBeFalsy()
  })

  test('empty position on level 3 can be placed', () => {
    expect(isPlaceable (board) ([3,0,0])).toBeTruthy()
  })

  test('empty position floating on air cant be placed', () => {
    expect(isPlaceable (board) ([2,0,0])).toBeFalsy()
  })

  test('empty position on top of base can be placed', () => {
    board = insert ([3,0,0], 1) (board)
    board = insert ([3,0,1], 1) (board)
    board = insert ([3,1,0], 1) (board)
    board = insert ([3,1,1], 1) (board)
    expect(isPlaceable (board) ([2,0,0])).toBeTruthy()
  })
})

describe('#isBlocked', () => {
  test('only ball', () => {
    board = insert ([3,0,0], 1) (board)
    expect(isBlocked (board) ([2,0,0])).toBeFalsy()
  })
})

describe('#isLiftable', () => {
  test('only ball cant lift', () => {
    board = insert ([3,0,0], 1) (board)
    expect(isLiftable (board) ([3,0,0])).toBeFalsy()
  })

  test('empty position cant lift', () => {
    expect(isLiftable (board) ([3,0,0])).toBeFalsy()
  })

  test('ball in square cant lift', () => {
    board = insert ([3,0,0], 1) (board)
    board = insert ([3,0,1], 1) (board)
    board = insert ([3,1,0], 1) (board)
    board = insert ([3,1,1], 1) (board)
    expect(isLiftable (board) ([3,1,1])).toBeFalsy()
  })

  test('blocked ball cant lift', () => {
    board = insert ([3,0,0], 1) (board)
    board = insert ([3,0,1], 1) (board)
    board = insert ([3,1,0], 1) (board)
    board = insert ([3,1,1], 1) (board)
    board = insert ([2,0,0], 1) (board)

    board = insert ([3,2,2], 1) (board)
    board = insert ([3,2,3], 1) (board)
    board = insert ([3,3,2], 1) (board)
    board = insert ([3,3,3], 1) (board)
    expect(isLiftable (board) ([3,0,0])).toBeFalsy()
    expect(isLiftable (board) ([3,0,1])).toBeFalsy()
    expect(isLiftable (board) ([3,1,0])).toBeFalsy()
    expect(isLiftable (board) ([3,1,1])).toBeFalsy()
  })

  test('unblocked ball can lift', () => {
    board = insert ([3,0,0], 1) (board)
    board = insert ([3,0,1], 1) (board)
    board = insert ([3,1,0], 1) (board)
    board = insert ([3,1,1], 1) (board)
    board = insert ([3,2,2], 1) (board)
    expect(isLiftable (board) ([3,2,2])).toBeTruthy()
  })
})
