
import { GetSavedDashBoards, GetSavedDashBoardsRes } from "./appImport/getSavedDashboards";
import { rSetDashboardData } from './../slices/sliceDashboardData'
import { rUpdateCurrentDashboard } from './../slices/sliceCurrentDashboard'
import { rSetMenuList } from "./../slices/sliceMenuList";
import { rSetTargetDashboard } from "./../slices/sliceShowData";
import { rBuildDataModel } from "./../slices/sliceDataModel";


export const rebuildDashboardState = async function (dispatch: Function, apiKey: string) { //fetches dashboard data, then updates dashboardData, then builds redux model.
    // console.log('running rebuild')
    try {
        const data: GetSavedDashBoardsRes = await GetSavedDashBoards()
        if ((data.dashboardData[data.currentDashBoard] === undefined && Object.keys(data.dashboardData))) { //if invalid current dashboard returned
            console.log('invalid dashboard')
            data.currentDashBoard = Object.keys(data.dashboardData)[0]
        }
        dispatch(rSetDashboardData(data.dashboardData))
        dispatch(rUpdateCurrentDashboard(data.currentDashBoard))
        dispatch(rSetMenuList(data.menuList))
        dispatch(rSetTargetDashboard({ targetDashboard: data.currentDashBoard })) //update target dashboard in redux dataModel
        dispatch(rBuildDataModel({ ...data, apiKey: apiKey }))
        if (data.message === 'No saved dashboards') { return (true) } else { return (false) }

    } catch (error: any) {
        console.error("Failed to recover dashboards", error);
        return false
    }
}