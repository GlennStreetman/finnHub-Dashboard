import produce from "immer"

import { AppState, } from './../../App'
import { sliceMenuList } from './../../slices/sliceMenuList'
import { sliceDashboardData, widgetList } from './../../slices/sliceDashboardData'
import { uniqueObjectnName } from './../stringFunctions'


const saveNewDashboard = async (uniqueName, menuList) => {
    let status = await new Promise((res) => {
        const data = {
            dashBoardName: uniqueName,
            globalStockList: {},
            widgetList: {},
            menuList: menuList,
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
}

export const NewDashboard = function newDashboard(newName: string, dashboards: sliceDashboardData, rSetDashboardData: Function) {
    console.log('creating new dashboard')
    const testname = newName ? newName : 'DASHBOARD'
    const uniqueName = uniqueObjectnName(testname, dashboards)
    this.props.rUpdateCurrentDashboard(uniqueName)
    this.setState(() => {
        const update: Partial<AppState> = {
            zIndex: [],
        }
        return update
    }, async () => {
        await saveNewDashboard(uniqueName, this.state.menuList) //saves dashboard setup to server
        let returnedDash: sliceDashboardData = await this.getSavedDashBoards() //get saved dashboard data
        const savedDashboard = returnedDash.dashboardData[uniqueName]
        //skip redux for now, not needed if no widgets and no stocks
        const newDashboardObj = produce(this.props.dashboardData, (draftState: sliceDashboardData) => {
            draftState[uniqueName] = savedDashboard
            return draftState
        })
        rSetDashboardData(newDashboardObj)
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
        this.setState({
            saveDashboardThrottle: now,
            saveDashboardFlag: true,
        }, async () => {
            await new Promise(resolve => setTimeout(resolve, 5000));
            this.setState({ saveDashboardFlag: false })
            let status = await new Promise((res) => {
                if (this.state.login === 1) {
                    const data = {
                        dashBoardName: dashboardName,
                        globalStockList: this.props.dashboardData[this.props.currentDashboard].globalstocklist,
                        widgetList: this.props.dashboardData[this.props.currentDashboard].widgetlist,
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
                }
            })
            return status
        })
    } else if (this.state.saveDashboardFlag === false && now - this.state.saveDashboardThrottle < 5000) {
        //if not updating but flag not set to true, suspend save and try again after timer.

        const waitPeriod = 5000 - (now - this.state.saveDashboardThrottle) > 0 ? 5000 - (now - this.state.saveDashboardThrottle) : 1000
        await new Promise(resolve => setTimeout(resolve, waitPeriod));
        return this.saveDashboard(dashboardName) //try again
    } else { //save is already running suspend. 
        return new Promise(resolve => resolve(true))
    }
}

export const copyDashboard = async function (copyName: string) {
    const widgList: widgetList = this.props.dashboardData[copyName].widgetlist
    const newWidgetList: widgetList = produce(widgList, (draftState: widgetList) => {
        console.log('saving dashboard copy', widgList)
        const stamp = new Date().getTime()
        const keys = Object.keys(widgList)
        for (const k in keys) {
            draftState[stamp + k] = draftState[keys[k]]
            draftState[stamp + k]['widgetID'] = stamp + k
            draftState[stamp + k].trackedStocks = {}
            delete draftState[keys[k]]
        }
        // return draftState
    })
    const uniqueName = uniqueObjectnName(copyName, this.props.dashboardData)
    let status = await new Promise((res) => {
        const data = {
            dashBoardName: uniqueName,
            globalStockList: {},
            widgetList: newWidgetList,
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
}