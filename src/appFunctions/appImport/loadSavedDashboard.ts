import { AppProps, AppState } from './../../App'
import { rSetTargetDashboardPayload } from './../../slices/sliceShowData'
import { tgetFinnHubDataReq } from './../../thunks/thunkFetchFinnhub'

export const loadSavedDashboard = function (target: string) {
    const p: AppProps = this.props
    const payload: rSetTargetDashboardPayload = { targetDashboard: target }
    this.props.rSetTargetDashboard(payload)
    this.setState({
        currentDashboard: target,
        targetSecurity: Object.keys(this.state.dashBoardData[target].globalstocklist)[0],
    })
    const updateVisable = async function (that: any) {
        const s: AppState = that.state
        await that.props.tGetMongoDB({ dashboard: s.dashBoardData[p.currentDashboard].id })
        const finnHubPayload: tgetFinnHubDataReq = {
            dashboardID: s.dashBoardData[p.currentDashboard].id,
            targetDashBoard: p.currentDashboard,
            widgetList: Object.keys(s.dashBoardData[p.currentDashboard].widgetlist),
            finnHubQueue: s.finnHubQueue,
            rSetUpdateStatus: p.rSetUpdateStatus,
        }
        await that.props.tGetFinnhubData(finnHubPayload)
    }
    updateVisable(this)
}