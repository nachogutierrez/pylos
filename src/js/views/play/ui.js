const {
    proportions: {
        PCT_OFFSET,
        PCT_UNIT,
        PCT_CUP,
        PCT_SPACING,
        PCT_BORDER_RADIUS,
        PCT_BORDER_OFFSET
    }
} = require('../../constants')

const ids = {
    ID_CANVAS: 'canvas',
    ID_CANVAS_CONTAINER: 'canvas-container',
    ID_INFO_PANEL: 'info-panel',
    ID_DATA: 'data'
}

const get = id => document.getElementById(id)

const getters = {
    getCanvas: () => get(ids.ID_CANVAS),
    getCanvasContainer: () => get(ids.ID_CANVAS_CONTAINER),
    getInfoPanel: () => get(ids.ID_INFO_PANEL),
    getData: () => get(ids.ID_DATA)
}

const calculators = {
    sizeToUiValues: size => ({
        offset: size*PCT_OFFSET,
        unit: size*PCT_UNIT,
        cup: size*PCT_CUP,
        spacing: size*PCT_SPACING,
        borderRadius: size*PCT_BORDER_RADIUS,
        borderOffset: size*PCT_BORDER_OFFSET
    })
}

module.exports = {
    ...ids,
    ...getters,
    ...calculators
}
