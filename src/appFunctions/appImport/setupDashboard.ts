import produce from "immer"

import { AppState, setApp } from './../../App'
import { sliceDashboardData, widgetList, rSetDashboardData } from './../../slices/sliceDashboardData'
import { uniqueObjectnName } from './../stringFunctions'
import { GetSavedDashBoards } from "./getSavedDashboards";

// import { rSetUpdateStatus, rRebuildTargetWidgetModel, } from "./../../slices/sliceDataModel";
import { useAppDispatch, useAppSelector } from './../../hooks';

import { rUpdateCurrentDashboard } from './../../slices/sliceCurrentDashboard'

const useDispatch = useAppDispatch
const useSelector = useAppSelector


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

export const NewDashboard = async function (newName: string, dashboards: sliceDashboardData, setZIndex: Function) {

    const dispatch = useDispatch(); //allows widget to run redux actions.
    const menuList = useSelector((state) => { return state.menuList })
    const dashboardData = useSelector((state) => { return state.dashboardData })

    console.log('creating new dashboard')
    const testname = newName ? newName : 'DASHBOARD'
    const uniqueName = uniqueObjectnName(testname, dashboards)
    dispatch(rUpdateCurrentDashboard(uniqueName))
    setZIndex([])

    await saveNewDashboard(uniqueName, menuList) //saves dashboard setup to server
    let returnedDash: sliceDashboardData = await GetSavedDashBoards() //get saved dashboard data
    const savedDashboard = returnedDash.dashboardData[uniqueName]
    //skip redux for now, not needed if no widgets and no stocks
    const newDashboardObj = produce(dashboardData, (draftState: sliceDashboardData) => {
        draftState[uniqueName] = savedDashboard
        return draftState
    })
    dispatch(rSetDashboardData(newDashboardObj))
}

export const SaveDashboard = async function (dashboardName: string, AppState: AppState, setApp: setApp) {
    //saves current dashboard by name. Assigns new widget ids if using new name (copy function). Returns true on success.
    //throttled to save at most once every 5 seconds.
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const menuList = useSelector((state) => { return state.menuList })

    const now = Date.now()
    if (AppState.enableDrag === true) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return SaveDashboard(dashboardName, AppState, setApp) //try again
    } else if (AppState.saveDashboardFlag === false && now - AppState.saveDashboardThrottle > 5000) {
        setApp.setSaveDashboardThrottle(now)
        setApp.setSaveDashboardThrottle(true)

        await new Promise(resolve => setTimeout(resolve, 5000));
        setApp.setSaveDashboardFlag(false)
        let status = await new Promise((res) => {
            if (AppState.login === 1) {
                const data = {
                    dashBoardName: dashboardName,
                    globalStockList: dashboardData[currentDashboard].globalstocklist,
                    widgetList: dashboardData[currentDashboard].widgetlist,
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
            }
        })
        return status
    } else if (AppState.saveDashboardFlag === false && now - AppState.saveDashboardThrottle < 5000) {
        //if not updating but flag not set to true, suspend save and try again after timer.

        const waitPeriod = 5000 - (now - AppState.saveDashboardThrottle) > 0 ? 5000 - (now - AppState.saveDashboardThrottle) : 1000
        await new Promise(resolve => setTimeout(resolve, waitPeriod));
        return SaveDashboard(dashboardName, AppState, setApp) //try again
    } else { //save is already running suspend. 
        return new Promise(resolve => resolve(true))
    }
}

export const CopyDashboard = async function (copyName: string) {

    const dashboardData = useSelector((state) => { return state.dashboardData })
    const menuList = useSelector((state) => { return state.menuList })

    const widgList: widgetList = dashboardData[copyName].widgetlist
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
    const uniqueName = uniqueObjectnName(copyName, dashboardData)
    let status = await new Promise((res) => {
        const data = {
            dashBoardName: uniqueName,
            globalStockList: {},
            widgetList: newWidgetList,
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