import * as React from "react"
import { useState, useMemo, forwardRef, useRef } from "react";
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { convertCamelToProper } from '../../../appFunctions/stringFunctions'

import { useDragCopy } from './../../widgetHooks/useDragCopy'

import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'

import { dStock } from './../../../appFunctions/formatStockSymbols'

const useDispatch = useAppDispatch
const useSelector = useAppSelector

// interface FinnHubAPIData {
//     buzz: Object,
//     companyNewsScore: number,
//     sectorAverageBullishPercent: number,
//     sectorAverageNewsScore: number,
//     sentiment: Object,
//     symbol: string
// }

function FundamentalsNewsSentiment(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else if (p?.config?.targetSecurity) {
                return (p?.config?.targetSecurity)
            } else {
                return ('')
            }
        }
    }

    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state.showData.dataSet[p.widgetKey][p.config.targetSecurity]
            return (showData)
        }
    })

    const focusSecurityList = useMemo(() => { //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity] //Object.keys(p.trackedStocks)
    }, [p?.config?.targetSecurity]) //[p.trackedStocks])

    useDragCopy(ref, {})//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.

    useSearchMongoDb(p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security  

    function updateWidgetList(stock) {
        if (stock.indexOf(":") > 0) {
            const stockSymbol = stock.slice(0, stock.indexOf(":"));
            p.updateWidgetStockList(p.widgetKey, stockSymbol);
        } else {
            p.updateWidgetStockList(p.widgetKey, stock);
        }
    }

    function renderSearchPane() {
        const stockList = Object.keys(p.trackedStocks);
        let stockListRows = stockList.map((el) =>
            p.showEditPane === 1 ? (
                <tr key={el + "container"}>
                    <td className="centerTE" key={el + "buttonC"}>
                        <button
                            data-testid={`remove-${el}`}
                            key={el + "button"}
                            onClick={() => {
                                updateWidgetList(el);
                            }}
                        >
                            <i className="fa fa-times" aria-hidden="true" key={el + "icon"}></i>
                        </button>
                    </td>
                    <td className='centerTE' key={el + "name"}>{dStock(p.trackedStocks[el], p.exchangeList)}</td>
                    <td className='leftTE'>{p.trackedStocks[el].description}</td>
                </tr>
            ) : (
                <tr key={el + "pass"}></tr>
            )
        );
        let stockListTable = (
            <div className='scrollableDiv'>
                <table className='dataTable'>
                    <thead>
                        <tr>
                            <td>Remove</td>
                            <td>Symbol</td>
                            <td>Name</td>
                        </tr>
                    </thead>
                    <tbody>{stockListRows}</tbody>
                </table>
            </div>
        );
        return <>{stockListTable}</>;
    }

    function changeStockSelection(e) {
        const target = e.target.value;
        p.updateWidgetConfig(p.widgetKey, {
            targetSecurity: target,
        })
    }

    function renderStockData() {
        const newSymbolList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {dStock(p.trackedStocks[el], p.exchangeList)}
            </option>
        ))

        const dataRows = typeof rShowData === 'object' ? Object.entries(rShowData).map((el) => {
            if (typeof el[1] !== 'object') {
                return (
                    <tr key={`${el[0]}-${el[1]}`}>
                        <td className="rightTE" key={`${el[0]}-${el[1]}2`}    >{convertCamelToProper(el[0])}:&nbsp;&nbsp;   </td>
                        <td className="centerTE" key={`${el[0]}-${el[1]}3`}   >{el[1]}</td>
                    </tr>
                )
            } else { return (<tr key={`${el[0]}-${el[1]}4`}></tr>) }
        }) : <></>

        const stockTable =
            <>
                <select className="btn" value={p.config.targetSecurity} onChange={changeStockSelection}>
                    {newSymbolList}
                </select>
                <br />
                <table className='dataTable'>
                    <thead><tr><td>Metrics</td><td>Value</td></tr></thead>
                    <tbody>{dataRows}</tbody>
                </table>
            </>
        return stockTable
    }

    return (
        <div data-testid='newsSentimentBody'>
            {p.showEditPane === 1 && (
                <>
                    {React.createElement(StockSearchPane, searchPaneProps(p))}
                    {renderSearchPane()}
                </>
            )}
            {p.showEditPane === 0 && (
                <>
                    {renderStockData()}
                </>
            )}
        </div>
    )
}

export default forwardRef(FundamentalsNewsSentiment)

export function newsSentimentsProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateWidgetConfig: that.props.updateWidgetConfig,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}

