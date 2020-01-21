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
    ID_DATA: 'data',
    ID_CONFIRM_BUTTON: 'confirm-button',
    ID_GAME_OVER_MESSAGE: 'game-over-message',
    ID_SHARE_BTN: 'share-btn',
    ID_COPIED_TO_CLIPBOARD_MESSAGE: 'copied-to-clipboard-message'
}

const get = id => document.getElementById(id)

const getPanel = side => document.querySelector(`#${ids.ID_INFO_PANEL} .ball-info.${side}`)
const getters = {
    getCanvas: () => get(ids.ID_CANVAS),
    getCanvasContainer: () => get(ids.ID_CANVAS_CONTAINER),
    getInfoPanel: () => get(ids.ID_INFO_PANEL),
    getData: () => get(ids.ID_DATA),
    getPanel,
    getPanelBallsLeft: side => getPanel(side).querySelector('.number'),
    getPanelBall: side => getPanel(side).querySelector('.ball'),
    getPanelNote: side => getPanel(side).querySelector('.note'),
    getConfirmButton: () => document.getElementById(ids.ID_CONFIRM_BUTTON),
    getGameOverMessage: () => document.getElementById(ids.ID_GAME_OVER_MESSAGE),
    getShareButton: () => document.getElementById(ids.ID_SHARE_BTN),
    getCopiedToClipboardMessage: () => document.getElementById(ids.ID_COPIED_TO_CLIPBOARD_MESSAGE)
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
