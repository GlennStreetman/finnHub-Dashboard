import React, { PureComponent } from 'react'
import { connect } from "react-redux";
import {setNewGlobalStockList} from 'src/appFunctions/appImport/updateGlobalStockList'

class CsvUpload extends PureComponent {
    
    componentDidMount(){

        const that = this
        async function runComponent() {
            await setNewGlobalStockList(that.props.rUpdateObj, that.props.currentDashboard, that.props.dashboardData, that.props.updateAppState)
            that.props.resetUploadList()
            that.props.saveDashboard(that.props.currentDashboard)
        }      
        runComponent()
    }
    
    render() {
        return (
            <></>
        )
    }
}
const mapStateToProps =  (state, ownProps) => {
    const p = ownProps
    const ul = p.uploadList
    const updateObj = {}
    console.log("MAPPING")
    for (const s in ul) { //stock in uploadlist
        const stock = ul[s]
        const exchange = stock.slice(0,stock.indexOf('-'))
        const updateStock = state.exchangeData.e.ex === exchange ? {...state.exchangeData.e.data[stock]} : 'pass'
        if (updateStock !== 'pass') {
            updateObj[stock] = updateStock
        }
    }
    return {rUpdateObj: updateObj}
}
export default connect(mapStateToProps)(CsvUpload);
