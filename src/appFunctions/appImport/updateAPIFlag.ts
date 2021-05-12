import { AppState } from './../../App'

export const updateAPIFlag = function (val: number) {
    if (val > 0) {
        this.setState(() => {
            const update: Partial<AppState> = {
                apiFlag: val,
                showStockWidgets: 0,
                backGroundMenu: "about",
            }
            return update
        });
    } else {
        this.setState(() => {
            const update: Partial<AppState> = {
                apiFlag: val
            }
            return update
        });
    }
}