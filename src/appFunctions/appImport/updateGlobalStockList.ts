import { AppState, dashBoardData } from './../../App'
import { StockObj } from './../../types'
import produce from "immer"

export const updateGlobalStockList = async function (event: Event, stockRef: string, stockObj: StockObj | Object = {}) {
    //Adds/removes a single stock from global stock list and updates current dashboard. if no stock object passed, remove from global stock list, else add.
    console.log('updating global', stockObj)
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
    let updateCurrentDashboard: dashBoardData = produce(dbData, (draftState: dashBoardData) => {
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

export const setNewGlobalStockList = function (replacementGlobalList) {
    //replaces global stock list with new global stock list. Updates state.dashboardData[]currentDash].globalStockList. Saves changes, sets new focus.
    console.log('replaceing global stock list.')
    const oldState: AppState = this.state;
    const dbData = oldState.dashBoardData
    let updateCurrentDashboard: dashBoardData = produce(dbData, (draftState: dashBoardData) => {
        draftState[this.state.currentDashBoard].globalstocklist = replacementGlobalList
    })

    const newFocus = replacementGlobalList[Object.keys(replacementGlobalList)[0]] ? replacementGlobalList[Object.keys(replacementGlobalList)[0]].key : ''

    const payload: Partial<AppState> = {
        globalStockList: replacementGlobalList,
        dashBoardData: updateCurrentDashboard,
        targetSecurity: newFocus,
    }

    this.setState(payload, () => {
        this.saveDashboard(this.state.currentDashBoard)
    })
}