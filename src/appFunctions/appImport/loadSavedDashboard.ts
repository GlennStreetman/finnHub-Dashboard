import { AppProps, AppState } from './../../App'
import { rSetTargetDashboardPayload } from './../../slices/sliceShowData'
import { tgetFinnHubDataReq } from './../../thunks/thunkFetchFinnhub'

export const loadSavedDashboard = function (target: string) {

    const p: AppProps = this.props
    const payload: rSetTargetDashboardPayload = { targetDashboard: target }
    console.log('payload', payload)
    this.props.rSetTargetDashboard(payload)
    this.props.rUpdateCurrentDashboard(target)
    if (Object.keys(this.props.dashboardData[target].globalstocklist)[0]) {
        this.props.rSetTargetSecurity(Object.keys(this.props.dashboardData[target].globalstocklist)[0])
    } else {
        this.props.rSetTargetSecurity('')
    }
    const updateVisable = async function (that: any) {
        const s: AppState = that.state
        await that.props.tGetMongoDB({ dashboard: p.dashboardData[p.currentDashboard].id })
        const finnHubPayload: tgetFinnHubDataReq = {
            dashboardID: p.dashboardData[p.currentDashboard].id,
            widgetList: Object.keys(p.dashboardData[p.currentDashboard].widgetlist),
            finnHubQueue: s.finnHubQueue,
            rSetUpdateStatus: p.rSetUpdateStatus,
        }
        await that.props.tGetFinnhubData(finnHubPayload)
    }
    updateVisable(this)
}