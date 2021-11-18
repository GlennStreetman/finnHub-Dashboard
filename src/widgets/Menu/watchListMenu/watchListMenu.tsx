import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle } from "react";
import { tgetQuotePrices } from '../../../thunks/thunkGetQuotePrices'


import Papa from 'papaparse'
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import CsvUpload from './csvUpload.js'
import ToolTip from '../../../components/toolTip.js'
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { dStock } from '../../../appFunctions/formatStockSymbols'

import { widgetProps } from './../../../components/widgetContainer'

import { SetWidgetFocus } from "../../../appFunctions/appImport/widgetLogic";
import { rSetTargetSecurity } from "../../../slices/sliceTargetSecurity";
import { updateGlobalStockList } from "../../../appFunctions/appImport/updateGlobalStockList"
import { syncGlobalStockList } from "../../../appFunctions/appImport/syncGlobalStockList"

function WatchListMenu(p: widgetProps, ref: any) {

    const useDispatch = useAppDispatch
    const useSelector = useAppSelector

    const startingUploadList: string[] = []
    const [uploadList, setUploadList] = useState(startingUploadList)
    const inputReference = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch(); //allows widget to run redux actions
    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        return state.quotePrice.quote
    })

    const apiKey = useSelector((state) => { return state.apiKey })
    const apiAlias = useSelector((state) => { return state.apiAlias })
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const dataModel = useSelector((state) => { return state.dataModel })
    const menuList = useSelector((state) => { return state.menuList })
    const exchangeList = useSelector((state) => { return state.exchangeList.exchangeList })
    const defaultExchange = useSelector((state) => { return state.defaultExchange })
    const targetSecurity = useSelector((state) => { return state.targetSecurity })
    const globalStockList = dashboardData?.[currentDashboard]?.globalstocklist ? dashboardData[currentDashboard].globalstocklist : []

    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
        //add additional slices of state to list if they help reduce re-render time.
        {
            state: {},
        }
    ))

    useEffect(() => {
        if (Object.keys(globalStockList).length !== 0) {
            for (const stock in globalStockList) {
                dispatch(tgetQuotePrices({
                    stock: globalStockList[stock],
                    apiKey: apiKey,
                    throttle: p.appState.finnHubQueue
                }))
            }
        }
    }, [globalStockList, apiKey, p.appState.finnHubQueue, dispatch])

    function returnKey(key) {
        const retVal = key !== undefined ? key["currentPrice"] : "noDat"
        return retVal
    }

    function renderWatchedStocks() {

        // const p = this.props
        const g = globalStockList;
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
                                    SetWidgetFocus(dispatch, dashboardData, currentDashboard, g[el].key)
                                    dispatch(rSetTargetSecurity(g[el].key))
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
                                    onClick={(e) => {
                                        updateGlobalStockList(e, el, g[el], dashboardData, currentDashboard);
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
        console.log('file upload action')
        if (inputReference.current !== null) inputReference.current.click();
    }

    function resetUploadList() {
        console.log("List Uploaded", uploadList)
        setUploadList([])
    }

    function fileUploadInputChange(e) {
        // const that = this
        Papa.parse(e.target.files[0], {
            complete: function (results: { data: any }) {
                const newStockList: string[] = []
                for (const stock in results.data) {
                    if (results.data[stock][1] !== undefined) {
                        const thisStock: string = results.data[stock][0].toUpperCase() + '-' + results.data[stock][1].toUpperCase()
                        newStockList.push(thisStock)
                    }
                }
                console.log('newStockList', newStockList)
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
                                    <button className="ui button" onClick={() => {
                                        syncGlobalStockList(dispatch, dashboardData, currentDashboard, apiKey, p.appState.finnHubQueue, p.appState, p.setAppState)
                                    }
                                    }>
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
                // setNewGlobalStockList={p.setNewGlobalStockList}
                // uploadGlobalStockList={p.uploadGlobalStockList}
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
        helpText: [helpText, 'WLM'],
    };
    return propList;
}

