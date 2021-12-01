import { dashBoardData } from './../../App'
import { StockObj } from './../../types'
import produce from "immer"

export const updateGlobalStockList = function (stockRef: string, dashBoardData, currentDashboard: string, stockObj: StockObj | Object = {},) {
    //Adds/removes a single stock from global stock list and updates current dashboard. if no stock object passed, remove from global stock list, else add.
    // console.log('updating global', stockObj)
    const globalStockList = dashBoardData[currentDashboard].globalstocklist
    const currentStockObj = { ...globalStockList };
    if (currentStockObj[stockRef] === undefined) {
        currentStockObj[stockRef] = { ...stockObj };
    } else {
        delete currentStockObj[stockRef];
    }

    let updateCurrentDashboard = produce(dashBoardData, (draftState: dashBoardData) => {
        draftState[currentDashboard].globalstocklist = currentStockObj
    })

    // event instanceof Event === true && event.preventDefault();
    return updateCurrentDashboard
}

export const setNewGlobalStockList = async function (replacementGlobalList, currentDashboard, dashboardData) {
    //replaces global stock list with new global stock list.
    console.log('updating global list csv', replacementGlobalList, currentDashboard, dashboardData)
    const dbData = dashboardData
    let updateCurrentDashboard = produce(dbData, (draftState: dashBoardData) => {
        draftState[currentDashboard].globalstocklist = replacementGlobalList
    })
    const newFocus = replacementGlobalList[Object.keys(replacementGlobalList)[0]] ? replacementGlobalList[Object.keys(replacementGlobalList)[0]].key : ''
    console.log('new dashboard', updateCurrentDashboard)
    return [newFocus, updateCurrentDashboard]
}