import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle, } from "react";
import produce from 'immer'
import { tgetQuotePrices } from '../../../thunks/thunkGetQuotePrices'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";
import { dashBoardData } from 'src/App'

import Papa from 'papaparse'
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPane";
import CsvUpload from './csvUpload'
import ToolTip from '../../../components/toolTip.js'
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { dStock } from '../../../appFunctions/formatStockSymbols'

// import { updateGlobalStockList } from 'src/appFunctions/appImport/updateGlobalStockList'
import { newGlobalStockList } from 'src/appFunctions/appImport/syncGlobalStockList'

import { rSetTargetSecurity } from 'src/slices/sliceTargetSecurity'
import { rSetDashboardData, rSetGlobalStockList } from 'src/slices/sliceDashboardData'
import { tSaveDashboard } from 'src/thunks/thunkSaveDashboard'
import { tSyncGlobalStocklist } from 'src/thunks/thunkSyncGlobalStockList'
import { tGetFinnhubData, tgetFinnHubDataReq } from "src/thunks/thunkFetchFinnhub";
import { rSetUpdateStatus } from "src/slices/sliceDataModel";
import { reqObj, tGetSymbolList } from 'src/slices/sliceExchangeData'
import { rRebuildTargetDashboardModel } from 'src/slices/sliceDataModel'

interface props {
    showEditPane: number,
    helpText: string,
    finnHubQueue: finnHubQueue,
}

