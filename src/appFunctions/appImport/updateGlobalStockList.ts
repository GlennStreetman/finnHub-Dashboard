import { AppState, dashBoardData } from './../../App'
import { StockObj } from './../../types'
import produce from "immer"

export const updateGlobalStockList = async function (stockRef: string, dashBoardData, currentDashBoard: string, updateAppState: Function, stockObj: StockObj | Object = {},) {
    //Adds/removes a single stock from global stock list and updates current dashboard. if no stock object passed, remove from global stock list, else add.
    // console.log('updating global', stockObj)
    const globalStockList = dashBoardData[currentDashBoard].globalstocklist
    const currentStockObj = { ...globalStockList };
    if (currentStockObj[stockRef] === undefined) {
        currentStockObj[stockRef] = { ...stockObj };
    } else {
        delete currentStockObj[stockRef];
    }

    let updateCurrentDashboard = produce(dashBoardData, (draftState: dashBoardData) => {
        draftState[currentDashBoard].globalstocklist = currentStockObj
    })

    const payload = {
        dashBoardData: updateCurrentDashboard
    }
    await updateAppState(payload)
    // event instanceof Event === true && event.preventDefault();
    return true
}

export const setNewGlobalStockList = async function (replacementGlobalList, currentDashboard, dashboardData, updateAppState) {
    //replaces global stock list with new global stock list.
    const dbData = dashboardData
    let updateCurrentDashboard = produce(dbData, (draftState: dashBoardData) => {
        draftState[currentDashboard].globalstocklist = replacementGlobalList
    })

    const newFocus = replacementGlobalList[Object.keys(replacementGlobalList)[0]] ? replacementGlobalList[Object.keys(replacementGlobalList)[0]].key : ''

    const payload = {
        dashBoardData: updateCurrentDashboard,
    }

    await updateAppState(payload)
    return newFocus
}