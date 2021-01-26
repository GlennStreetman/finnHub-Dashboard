import React, { PureComponent } from 'react'
import { connect } from "react-redux";

class CsvUpload extends PureComponent {
    
    componentDidMount(){
        
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
    updateObj['sKeys'] = function(){
        const stockList = Object.keys(this)
        const index = stockList.indexOf('sKeys')
        stockList.splice(index,1) 
        return stockList
    }
    for (const s in ul) { //stock in uploadlist
        const stock = ul[s]
        const exchange = stock.slice(0,stock.indexOf('-'))
        const updateStock = state.exchangeData[exchange] ? {...state.exchangeData[exchange][stock]} : 'pass'
        if (updateStock !== null) {
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
