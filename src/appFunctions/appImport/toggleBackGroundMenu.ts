import { AppState, setApp } from './../../App'

export const toggleBackGroundMenu = function (menu: string, set: setApp) {
    if (menu === "") {
        set.setBackGroundMenuFlag(menu)
        set.setShowStockWidgets(1)
    } else if (this.state.backGroundMenu !== menu) {
        set.setBackGroundMenuFlag(menu)
        set.setShowStockWidgets(0)
    } else {
        set.setBackGroundMenuFlag('')
        set.setShowStockWidgets(1)
    }
}