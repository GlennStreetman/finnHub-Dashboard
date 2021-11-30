import React, { PureComponent } from 'react'
import { connect } from "react-redux";
import { setNewGlobalStockList } from 'src/appFunctions/appImport/updateGlobalStockList'
import { rSetTargetSecurity } from 'src/slices/sliceTargetSecurity'
import { tSaveDashboard } from 'src/thunks/thunkSaveDashboard'



class CsvUpload extends PureComponent {

    componentDidMount() {

        async function runComponent() {
            const [focus, dashboardData] = await setNewGlobalStockList(this.props.rUpdateObj, this.props.currentDashboard, this.props.dashboardData)
            this.props.dispatch(this.props.rSetDashboardData(dashboardData))
            this.props.dispatch(this.props.rSetTargetSecurity(focus))
            this.props.resetUploadList()
            this.props.tSaveDashboard(this.props.currentDashboard)
        }
        runComponent()
    }

    render() {
        return (
            <></>
        )
    }
}
const mapStateToProps = (state, ownProps) => {
    const p = ownProps
    const ul = p.uploadList
    const updateObj = {}
    console.log("MAPPING")
    for (const s in ul) { //stock in uploadlist
        const stock = ul[s]
        const exchange = stock.slice(0, stock.indexOf('-'))
        const updateStock = state.exchangeData.e.ex === exchange ? { ...state.exchangeData.e.data[stock] } : 'pass'
        if (updateStock !== 'pass') {
            updateObj[stock] = updateStock
        }
    }
    return { rUpdateObj: updateObj }
}
export default connect(mapStateToProps, { rSetTargetSecurity, tSaveDashboard })(CsvUpload);
