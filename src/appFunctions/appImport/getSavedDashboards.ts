
import { menuList, dashBoardData } from './../../App'

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

const blankDashboard = {
    dashBoardData: {
        NEW: {
            dashboardname: 'NEW',
            globalstocklist: {},
            widgetlist: {},
        }
    },
    currentDashBoard: 'NEW',
    menuList: { "watchListMenu": { "column": 0, "columnOrder": -1, "widgetConfig": "menuWidget", "widgetHeader": "WatchList", "widgetID": "watchListMenu", "widgetType": "watchListMenu", "xAxis": "5rem", "yAxis": "5rem" }, "dashBoardMenu": { "column": 0, "columnOrder": -1, "widgetConfig": "menuWidget", "widgetHeader": "Saved Dashboards", "widgetID": "dashBoardMenu", "widgetType": "dashBoardMenu", "xAxis": "5rem", "yAxis": "5rem" } },
    message: 'No saved dashboards'
}

export const GetSavedDashBoards = async function getSavedDashBoards() {
    let res = await fetch("/dashBoard")
    let data: serverData = await res.json()

    if (res.status === 200) {
        let parseDashBoard = data.savedDashBoards
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

        const noDashboards = Object.keys(parseDashBoard).length === 0 ? true : false
        const defaultDash = parseDashBoard[data.default] ? data.default : parseDashBoard[Object.keys(parseDashBoard)[0]]

        const GetSavedDashboardsRes: GetSavedDashBoardsRes = noDashboards ? blankDashboard : {
            dashBoardData: parseDashBoard,
            currentDashBoard: defaultDash,
            menuList: menuList,
            message: 'ok'
        }
        return (GetSavedDashboardsRes)

    } else if (res.status === 401) {
        console.log(401)
        return (blankDashboard)
    } else {
        return (blankDashboard)
    }
}