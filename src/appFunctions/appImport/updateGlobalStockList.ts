import { AppState, dashBoardData } from './../../App'
import { StockObj } from './../../types'
import produce from "immer"

export const updateGlobalStockList = async function (event: Event, stockRef: string, stockObj: StockObj | Object = {}) {
    //if no stock object passed, remove from global stock list, else add.
    console.log('updating global')
    const currentStockObj = { ...this.state.globalStockList };
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

    const oldState: AppState = this.state;
    const dbData = oldState.dashBoardData
    let updateCurrentDashboard: dashBoardData = await produce(dbData, (draftState: dashBoardData) => {
        draftState[this.state.currentDashBoard].globalstocklist = currentStockObj
    })


    const payload: Partial<AppState> = {
        globalStockList: currentStockObj,
        dashBoardData: updateCurrentDashboard
    }
    this.setState(payload, () => {
        this.saveDashboard(this.state.currentDashBoard)
    });



    event instanceof Event === true && event.preventDefault();
}