import React, { PureComponent } from 'react'
import { connect } from "react-redux";

class CsvUpload extends PureComponent {
    
    componentDidMount(){

        const p = this.props
        // p.uploadGlobalStockList(p.rUpdateObj)
        p.setNewGlobalStockList(p.rUpdateObj)
        p.resetUploadList()       
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
