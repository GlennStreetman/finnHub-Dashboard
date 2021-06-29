import produce from "immer"

import { AppState, globalStockList, widgetList, dashBoardData } from './../../App'
import { uniqueObjectnName } from './../stringFunctions'



export const LoadDashBoard = async function loadDashBoard(target: string, newGlobalList: globalStockList, newWidgetList: widgetList) {
    //setup global security list and widgets.
    let updateGlobalList: globalStockList = await produce(newGlobalList, (draftState: globalStockList) => {
        for (const stock in draftState) {
            draftState[stock]['dStock'] = function (ex: string) {
                if (ex.length === 1) {
                    return (this.symbol)
                } else {
                    return (this.key)
                }
            }
        }
    })

    //setup widgets, and their individual stock lists.
    let updateWidgetList: widgetList = await produce(newWidgetList, (draftState: widgetList) => {
        for (const widget in draftState) {
            // console.log("1")
            const widgetStockObj = draftState[widget]
            const trackedStockObj = widgetStockObj.trackedStocks
            for (const stock in trackedStockObj) {
                trackedStockObj[stock]['dStock'] = function (ex: string) {
                    if (ex.length === 1) {
                        return (this.symbol)
                    } else {
                        return (this.key)
                    }
                }
            }
        }
        delete draftState.null
    })

    this.setState(() => {
        const update: Partial<AppState> = {
            globalStockList: updateGlobalList,
            widgetList: updateWidgetList,
            // currentDashBoard: target,
        }
        return update
    });
}

export const NewDashboard = function newDashboard(newName, dashboards) {
    const testname = newName ? newName : 'DASHBOARD'
    const uniqueName = uniqueObjectnName(testname, dashboards)
    const s: AppState = this.state
    s.finnHubQueue.resetQueue()
    this.setState(() => {
        const update: Partial<AppState> = {
            currentDashBoard: uniqueName,
            globalStockList: [],
            widgetList: {},
            zIndex: [],
        }
        return update
    }, async () => {
        let savedDash: boolean = await this.saveCurrentDashboard(uniqueName) //saves dashboard setup to server
        if (savedDash === true) {
            let returnedDash: dashBoardData = await this.getSavedDashBoards()
            this.updateDashBoards(returnedDash)
            if (Object.keys(s.globalStockList)[0] !== undefined) this.setSecurityFocus(Object.keys(s.globalStockList)[0])
        }
    })
}

export const SaveCurrentDashboard = async function saveCurrentDashboard(dashboardName: string) {
    //saves current dashboard by name. Assigns new widget ids if using new name.
    const widgList: widgetList = this.state.widgetList
    const saveWidgetList: widgetList = await produce(widgList, (draftState: widgetList) => {
        if (Object.keys(this.state.dashBoardData).indexOf(dashboardName) === -1) {
            const stamp = new Date().getTime()
            const keys = Object.keys(this.state.widgetList)
            for (const k in keys) {
                draftState[stamp + k] = draftState[keys[k]]
                draftState[stamp + k]['widgetID'] = stamp + k
                delete draftState[keys[k]]
            }
            return draftState
        }
    })

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
        fetch("/dashBoard", options)
            .then(res => res.json())
            .then((data) => {
                console.log("loading saved dashboards", data.message);
                res(true)
            })
            .catch((err) => {
                console.log("Problem returning saved dashboards", err)
                res(false)
            })
    })
    return status
}