
import { rSetTargetDashboard, rSetTargetDashboardPayload } from './../../slices/sliceShowData'
import { tGetFinnhubData, tgetFinnHubDataReq } from './../../thunks/thunkFetchFinnhub'
import { rUpdateCurrentDashboard } from '../../slices/sliceCurrentDashboard'
import { rSetTargetSecurity } from '../../slices/sliceTargetSecurity'
import { tGetMongoDB } from './../../thunks/thunkGetMongoDB'
import { rSetUpdateStatus } from '../../slices/sliceDataModel'

import { useAppSelector, useAppDispatch } from './../../hooks';

export const LoadSavedDashboard = function (target: string, finnHubQueue) {

    const useSelector = useAppSelector
    const useDispatch = useAppDispatch
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const dashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })

    const payload: rSetTargetDashboardPayload = { targetDashboard: target }

    dispatch(rSetTargetDashboard(payload))
    dispatch(rUpdateCurrentDashboard(target))
    if (Object.keys(dashboardData[target].globalstocklist)[0]) {
        dispatch(rSetTargetSecurity(Object.keys(dashboardData[target].globalstocklist)[0]))
    } else {
        dispatch(rSetTargetSecurity(''))
    }

    const updateVisable = async function () {

        await tGetMongoDB({ dashboard: dashboardData[currentDashboard].id })
        const finnHubPayload: tgetFinnHubDataReq = {
            dashboardID: dashboardData[currentDashboard].id,
            widgetList: Object.keys(dashboardData[currentDashboard].widgetlist),
            finnHubQueue: finnHubQueue,
            rSetUpdateStatus: rSetUpdateStatus,
        }
        await tGetFinnhubData(finnHubPayload)
    }

    updateVisable()
}