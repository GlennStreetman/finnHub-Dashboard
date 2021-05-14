import { AppProps, AppState, globalStockList, widgetList } from './../../App'
import { rSetTargetDashboardPayload } from './../../slices/sliceShowData'
import { setUpdateStatus } from './../../slices/sliceDataModel'
import { reqObj } from './../../thunks/thunkFetchFinnhub'

export const loadSavedDashboard = function (target: string, globalStockList: globalStockList, widgetList: widgetList) {
    const p: AppProps = this.props
    const payload: rSetTargetDashboardPayload = { targetDashboard: target }
    this.props.rSetTargetDashboard(payload)
    this.loadDashBoard(globalStockList, widgetList);
    const updateVisable = async function (that: any) {
        const s: AppState = that.state
        await that.props.tGetMongoDB()
        //set updating
        const status: setUpdateStatus = {
            [s.currentDashBoard]: 'Updating'
        }
        p.rSetUpdateStatus(status)
        //get dashboard
        const finnHubPayload: reqObj = {
            targetDashBoard: s.currentDashBoard,
            widgetList: Object.keys(s.dashBoardData[s.currentDashBoard].widgetlist),
            finnHubQueue: s.finnHubQueue,
        }
        await that.props.tGetFinnhubData(finnHubPayload)
        //set ready
        const statusReady: setUpdateStatus = {
            [s.currentDashBoard]: 'Ready'
        }
        p.rSetUpdateStatus(statusReady)
    }
    updateVisable(this)
}