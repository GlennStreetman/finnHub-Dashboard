import { AppState } from './../../App'

export const toggleBackGroundMenu = function (menu: string) {
    if (menu === "") {
        this.setState(() => {
            const update: Partial<AppState> = {
                backGroundMenu: menu,
                showStockWidgets: 1,
            }
            return update
        });
    } else if (this.state.backGroundMenu !== menu) {
        this.setState(() => {
            const update: Partial<AppState> = {
                backGroundMenu: menu,
                showStockWidgets: 0
            }
            return update
        });
    } else {
        this.setState(() => {
            const update: Partial<AppState> = {
                backGroundMenu: "",
                showStockWidgets: 1
            }
            return update
        });
    }
}