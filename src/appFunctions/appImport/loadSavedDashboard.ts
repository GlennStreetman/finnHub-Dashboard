import { AppProps, AppState } from './../../App'
import { rSetTargetDashboardPayload } from './../../slices/sliceShowData'
import { tgetFinnHubDataReq } from './../../thunks/thunkFetchFinnhub'

export const loadSavedDashboard = function (target: string) {
    console.log('loading saved dashboard')
    const p: AppProps = this.props
    const payload: rSetTargetDashboardPayload = { targetDashboard: target }
    this.props.rSetTargetDashboard(payload)
    console.log('setting state')
    this.setState({
        currentDashBoard: target,
        targetSecurity: Object.keys(this.state.dashBoardData[target].globalstocklist)[0],
    })
    console.log('state set')
    const updateVisable = async function (that: any) {
        const s: AppState = that.state
        console.log('getting mongo', new Date())
        await that.props.tGetMongoDB({ dashboard: s.dashBoardData[s.currentDashBoard].id })
        console.log('mongo got', new Date())
        const finnHubPayload: tgetFinnHubDataReq = {
            dashboardID: s.dashBoardData[s.currentDashBoard].id,
            targetDashBoard: s.currentDashBoard,
            widgetList: Object.keys(s.dashBoardData[s.currentDashBoard].widgetlist),
            finnHubQueue: s.finnHubQueue,
            rSetUpdateStatus: p.rSetUpdateStatus,
        }
        console.log('getting finnHub')
        await that.props.tGetFinnhubData(finnHubPayload)
        console.log('finnhub got')
    }
    updateVisable(this)
}