function WatchListMenu(p: props, ref: any) {

    const useDispatch = useAppDispatch
    const useSelector = useAppSelector
    const dispatch = useDispatch(); //allows widget to run redux actions

    const startingUploadList: string[] = []
    const [uploadList, setUploadList] = useState(startingUploadList)
    const inputReference = useRef<HTMLInputElement>(null);
    const rShowData = useSelector((state) => { return state.quotePrice.quote })
    const apiKey = useSelector((state) => { return state.apiKey })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const exchangeList = useSelector((state) => { return state.exchangeList })
    const targetSecurity = useSelector((state) => { return state.targetSecurity })
    const stockDataExchange = useSelector(state => state.exchangeData.e.ex)
    const defaultExchange = useSelector((state) => state.defaultExchange)


    const globalStockList = useSelector((state) => {     //finnhub data stored in redux
        if (state.dashboardData?.[state.currentDashboard]) {
            const globalStockList = state.dashboardData[state.currentDashboard].globalstocklist
            return globalStockList
        } else {
            return ({})
        }
    })

    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
        //add additional slices of state to list if they help reduce re-render time.
        {
            state: {},
        }
    ))

    useEffect(() => { //update exchange data if not updating, on user input.
        if (
            apiKey !== '' &&
            defaultExchange !== stockDataExchange &&
            stockDataExchange !== 'updating' &&
            p.showEditPane === 1
        ) {
            const tGetSymbolObj: reqObj = {
                exchange: defaultExchange,
                apiKey: apiKey,
                finnHubQueue: p.finnHubQueue,
                dispatch: dispatch,
            }
            dispatch(tGetSymbolList(tGetSymbolObj))
        }
    }, [apiKey, defaultExchange, stockDataExchange, p.showEditPane])

    useEffect(() => { //get the quote prices for global stock list.
        if (Object.keys(globalStockList).length !== 0) {
            for (const stock in globalStockList) {
                dispatch(tgetQuotePrices({
                    stock: globalStockList[stock],
                    apiKey: apiKey,
                    throttle: p.finnHubQueue
                }))
            }
        }
    }, [apiKey, p.finnHubQueue, dispatch, globalStockList])

    function returnKey(key) {
        const retVal = key !== undefined ? key["currentPrice"] : "noDat"
        return retVal
    }

    function setWidgetFocus(key) {
        const updatedDashboardData: dashBoardData = produce(dashboardData, (draftState: dashBoardData) => {
            const wList = draftState[currentDashboard].widgetlist
            for (const x in wList) {
                const widget = wList[x]
                if (widget.trackedStocks[key]) widget.config['targetSecurity'] = key
            }
        })
        dispatch(rSetDashboardData(updatedDashboardData))
        dispatch(rSetTargetSecurity(key))
    }

    function renderWatchedStocks() {

        const g = dashboardData?.[currentDashboard]?.globalstocklist ? dashboardData?.[currentDashboard].globalstocklist : {}
        if (g && Object.keys(g) !== undefined) {
            const stockListKey = Object.keys(g).map((el) => (
                <tr key={el + "row"}>
                    {p.showEditPane === 0 &&
                        <>
                            <td className='centerTE'><input
                                type="radio"
                                key={el + 'radio'}
                                checked={targetSecurity === g[el].key}
                                onChange={() => {
                                    setWidgetFocus(g[el].key)
                                }} /></td>
                            <td className="rightTEFade" key={el + "prc" + returnKey(rShowData[el])}>
                                {rShowData[el] ? (
                                    rShowData[el] !== undefined &&
                                    rShowData[el].toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })
                                ) : (
                                    <></>
                                )}
                            </td>
                            <td className='centerTE' key={el + "symb"}>
                                {dStock(g[el], exchangeList)}
                            </td>
                            <td className="leftTE" key={el + 'desc'}>
                                {g[el].description}
                            </td>
                        </>
                    }
                    {p.showEditPane === 1 &&
                        <>
                            <td className="centerTE" key={el + "rmv"}>
                                <button
                                    key={el + "clck"}
                                    onClick={async (e) => {
                                        e.preventDefault()
                                        dispatch(rSetGlobalStockList({
                                            stockRef: el,
                                            currentDashboard: currentDashboard,
                                            stockObj: false,
                                        }))
                                        dispatch(tSaveDashboard({ dashboardName: currentDashboard }))
                                    }}
                                >
                                    <i className="fa fa-times" aria-hidden="true"></i>
                                </button>
                            </td>
                            <td className="centerTE">{g[el]['exchange']}</td>
                            <td className="centerTE">{g[el]['symbol']}</td>
                            <td className="leftTE">{g[el]['description']}</td>
                            <td className="centerTE">{g[el]['currency']}</td>
                            <td className="leftTE">{g[el]['figi']}</td>
                            <td className="rightTE">{g[el]['mic']}</td>
                        </>
                    }
                </tr>
            )
            );

            return <>{stockListKey}</>;
        } else {
            return <></>
        }

    }

    function fileUploadAction() {
        if (inputReference.current !== null) inputReference.current.click();
    }

    function resetUploadList() {
        setUploadList([])
    }

    function fileUploadInputChange(e) {
        Papa.parse(e.target.files[0], {
            complete: function (results: { data: any }) {
                const newStockList: string[] = []
                for (const stock in results.data) {
                    if (results.data[stock][1] !== undefined) {
                        const thisStock: string = results.data[stock][0].toUpperCase() + '-' + results.data[stock][1].toUpperCase()
                        newStockList.push(thisStock)
                    }
                }
                setUploadList(newStockList)
            }
        });
    }

    const tab = { 'textIndent': '25px', }

    const helpText = <>
        Upload a .CSV file to load a new stock watchlist.<br />
        The CSV should contain two values per line: <br />
        <div style={tab}>  1. Exchange symbol <br /></div>
        <div style={tab}>2. Stock Symbol <br /></div>
        Example file shown below: <br />
        <div style={tab}>US, AAPL <br /></div>
        <div style={tab}>US, MSFT <br /></div>
        <div style={tab}>US, GOOGL <br /></div>
    </>

    const syncText = <>
        Set all widgets security list equal to Watchlist Menu security list.<br />
        Also useful after copying a dashboard and quickly updating all widgets with new security list. <br />
    </>

    return (
        <>
            {p.showEditPane === 1 && (
                <div style={{ width: '100%', backgroundColor: '#1d69ab' }}>
                    <table>
                        <tbody style={{}}>
                            <tr>
                                <td>
                                    <ToolTip textFragment={helpText} hintName='wl' /></td>
                                <td>
                                    <input type="file" hidden ref={inputReference} onChange={fileUploadInputChange} />
                                    <button className="ui button" onClick={fileUploadAction}>
                                        Upload
                                    </button>
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: 'inherit' }}>
                                <td>
                                    <ToolTip textFragment={syncText} hintName='sw' />
                                </td>
                                <td>
                                    <button className="ui button" onClick={async () => {
                                        const [focus, newDashboard] = await newGlobalStockList(dashboardData, currentDashboard)
                                        await dispatch(tSyncGlobalStocklist({
                                            dashboardData: newDashboard,
                                            targetSecurity: focus,
                                        }))
                                        // const payload: tgetFinnHubDataReq = {
                                        //     dashboardID: dashboardData[currentDashboard].id,
                                        //     targetDashBoard: currentDashboard,
                                        //     widgetList: Object.keys(dashboardData[currentDashboard].widgetlist),
                                        //     finnHubQueue: p.finnHubQueue,
                                        //     rSetUpdateStatus: rSetUpdateStatus,
                                        //     dispatch: dispatch,
                                        // }
                                        // dispatch(tGetFinnhubData(payload))
                                        dispatch(tSaveDashboard({ dashboardName: currentDashboard }))

                                    }}>
                                        Sync
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {p.showEditPane !== 1 && (<>{React.createElement(StockSearchPane, searchPaneProps(p))}</>)}


            <div className='scrollableDiv'>
                <table className='dataTable'>
                    <thead>
                        <tr>
                            {p.showEditPane === 0 &&
                                <>
                                    <td className="centerTE">Focus</td>
                                    <td className="centerTE">Price</td>
                                    <td className="centerTE">Symbol</td>
                                    <td className="centerTE">Name</td>
                                </>
                            }
                            {p.showEditPane === 1 &&
                                <>
                                    <td className="centerTE">Remove</td>
                                    <td className="centerTE">Exchange</td>
                                    <td className="centerTE">Symbol</td>
                                    <td className="centerTE">Name</td>
                                    <td className="centerTE">Currency</td>
                                    <td className="centerTE">FIGI</td>
                                    <td className="centerTE">MIC</td>
                                </>
                            }
                        </tr>
                    </thead>
                    <tbody>{renderWatchedStocks()}</tbody>
                </table>
            </div>
            {uploadList.length !== 0 && (
                <CsvUpload
                    uploadList={uploadList}
                    resetUploadList={resetUploadList}
                />
            )}
        </>
    );
}

export default forwardRef(WatchListMenu)

export function watchListMenuProps(that, key = "WatchListMenu") {
    const helpText = <>
        All stocks added to Watchlist become default stocks for new widgets. <br />
        Each stock on watchlist also opens a socket connection for steaming data.<br />
    </>

    let propList = {
        showEditPane: that.props.showEditPane,
        helpText: [helpText, 'WLM'],
        finnHubQueue: that.props.finnHubQueue,
    };
    return propList;
}

