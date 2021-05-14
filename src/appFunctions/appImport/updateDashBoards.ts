import { AppState, AppProps } from './../../App'
import { rBuildDataModelPayload } from './../../slices/sliceDataModel'
import { dashBoardData } from './../../App'

export const updateDashBoards = function (data: dashBoardData) {
    const p: AppProps = this.props
    const s: AppState = this.state
    //{dashboardData, currentDashBoard, menuList}
    this.setState(data, async () => {
        const payload: rBuildDataModelPayload = {
            apiKey: s.apiKey,
            dashBoardData: s.dashBoardData
        }
        p.rBuildDataModel(payload)
    })
}