
import { sliceMenuList } from './../../slices/sliceMenuList'
import { sliceDashboardData } from './../../slices/sliceDashboardData'

interface serverData { //replace after route is conerted to typescript
    savedDashBoards: any,
    menuSetup: any,
    default: any,
    message: string,
}

export interface GetSavedDashBoardsRes {
    dashboardData: sliceDashboardData
    currentDashBoard: string
    menuList: sliceMenuList
    message?: string
}

const blankDashboard = {
    dashboardData: {
        NEW: {
            dashboardname: 'NEW',
            globalstocklist: {},
            widgetlist: {},
        }
    },
    currentDashBoard: 'NEW',
    menuList: {
        "WatchListMenu": { 'showBody': true, "column": 0, "columnOrder": -3, "widgetConfig": "menuWidget", "widgetHeader": "WatchList", "widgetID": "WatchListMenu", "widgetType": "WatchListMenu", "xAxis": "5rem", "yAxis": "5rem" },
        "DashBoardMenu": { 'showBody': true, "column": 0, "columnOrder": -2, "widgetConfig": "menuWidget", "widgetHeader": "Saved Dashboards", "widgetID": "DashBoardMenu", "widgetType": "DashBoardMenu", "xAxis": "5rem", "yAxis": "5rem" },
        "GQLMenu": { 'showBody': true, "column": 0, "columnOrder": -1, "widgetConfig": "menuWidget", "widgetHeader": "Graph QL", "widgetID": "GQLMenu", "widgetType": "GQLMenu", "xAxis": "5rem", "yAxis": "5rem" },
    },
    message: 'No saved dashboards'
}

export const GetSavedDashBoards = async function getSavedDashBoards() {
    // console.log('getting saved dashboards')
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
            delete parseDashBoard[dash].widgetlist['null']
        }
        const menuList: sliceMenuList = {}
        for (const menu in data.menuSetup) {
            menuList[menu] = data.menuSetup[menu]
        }

        const noDashboards = Object.keys(parseDashBoard).length === 0 ? true : false
        const defaultDash = parseDashBoard[data.default] ? data.default : parseDashBoard[Object.keys(parseDashBoard)[0]]

        const GetSavedDashboardsRes: any = noDashboards ? blankDashboard : {
            dashboardData: parseDashBoard,
            currentDashBoard: defaultDash,
            menuList: menuList,
            message: 'ok'
        }
        return (GetSavedDashboardsRes)

    } else if (res.status === 201) {
        console.log('returning blank dashboard', blankDashboard)
        return (blankDashboard)
    } else {
        return (blankDashboard)
    }
}