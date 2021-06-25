
import { rBuildDataModelPayload } from './../../slices/sliceDataModel'
import { dashBoardData } from './../../App'

export const updateDashBoards = function (data: dashBoardData) {

    this.setState(data, async () => {
        const payload: rBuildDataModelPayload = {
            apiKey: this.state.apiKey,
            dashBoardData: this.state.dashBoardData
        }
        this.props.rBuildDataModel(payload)
    })
}