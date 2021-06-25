import produce from "immer"

import { AppState, globalStockList, widgetList } from './../../App'

export const LoadDashBoard = async function loadDashBoard(newGlobalList: globalStockList, newWidgetList: widgetList) {
    //setup global stock list.
    // console.log("HERE",newGlobalList, newWidgetList)
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
        }
        return update
    });
}

export const NewDashboard = function newDashboard() {
    //Does not save dashboard, just clears everything.
    const s: AppState = this.state
    s.finnHubQueue.resetQueue()
    this.setState(() => {
        const update: Partial<AppState> = {
            currentDashBoard: "",
            globalStockList: [],
            widgetList: {},
            zIndex: [],
        }
        return update
    })
}

export const SaveCurrentDashboard = async function saveCurrentDashboard(dashboardName: string) {
    //saves current dashboard by name. Assigns new widget ids if using new name.
    const s: AppState = this.state
    const saveWidgetList: widgetList = await produce(s.widgetList, (draftState: widgetList) => {
        if (Object.keys(s.dashBoardData).indexOf(dashboardName) === -1) {
            const stamp = new Date().getTime()
            const keys = Object.keys(s.widgetList)
            for (const k in keys) {
                draftState[stamp + k] = draftState[keys[k]]
                draftState[stamp + k]['widgetID'] = stamp + k
                delete draftState[keys[k]]
            }
            return draftState
        }
    })

    let status = await new Promise((res) => { //update type after route converted to typescript
        const data = {
            dashBoardName: dashboardName,
            globalStockList: s.globalStockList,
            widgetList: saveWidgetList,
            menuList: s.menuList,
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