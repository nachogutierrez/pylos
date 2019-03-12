
// distance to CENTER of first ball
const PCT_OFFSET = 0.2853
const PCT_UNIT = 0.1265
const PCT_CUP = 0.1

/*
 2*PCT_OFFSET is the offset area
 divided by 3 because there are 3 spacing areas
*/
const PCT_SPACING = (1 - 2*PCT_OFFSET)/3
const PCT_BORDER_RADIUS = 0.0441
const PCT_BORDER_OFFSET = 0.0588

module.exports = {
    colors: {
        BALL_PLAYER_1: '#e6b800',
        BALL_PLAYER_2: '#892a59',
        BOARD: '#862d2d',
        BOARD_BORDER: '#732626',
        PYLOS_TEXT: '#917a15',
        SELECTED: 'rgba(255,255,255,0.5)'
    },
    proportions: {
        PCT_OFFSET,
        PCT_UNIT,
        PCT_CUP,
        PCT_SPACING,
        PCT_BORDER_RADIUS,
        PCT_BORDER_OFFSET
    }
}
