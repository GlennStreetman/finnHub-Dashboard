
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
            message: 'No Saved dashboards returned'
        }
        return (GetSavedDashboardsRes)
    } else {
        const GetSavedDashboardsRes: GetSavedDashBoardsRes = {
            dashBoardData: {},
            currentDashBoard: '',
            menuList: {},
            message: 'Problem retrieving saved dashboards2'
        }
        return (GetSavedDashboardsRes)
    }
}