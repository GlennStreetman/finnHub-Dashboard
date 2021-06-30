import { AppState, dashBoardData } from './../../App'
import { StockObj } from './../../types'
import produce from "immer"

export const updateGlobalStockList = async function (event: Event, stockRef: string, stockObj: StockObj | Object = {}) {
    //if no stock object passed, remove from global stock list, else add.
    const s: AppState = this.state;
    const currentStockObj = { ...s.globalStockList };
    if (currentStockObj[stockRef] === undefined) {
        currentStockObj[stockRef] = { ...stockObj };
        currentStockObj[stockRef]["dStock"] = function (ex: string) {
            if (ex.length === 1) {
                return this.symbol;
            } else {
                return this.key;
            }
        };
    } else {
        delete currentStockObj[stockRef];
    }

    let updateCurrentDashboard: dashBoardData = await produce(s.dashBoardData, (draftState: dashBoardData) => {
        draftState[s.currentDashBoard].globalstocklist = currentStockObj
    })


    const payload: Partial<AppState> = {
        globalStockList: currentStockObj,
        dashBoardData: updateCurrentDashboard
    }
    this.setState(payload, () => {
        this.saveDashboard(s.currentDashBoard)
    });



    event instanceof Event === true && event.preventDefault();
}