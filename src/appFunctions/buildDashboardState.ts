import { rUpdateCurrentDashboard } from 'src/slices/sliceCurrentDashboard'
import { rSetMenuList, } from 'src/slices/sliceMenuList' //sliceMenuList
import { rResetUpdateFlag, rSetUpdateStatus, } from "src/slices/sliceDataModel"; //sliceDataModel, rRebuildTargetDashboardModel 
import { tGetFinnhubData, tgetFinnHubDataReq } from "src/thunks/thunkFetchFinnhub";
import { tGetMongoDB } from "src/thunks/thunkGetMongoDB";
import { tGetSavedDashboards } from 'src/thunks/thunkGetSavedDashboards'
import { rSetDashboardData, } from 'src/slices/sliceDashboardData' //sliceDashboardData

export async function buildDashboardState(dispatch, apiKey, dashboardData, currentDashboard, finnHubQueue) { //fetches dashboard data, then updates p.dashboardData, then builds redux model.
    try {
        const data: any = await dispatch(tGetSavedDashboards({ apiKey: apiKey })).unwrap()
        dispatch(rUpdateCurrentDashboard(data.currentDashBoard))
        dispatch(rSetMenuList(data.menuList))
        dispatch(rSetDashboardData(data.dashBoardData))
        dispatch(rResetUpdateFlag()) //sets all dashboards status to updating in redux store.
        await dispatch(tGetMongoDB())

        const targetDash: string[] = dashboardData?.[currentDashboard]?.widgetlist ? Object.keys(dashboardData?.[currentDashboard]?.widgetlist) : []
        for (const widget in targetDash) {
            const payload: tgetFinnHubDataReq = { //get data for default dashboard.
                dashboardID: dashboardData[currentDashboard].id,
                targetDashBoard: currentDashboard,
                widgetList: [targetDash[widget]],
                finnHubQueue: finnHubQueue,
                rSetUpdateStatus: rSetUpdateStatus,
                dispatch: dispatch,
            }
            dispatch(tGetFinnhubData(payload))
        }
        const dashBoards: string[] = Object.keys(dashboardData) //get data for dashboards not being shown
        for (const dash of dashBoards) {
            if (dash !== currentDashboard) {
                const payload: tgetFinnHubDataReq = { //run in background, do not await.
                    dashboardID: dashboardData[dash].id,
                    targetDashBoard: dash,
                    widgetList: Object.keys(dashboardData[dash].widgetlist),
                    finnHubQueue: finnHubQueue,
                    rSetUpdateStatus: rSetUpdateStatus,
                    dispatch: dispatch,
                }
                await dispatch(tGetFinnhubData(payload))
            }
        }

    } catch (error: any) {
        console.error("Failed to recover dashboards");
    }
}