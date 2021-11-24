import React from "react";
import StockDataList from "./stockDataList";
import { connect } from "react-redux";
import ToolTip from './toolTip.js'
import { tGetSymbolList } from "../slices/sliceExchangeData";
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";
import { stock } from 'src/App'
import { reqObj } from 'src/slices/sliceExchangeData'
import { UpdateWidgetStockList } from 'src/appFunctions/appImport/widgetLogic'
import { dashBoardData } from 'src/App'
import { rBuildDataModel } from 'src/slices/sliceDataModel'
import { useAppDispatch } from 'src/hooks';

const useDispatch = useAppDispatch
//compnoent used when searching for a stock via "Add stock to watchlist" on top bar or any widget searches.

interface props {
    apiKey: string,
    changeSearchText: Function,
    defaultExchange: string,
    exchangeList: string[],
    finnHubQueue: finnHubQueue,
    searchText: string,
    updateGlobalStockList: Function,
    widgetKey: string,
    widgetType: string,
    tGetSymbolList: Function,
    currentExchange: String,
    rUpdateStock: stock,
    updateAppState: Function
    dashBoardData: dashBoardData,
    currentDashboard: string,
}

function StockSearchPane(p: props) {

    const dispatch = useDispatch(); //allows widget to run redux actions.

    // useEffect(() => {
    //     if (p.defaultExchange !== p.currentExchange) {
    //         tGetSymbolList({ exchange: p.defaultExchange, apiKey: p.apiKey, finnHubQueue: p.finnHubQueue })
    //     }
    // }, [])


    function handleChange(e) {

        // console.log('changed to:', e.target.value)
        p.changeSearchText(e.target.value.toUpperCase())
    }

    function changeDefault(event) {
        event.preventDefault()
        p.updateAppState({ defaultExchange: event.target.value })
        const tGetSymbolObj: reqObj = {
            exchange: event.target.value,
            apiKey: p.apiKey,
            finnHubQueue: p.finnHubQueue,
        }
        p.tGetSymbolList(tGetSymbolObj)

    }

    let widgetKey = p.widgetKey;
    const exchangeOptions = p.exchangeList.map((el) =>
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
        <div className="stockSearch" data-testid={`stockSearchPane-${p.widgetType}`}>
            <form
                className="form-stack"
                onSubmit={(e) => { //submit stock to be added/removed from global & widget stocklist.
                    e.preventDefault();
                    if (p.rUpdateStock !== undefined && widgetKey === 'watchListMenu') {
                        // console.log('ADDING SECURITY TO WIDGET: ', p.rUpdateStock)
                        const thisStock = p.rUpdateStock
                        const stockKey = thisStock.key
                        p.updateGlobalStockList(e, stockKey, thisStock);
                    } else if (typeof widgetKey === 'number' && p.rUpdateStock !== undefined) { //Not menu widget. Menus named, widgets numbered.
                        // console.log('ADDING SECURITY TO WIDGET: ', p.rUpdateStock)
                        const thisStock = p.rUpdateStock
                        const stockKey = thisStock.key
                        const update = UpdateWidgetStockList(widgetKey, stockKey, p.dashBoardData, p.currentDashboard, thisStock);
                        p.updateAppState(update)
                            .then(() => {
                                const payload = {
                                    apiKey: p.apiKey,
                                    dashBoardData: p.dashBoardData
                                }
                                dispatch(rBuildDataModel(payload))
                            })

                    } else {
                        console.log(`invalid stock selection:`, p.rUpdateStock, p.searchText);
                    }
                }}
            >
                <ToolTip textFragment={p.exchangeList.length > 1 ? helpText : helpText2} hintName='sspe2' />
                {p.exchangeList.length > 1 && <>
                    {/* <ToolTip textFragment={helpText} hintName='sspe' /> */}
                    {/* <label htmlFor="exchangeList">Exchange:</label> */}
                    <select value={p.defaultExchange} name='exchangeList' onChange={changeDefault}>
                        {exchangeOptions}
                    </select></>
                }


                <label htmlFor="stockSearch">Security: </label>
                <input size={18}
                    autoComplete="off"
                    className="btn"
                    type="text"
                    id="stockSearch"
                    list={`${p.widgetKey}-dataList`}
                    value={p.searchText}
                    onChange={handleChange}
                    data-testid={`searchPaneValue-${p.widgetType}`}
                />
                <datalist id={`${p.widgetKey}-dataList`} data-testid={`searchPaneOption-${p.widgetType}`} >
                    <StockDataList
                        defaultExchange={p.defaultExchange}
                        inputText={p.searchText}
                    />
                </datalist>
                <input className="btn" type="submit" value="Submit" data-testid={`SubmitSecurity-${p.widgetType}`} />
            </form>
        </div>
    );
}

const mapStateToProps = (state, ownProps) => {

    const p = ownProps
    const thisExchange = state.exchangeData.e?.data
    const inputSymbol = p.searchText.slice(0, p.searchText.indexOf(":"))
    const updateStock = thisExchange !== undefined ? thisExchange[inputSymbol] : {}
    const currentExchange = state.exchangeData.e.ex
    return {
        rUpdateStock: updateStock,
        currentExchange: currentExchange,
    }
}

export default connect(mapStateToProps, { tGetSymbolList })(StockSearchPane);

export function searchPaneProps(p) {
    const propList = {
        apiKey: p.apiKey,
        changeSearchText: p.changeSearchText,
        defaultExchange: p.defaultExchange,
        exchangeList: p.exchangeList,
        finnHubQueue: p.finnHubQueue,
        searchText: p.searchText,
        updateGlobalStockList: p.updateGlobalStockList,
        widgetKey: p.widgetKey,
        widgetType: p.widgetType,
        updateAppState: p.updateAppState,
        dashBoardData: p.dashBoardData,
        currentDashboard: p.currentDashBoard,
    };
    return propList;
}
