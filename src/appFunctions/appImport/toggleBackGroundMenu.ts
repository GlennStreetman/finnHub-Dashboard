import { AppState, setApp } from './../../App'

export const ToggleBackGroundMenu = function (menu: string, appState: AppState, set: setApp) {
    if (menu === "") {
        set.setBackGroundMenuFlag(menu)
        set.setShowStockWidgets(1)
    } else if (appState.backGroundMenuFlag !== menu) {
        set.setBackGroundMenuFlag(menu)
        set.setShowStockWidgets(0)
    } else {
        set.setBackGroundMenuFlag('')
        set.setShowStockWidgets(1)
    }
}