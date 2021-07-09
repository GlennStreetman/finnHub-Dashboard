import { AppProps, AppState, globalStockList, widgetList } from './../../App'
import { rSetTargetDashboardPayload } from './../../slices/sliceShowData'
import { tgetFinnHubDataReq } from './../../thunks/thunkFetchFinnhub'

export const loadSavedDashboard = function (target: string, globalStockList: globalStockList, widgetList: widgetList) {
    const p: AppProps = this.props
    const payload: rSetTargetDashboardPayload = { targetDashboard: target }
    this.props.rSetTargetDashboard(payload)
    this.setupDashboardObject(target, globalStockList, widgetList);
    this.setState({
        currentDashBoard: target,
        targetSecurity: Object.keys(globalStockList)[0],
        globalStockList: globalStockList,
    })
    const updateVisable = async function (that: any) {
        const s: AppState = that.state
        await that.props.tGetMongoDB({ dashboard: that.state.currentDashBoard })
        const finnHubPayload: tgetFinnHubDataReq = {
            targetDashBoard: s.currentDashBoard,
            widgetList: Object.keys(s.dashBoardData[s.currentDashBoard].widgetlist),
            finnHubQueue: s.finnHubQueue,
            rSetUpdateStatus: p.rSetUpdateStatus,
        }
        await that.props.tGetFinnhubData(finnHubPayload)
    }
    updateVisable(this)
}