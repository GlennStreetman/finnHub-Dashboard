

export const toggleBackGroundMenu = function (menu: string, updateAppState: Function, backgroundMenu: string) {
    if (menu === "") {
        updateAppState({
            backGroundMenu: menu,
            showStockWidgets: 1,
        })
    } else if (backgroundMenu !== menu) {
        updateAppState({
            backGroundMenu: menu,
            showStockWidgets: 0
        })
    } else {
        updateAppState({
            backGroundMenu: "",
            showStockWidgets: 1
        })
    }
}