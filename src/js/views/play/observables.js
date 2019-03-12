const { fromEvent } = require('rxjs')
const { map, filter } = require('rxjs/operators')
const R = require('ramda')

const { empties, liftables } = require('../../pylos')
const { getSquare } = require('../../render')
const { getCanvas, sizeToUiValues } = require('./ui')
const { canRemoveLens, boardLens, sizeLens, selectedLens } = require('../../lenses')
const { sanitizeMouseEvent } = require('../../eventUtil')
const { circleContains } = require('../../geometry')

const getState = store => store.getState()

// canRemove :: Store => boolean
const canRemove = R.pipe(
    getState,
    R.view(canRemoveLens)
)

const getSelected = R.pipe(
  getState,
  R.view(selectedLens)
)

// getBoard :: Store => Board
const getBoard = R.pipe(
  getState,
  R.view(boardLens)
)

// getSize :: Store => number
const getSize = R.pipe(
  getState,
  R.view(sizeLens)
)

// getUiValues :: Store => UIValues
const getUiValues = R.pipe(
  getSize,
  sizeToUiValues
)

// getSquareAndPosition :: UIValues => Position => {square: Square, position: Position}
const getSquareAndPosition = uiValues => position => ({
    square: getSquare (uiValues) (position),
    position
})

// getPositionClicked :: (Board => [Position]) => (Store, Store) => Point => Position
const getPositionClicked = positionsCalculator => (pylosStore, uiStore) => point => R.pipe(
  getBoard, // Store => Board
  positionsCalculator, // Board => [Position]
  R.map(getSquareAndPosition (getUiValues(uiStore))), // [Position] => [{ square: Square, position: Position }]
  R.filter(({ square }) => circleContains (point) (square)), // [{ square: Square, position: Position }] => [{ square: Square, position: Position }]
  R.head, // [{ square: Square, position: Position }] => { square: Square, position: Position }
  R.prop('position') // { square: Square, position: Position } => Position
) (pylosStore)

// getEmptyPositionClicked :: (Store, Store) => Point => Position
const getEmptyPositionClicked = getPositionClicked (empties)

// getLiftableBallClicked :: (Store, Store) => Point => Position
const getLiftableBallClicked = getPositionClicked (liftables)

const getObservables = (pylosStore, uiStore) => {
    const canvas = getCanvas()

    // canvasClicks :: Stream(Point)
    const canvasClicks = fromEvent(canvas, 'click').pipe(
      map(sanitizeMouseEvent)
    )

    // removingClicks :: Stream(Point)
    const removingClicks = canvasClicks.pipe(
      filter(() => canRemove(uiStore))
    )

    // nonRemovingClicks :: Stream(Point)
    const nonRemovingClicks = canvasClicks.pipe(
      filter(() => !canRemove(uiStore))
    )

    // inserts :: Stream(Position)
    const inserts = nonRemovingClicks.pipe(
      filter(() => !getSelected(uiStore)),
      map(getEmptyPositionClicked (pylosStore, uiStore)),
      filter(R.identity)
    )

    // clickedLiftableBalls :: Stream(Position)
    const clickedLiftableBalls = nonRemovingClicks.pipe(
      map(getLiftableBallClicked (pylosStore, uiStore)),
      filter(R.identity)
    )

    const clickedSelectedLiftableBalls = clickedLiftableBalls.pipe(
      filter(() => getSelected(uiStore))
    )

    const clickedUnselectedLiftableBalls = clickedLiftableBalls.pipe(
      filter(() => !getSelected(uiStore))
    )

    const lifts = nonRemovingClicks.pipe(
      filter(() => getSelected(uiStore)),
      map(getEmptyPositionClicked (pylosStore, uiStore)),
      filter(R.identity),
      map(position => ({ from: getSelected(uiStore), to: position }))
    )

    return {
        canvasClicks,
        removingClicks,
        nonRemovingClicks,
        inserts,
        clickedLiftableBalls,
        clickedSelectedLiftableBalls,
        clickedUnselectedLiftableBalls,
        lifts
    }
}

module.exports = {
    getObservables
}
