import React from "react";
import StockDataList from "./stockDataList";
import { connect } from "react-redux";
import ToolTip from './toolTip.js'
import { tGetSymbolList } from "../slices/sliceExchangeData";
import { UpdateDefaultExchange } from "src/appFunctions/appImport/updateDefaultExchange"
import { updateGlobalStockList } from "src/appFunctions/appImport/updateGlobalStockList"
import { UpdateWidgetStockList } from "src/appFunctions/appImport/widgetLogic";

import { widgetProps } from 'src/components/widgetContainer'

import { useAppDispatch, useAppSelector } from 'src/hooks';
const useDispatch = useAppDispatch
const useSelector = useAppSelector

//compnoent used when searching for a stock via "Add stock to watchlist" on top bar or any widget searches.
export function StockSearchPane(p: widgetProps) {

    const dispatch = useDispatch(); //allows widget to run redux actions
    const defaultExchange = useSelector((state) => { return state.defaultExchange })
    const exchangeList = useSelector((state) => { return state.exchangeList.exchangeList })
    const exchangeData = useSelector((state) => { return state.exchangeData.e.data })
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const stockKey: string = p.searchText.slice(0, p.searchText.indexOf(":"))
    const stockObj = exchangeData?.[stockKey] ? exchangeData?.[stockKey] : false

    // componentDidMount(){
    //     const p = this.props
    //     if (p.defaultExchange !== p.currentExchange){
    //     p.tGetSymbolList({exchange: p.defaultExchange, apiKey: p.apiKey, finnHubQueue: p.finnHubQueue})
    //     }
    // }

    function handleChange(e) {
        // console.log('changed to:', e.target.value)
        p.changeSearchText(e.target.value.toUpperCase())
    }

    function changeDefault(e) {
        UpdateDefaultExchange(dispatch, e.target.value, p.appState.finnHubQueue, true)
        e.preventDefault()
    }

    let widgetKey = p.widgetKey;
    const exchangeOptions = exchangeList.map((el) =>
        <option key={el} value={el}>{el}</option>
    )
    const helpText = <>
        Select Exchange to search. <br />
        Click manage account to update exchange list.<br />
        Enter stock name or symbol to search for stocks.
    </>
    const helpText2 = <>
        Enter stock name or symbol to search for stocks. <br />
    </>
    return (
        <div className="stockSearch" data-testid={`stockSearchPane-${p.widgetList.widgetType}`}>
            <form
                className="form-stack"
                onSubmit={(e) => { //submit stock to be added/removed from global & widget stocklist.
                    e.preventDefault();
                    if (widgetKey === 'watchListMenu' && stockObj) {
                        updateGlobalStockList(e, stockKey, stockObj, dashboardData, currentDashboard);
                    } else if (typeof p.widgetKey === 'number' && stockObj) { //Not menu widget. Menus named, widgets numbered.
                        UpdateWidgetStockList(p.widgetKey, stockKey, stockObj, p.appState, p.setAppState);
                    } else {
                        console.log(`invalid stock selection:`, p.searchText);
                    }
                }}
            >
                <ToolTip textFragment={exchangeList.length > 1 ? helpText : helpText2} hintName='sspe2' />
                {exchangeList.length > 1 && <>
                    {/* <ToolTip textFragment={helpText} hintName='sspe' /> */}
                    {/* <label htmlFor="exchangeList">Exchange:</label> */}
                    <select value={defaultExchange} name='exchangeList' onChange={changeDefault}>
                        {exchangeOptions}
                    </select></>
                }


                <label htmlFor="stockSearch">Security: </label>
                <input
                    size={18}
                    autoComplete="off"
                    className="btn"
                    type="text"
                    id="stockSearch"
                    list={`${p.widgetKey}-dataList`}
                    value={p.searchText}
                    onChange={handleChange}
                    data-testid={`searchPaneValue-${p.widgetList.widgetType}`}
                />
                <datalist id={`${p.widgetKey}-dataList`} data-testid={`searchPaneOption-${p.widgetList.widgetType}`} >
                    <StockDataList
                        defaultExchange={defaultExchange}
                        inputText={p.searchText}
                    />
                </datalist>
                <input className="btn" type="submit" value="Submit" data-testid={`SubmitSecurity-${p.widgetList.widgetType}`} />
            </form>
        </div>
    );
}

// const mapStateToProps = (state, ownProps) => {

//     const p = ownProps
//     const thisExchange = state.exchangeData.e?.data
//     const inputSymbol = p.searchText.slice(0, p.searchText.indexOf(":"))
//     const updateStock = thisExchange !== undefined ? thisExchange[inputSymbol] : {}
//     const currentExchange = state.exchangeData.e.ex
//     return {
//         rUpdateStock: updateStock,
//         currentExchange: currentExchange,
//     }
// }

// export default connect(mapStateToProps, { tGetSymbolList })(StockSearchPane);

export function searchPaneProps(p) {
    const propList = {
        ...p
    };
    return propList;
}

export default StockSearchPane