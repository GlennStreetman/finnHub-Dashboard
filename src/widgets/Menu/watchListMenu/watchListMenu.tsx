import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle, } from "react";
import produce from 'immer'
import { tgetQuotePrices } from '../../../thunks/thunkGetQuotePrices'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";
import { dashBoardData } from 'src/App'

import Papa from 'papaparse'
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import CsvUpload from './csvUpload'
import ToolTip from '../../../components/toolTip.js'
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { dStock } from '../../../appFunctions/formatStockSymbols'

import { updateGlobalStockList } from 'src/appFunctions/appImport/updateGlobalStockList'
import { syncGlobalStockList } from 'src/appFunctions/appImport/syncGlobalStockList'

import { rSetTargetSecurity } from 'src/slices/sliceTargetSecurity'
import { rSetDashboardData } from 'src/slices/sliceDashboardData'

interface props {
    showEditPane: number,
    dashBoardData: dashBoardData,
    currentDashBoard: string,
    apiKey: string,
    exchangeList: string[],
    defaultExchange: string,
    helpText: string,
    finnHubQueue: finnHubQueue,
    targetSecurity: string,
    updateAppState: Function,
    saveDashboard: Function,
    rebuildVisableDashboard: Function,
}

function WatchListMenu(p: props, ref: any) {

    const useDispatch = useAppDispatch
    const useSelector = useAppSelector

    const startingUploadList: string[] = []

    const [uploadList, setUploadList] = useState(startingUploadList)
    const inputReference = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch(); //allows widget to run redux actions
    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        return state.quotePrice.quote
    })

    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
        //add additional slices of state to list if they help reduce re-render time.
        {
            state: {},
        }
    ))

    useEffect(() => {

        const globalStockList = p.dashBoardData?.[p.currentDashBoard]?.globalstocklist ? p.dashBoardData?.[p.currentDashBoard].globalstocklist : {}
        if (Object.keys(globalStockList).length !== 0) {
            for (const stock in globalStockList) {
                dispatch(tgetQuotePrices({
                    stock: globalStockList[stock],
                    apiKey: p.apiKey,
                    throttle: p.finnHubQueue
                }))
            }
        }
    }, [p.apiKey, p.finnHubQueue, dispatch, p.currentDashBoard, p.dashBoardData])

    function returnKey(key) {
        const retVal = key !== undefined ? key["currentPrice"] : "noDat"
        return retVal
    }

    function setWidgetFocus(key) {
        const updatedDashboardData: dashBoardData = produce(p.dashBoardData, (draftState: dashBoardData) => {
            const wList = draftState[p.currentDashBoard].widgetlist
            for (const x in wList) {
                const widget = wList[x]
                if (widget.trackedStocks[key]) widget.config['targetSecurity'] = key
            }
        })
        p.updateAppState({
            dashBoardData: updatedDashboardData,
        })
        dispatch(rSetTargetSecurity(key))
    }

    function renderWatchedStocks() {

        const g = p.dashBoardData?.[p.currentDashBoard]?.globalstocklist ? p.dashBoardData?.[p.currentDashBoard].globalstocklist : {}
        if (g && Object.keys(g) !== undefined) {
            const stockListKey = Object.keys(g).map((el) => (
                <tr key={el + "row"}>
                    {p.showEditPane === 0 &&
                        <>
                            <td className='centerTE'><input
                                type="radio"
                                key={el + 'radio'}
                                checked={p.targetSecurity === g[el].key}
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
                                {dStock(g[el], p.exchangeList)}
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
                                        const newDash = await updateGlobalStockList(el, p.dashBoardData, p.currentDashBoard, p.updateAppState);
                                        dispatch(rSetDashboardData(newDash))
                                        p.saveDashboard(p.currentDashBoard)
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
                                    <button className="ui button" onClick={async () => {
                                        const [focus, newDashboard] = await syncGlobalStockList(p.dashBoardData, p.currentDashBoard)
                                        dispatch(rSetDashboardData(newDashboard))
                                        dispatch(rSetTargetSecurity(focus))
                                        p.rebuildVisableDashboard()
                                        p.saveDashboard(p.currentDashBoard) //saves dashboard setup to server
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
                    currentDashboard={p.currentDashBoard}
                    dashboardData={p.dashBoardData}
                    saveDashboard={p.saveDashboard}
                    rSetTargetSecurity={rSetTargetSecurity}
                    rSetDashboardData={rSetDashboardData}
                    dispatch={dispatch}
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
        dashBoardData: that.props.dashBoardData,
        currentDashBoard: that.props.currentDashboard,
        apiKey: that.props.apiKey,
        exchangeList: that.props.exchangeList,
        defaultExchange: that.props.defaultExchange,
        helpText: [helpText, 'WLM'],
        targetSecurity: that.props.targetSecurity,
        finnHubQueue: that.props.finnHubQueue,
        updateAppState: that.props.updateAppState,
        saveDashboard: that.props.saveDashboard,
        rebuildVisableDashboard: that.props.rebuildVisableDashboard,
    };
    return propList;
}

