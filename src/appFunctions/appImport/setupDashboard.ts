import produce from "immer"

import { AppState, globalStockList, widgetList, dashBoardData } from './../../App'
import { uniqueObjectnName } from './../stringFunctions'



export const setupDashboardObject = async function (target: string, newGlobalList: globalStockList, newWidgetList: widgetList) {
    //setup global security list and widgets.
    this.setState(() => {
        const update: Partial<AppState> = {
            globalStockList: newGlobalList,
            currentDashBoard: target,
        }
        return update
    });
}

export const NewDashboard = function newDashboard(newName, dashboards) {
    const testname = newName ? newName : 'DASHBOARD'
    const uniqueName = uniqueObjectnName(testname, dashboards)
    this.setState(() => {
        const update: Partial<AppState> = {
            currentDashBoard: uniqueName,
            globalStockList: {},
            // widgetList: {},
            zIndex: [],
        }
        return update
    }, async () => {
        let savedDash: boolean = await this.saveDashboard(uniqueName) //saves dashboard setup to server
        if (savedDash === true) {
            let returnedDash: dashBoardData = await this.getSavedDashBoards() //get saved dashboard data
            const savedDashboard = returnedDash.dashBoardData[uniqueName]
            //skip redux for now, not needed if no widgets and no stocks
            const newDashboardObj = await produce(this.state.dashBoardData, (draftState: dashBoardData) => {
                draftState[uniqueName] = savedDashboard
                return draftState
            })
            this.setState({
                dashBoardData: newDashboardObj
            })
        }
    })
}

export const saveDashboard = async function (dashboardName: string) {
    //saves current dashboard by name. Assigns new widget ids if using new name (copy function). Returns true on success.
    //throttled to save at most once every 5 seconds.
    const now = Date.now()
    if (this.state.enableDrag === true) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.saveDashboard(dashboardName) //try again
    } else if (this.state.saveDashboardFlag === false && now - this.state.saveDashboardThrottle > 5000) {
        console.log('starting save')
        this.setState({
            saveDashboardThrottle: now,
            saveDashboardFlag: true,
        }, async () => {

            await new Promise(resolve => setTimeout(resolve, 5000));
            const widgList: widgetList = this.state.dashBoardData[this.state.currentDashBoard] ? this.state.dashBoardData[this.state.currentDashBoard].widgetlist : {}
            const saveWidgetList: widgetList = await produce(widgList, (draftState: widgetList) => {
                if (Object.keys(this.state.dashBoardData).indexOf(dashboardName) === -1) { //if new name, copy current widgets.
                    const stamp = new Date().getTime()
                    const keys = Object.keys(widgList)
                    for (const k in keys) {
                        draftState[stamp + k] = draftState[keys[k]]
                        draftState[stamp + k]['widgetID'] = stamp + k
                        draftState[stamp + k].trackedStocks = {}
                        delete draftState[keys[k]]
                    }
                    return draftState
                }
            })
            this.setState({ saveDashboardFlag: false })
            let status = await new Promise((res) => {
                const data = {
                    dashBoardName: dashboardName,
                    globalStockList: this.state.globalStockList,
                    widgetList: saveWidgetList,
                    menuList: this.state.menuList,
                };
                const options = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                };
                fetch("/dashBoard", options) //posts that data to be saved.
                    .then(res => res.json())
                    .then((data) => {
                        res(true)
                    })
                    .catch((err) => {
                        console.log("dashboard save error: ", err)
                        res(false)
                    })
            })
            return status
        })
    } else if (this.state.saveDashboardFlag === false && now - this.state.saveDashboardThrottle < 5000) {
        //if not updating but flag not set to true, suspend save and try again after timer.
        console.log('retry save')
        const waitPeriod = 5000 - (now - this.state.saveDashboardThrottle) > 0 ? 5000 - (now - this.state.saveDashboardThrottle) : 1000
        await new Promise(resolve => setTimeout(resolve, waitPeriod));
        return this.saveDashboard(dashboardName) //try again
    } else { //save is already running suspend. 
        console.log('save already in process', this.state.saveDashboardFlag, now - this.state.saveDashboardThrottle, now, this.state.saveDashboardThrottle)
        return true
    }
}