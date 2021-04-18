import React, { PureComponent } from 'react'
import { connect } from "react-redux";

class CsvUpload extends PureComponent {
    
    componentDidMount(){
        console.log("UPLOAD LIST RUNNING")
        const p = this.props
        p.uploadGlobalStockList(p.rUpdateObj)
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
        // console.log(stock, exchange)
        const updateStock = state.exchangeData.e.ex === exchange ? {...state.exchangeData.e.data[stock]} : 'pass'
        // console.log('updateStock', updateStock)
        if (updateStock !== 'pass') {
            updateObj[stock] = updateStock
            updateObj[stock].dStock = function(ex){
                //pass in exchange list
                if (ex.length === 1) {
                    return (this.symbol)
                } else {
                    return (this.key)
                }
            }
        }
    }
    return {rUpdateObj: updateObj}
}
export default connect(mapStateToProps)(CsvUpload);
