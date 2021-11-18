import { AppState, AppProps } from './../../App'
import { StockObj } from './../../types'
import produce from "immer"
import { sliceDashboardData } from 'src/slices/sliceDashboardData'

export const updateGlobalStockList = async function (event: any, stockRef: string, stockObj: StockObj, dashboardData: sliceDashboardData, currentDashboard: string) {
    //Adds/removes a single stock from global stock list and updates current dashboard. if no stock object passed, remove from global stock list, else add.
    // console.log('updating global', stockObj)
    const newStockObj = stockObj

    const globalStockList = dashboardData[currentDashboard].globalstocklist
    const currentStockObj = { ...globalStockList };
    if (currentStockObj[stockRef] === undefined) {
        currentStockObj[stockRef] = newStockObj
    } else {
        delete currentStockObj[stockRef];
    }

    const oldProps: AppProps = this.props;
    const dbData = oldProps.dashboardData
    let updateCurrentDashboard: sliceDashboardData = produce(dbData, (draftState: sliceDashboardData) => {
        draftState[this.props.currentDashboard].globalstocklist = currentStockObj
    })
    this.props.rSetDashboardData(updateCurrentDashboard)
    event instanceof Event === true && event.preventDefault();
}

export const setNewGlobalStockList = function (replacementGlobalList) {
    //replaces global stock list with new global stock list. Updates state.dashboardData[]currentDash].globalStockList. Saves changes, sets new focus.
    console.log('replaceing global stock list.')
    const oldProps: AppProps = this.props;
    const dbData = oldProps.dashboardData
    let updateCurrentDashboard: sliceDashboardData = produce(dbData, (draftState: sliceDashboardData) => {
        draftState[this.props.currentDashboard].globalstocklist = replacementGlobalList
    })
    this.props.rSetDashboardData(updateCurrentDashboard)

    const newFocus = replacementGlobalList[Object.keys(replacementGlobalList)[0]] ? replacementGlobalList[Object.keys(replacementGlobalList)[0]].key : ''
    this.props.rSetTargetSecurity(newFocus)

    this.saveDashboard(this.props.updateCurrentDashboard)
}