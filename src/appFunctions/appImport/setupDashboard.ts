import produce from "immer"

import { AppState, globalStockList, widgetList, menuList, dashBoardData } from './../../App'

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

interface serverData { //replace after route is conerted to typescript
    savedDashBoards: any,
    menuSetup: any,
    default: any,
    message: string,
}

export interface GetSavedDashBoardsRes {
    dashBoardData: dashBoardData
    currentDashBoard: string
    menuList: menuList
    message?: string
}

export const GetSavedDashBoards = async function getSavedDashBoards() {
    let res = await fetch("/dashBoard")
    let data: serverData = await res.json()

    if (res.status === 200) {
        const parseDashBoard = data.savedDashBoards
        for (const dash in parseDashBoard) { //parse fields that are returned as strings.
            parseDashBoard[dash].globalstocklist = JSON.parse(parseDashBoard[dash].globalstocklist)
            const thisDash = parseDashBoard[dash].widgetlist
            for (const widget in thisDash) {
                thisDash[widget].filters = JSON.parse(thisDash[widget].filters)
                thisDash[widget].trackedStocks = JSON.parse(thisDash[widget].trackedStocks)
                thisDash[widget].config = JSON.parse(thisDash[widget].config)
            }
        }
        const menuList: menuList = {}
        for (const menu in data.menuSetup) {
            menuList[menu] = data.menuSetup[menu]
        }

        const GetSavedDashboardsRes: GetSavedDashBoardsRes = {
            dashBoardData: parseDashBoard,
            currentDashBoard: data.default,
            menuList: menuList,
            message: 'ok'
        }
        return (GetSavedDashboardsRes)

    } else if (res.status === 401) {
        console.log(401)
        const GetSavedDashboardsRes: GetSavedDashBoardsRes = {
            dashBoardData: {},
            currentDashBoard: '',
            menuList: {},
            message: 'Problem retrieving saved dashboards'
        }
        return (GetSavedDashboardsRes)
    } else {
        const GetSavedDashboardsRes: GetSavedDashBoardsRes = {
            dashBoardData: {},
            currentDashBoard: '',
            menuList: {},
            message: 'Problem retrieving saved dashboards'
        }
        return (GetSavedDashboardsRes)
    }
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

    return new Promise((res) => { //update type after route converted to typescript
        const data = {
            dashBoardName: dashboardName,
            globalStockList: s.globalStockList,
            widgetList: saveWidgetList,
            menuList: s.menuList,
        };

        console.log(saveWidgetList)

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
}