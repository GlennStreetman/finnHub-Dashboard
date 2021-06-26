import * as React from "react"
import { useState, useMemo, forwardRef, useRef } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';

import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";

import { useDragCopy } from '../../widgetHooks/useDragCopy'
import { useTargetSecurity } from '../../widgetHooks/useTargetSecurity'
import { useSearchMongoDb } from '../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from '../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from '../../widgetHooks/useUpdateFocus'
import { useStartingFilters } from '../../widgetHooks/useStartingFilters'

const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface FinnHubAPIData {
    category: string,
    datetime: number,
    headline: string,
    id: number,
    image: string,
    related: string,
    source: string,
    summary: string,
    url: string
}

export interface FinnHubAPIDataArray {
    [index: number]: FinnHubAPIData
}

function FundamentalsCompanyNews(p: { [key: string]: any }, ref: any) {

    const isInitialMount = useRef(true); //update to false after first render.

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else { return -1 }
        }
    }

    const startingNewIncrementor = () => {
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.newsIncrementor)
        } else { return (1) }
    }

    const startingStartDate = () => { //save dates as offsets from now
        const now = Date.now()
        const startUnixOffset = p.filters.startDate !== undefined ? p.filters.startDate : -604800 * 1000 * 52
        const startUnix = now + startUnixOffset
        const startDate = new Date(startUnix).toISOString().slice(0, 10);
        return startDate
    }

    const startingEndDate = () => { //save dates as offsets from now
        const now = Date.now()
        const endUnixOffset = p.filters.startDate !== undefined ? p.filters.endDate : 0
        const endUnix = now + endUnixOffset
        const endDate = new Date(endUnix).toISOString().slice(0, 10);
        return endDate
    }

    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const [newsIncrementor, setNewsIncrementor] = useState(startingNewIncrementor())
    const [start, setStart] = useState(startingStartDate())
    const [end, setEnd] = useState(startingEndDate())

    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: any = state.showData.dataSet[p.widgetKey][p.config.targetSecurity]
            return (showData)
        }
    })

    const updateFilterMemo = useMemo(() => { //used inst useStartingFilters Hook.
        return {
            startDate: start,
            endDate: end,
            Description: 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
        }
    }, [start, end])

    useDragCopy(ref, { newsIncrementor: newsIncrementor, })//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useTargetSecurity(p.widgetKey, p.trackedStocks, p.updateWidgetConfig, p?.config?.targetSecurity,) //sets target security for widget on mount and change to security focus from watchlist.
    useSearchMongoDb(p.config.targetSecurity, p.widgetKey, dispatch) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(p?.config?.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security
    useUpdateFocus(p.targetSecurity, p.updateWidgetConfig, p.widgetKey) //on update to security focus, from watchlist menu, update target security.
    useStartingFilters(p.filters['startDate'], updateFilterMemo, p.updateWidgetFilters, p.widgetKey)

    function updateFilter(e) {
        console.log('UPDATE FILTER', start, end)
        if (isNaN(new Date(e.target.value).getTime()) === false) {
            const now = Date.now()
            const target = new Date(e.target.value).getTime();
            const offset = target - now
            const name = e.target.name;
            console.log(name, e.target.value)
            p.updateWidgetFilters(p.widgetKey, { [name]: offset })
        }
    }

    function formatSourceName(source) {//clean up source names for news articles.
        let formattedSource = source;
        formattedSource = formattedSource.replace(".com", "");
        formattedSource = formattedSource.replace("http:", "");
        formattedSource = formattedSource.replace("https:", "");
        formattedSource = formattedSource.replace("//", "");
        formattedSource = formattedSource.replace("www.", "");
        formattedSource = formattedSource.replace("wsj", "Wall Street Journal");
        formattedSource = formattedSource.replace(formattedSource[0], formattedSource[0].toUpperCase());

        return formattedSource;
    }

    function shortHeadline(headline) {
        let shortHeadLine = headline.slice(0, 32) + "...";
        return shortHeadLine;
    }

    function changeIncrememnt(e) {
        const newIncrement = newsIncrementor + e;
        if (newIncrement > 0 && newIncrement < 11) setNewsIncrementor(newIncrement)
    }

    function updateWidgetList(stock) {
        if (stock.indexOf(":") > 0) {
            const stockSymbole = stock.slice(0, stock.indexOf(":"));
            p.updateWidgetStockList(p.widgetKey, stockSymbole);
        } else {
            p.updateWidgetStockList(p.widgetKey, stock);
        }
    }

    function editNewsListForm() {
        let newsList = Object.keys(p.trackedStocks);
        let stockNewsRow = newsList.map((el) =>
            p.showEditPane === 1 ? (
                <tr key={el + "container"}>
                    <td key={el + "name"}>{(p.trackedStocks[el].dStock(p.exchangeList))}</td>
                    <td key={el + "buttonC"}>
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
                </tr>
            ) : (
                <tr key={el + "pass"}></tr>
            )
        );
        let stockNewsTable = (
            <table>
                <tbody>{stockNewsRow}</tbody>
            </table>
        );
        return stockNewsTable;
    }

    function newsTable() {
        let increment = 10 * newsIncrementor;
        let newStart = increment - 10;
        let newsEnd = increment;
        let newsSlice = Array.isArray(rShowData) === true ? rShowData.slice(newStart, newsEnd) : []
        let mapNews = Array.isArray(newsSlice) ? newsSlice.map((el, index) => (
            <tr key={el + "newsRow" + index}>
                <td key={el + "newsSource"}>{formatSourceName(el["source"])}</td>
                <td key={el + "newsHeadline"}>
                    <a key={el + "newsUrl"} href={el["url"]} target="_blank" rel="noopener noreferrer">
                        {shortHeadline(el["headline"])}
                    </a>
                </td>
            </tr>
        )) : <></>;

        let thisnewsTable = (
            <div className="newsBody">
                <table>
                    <thead>
                        <tr>
                            <td>Source</td>
                            <td>Headline</td>
                        </tr>
                    </thead>
                    <tbody data-testid='newBodyTable'>{mapNews}</tbody>
                </table>
            </div>
        );
        return thisnewsTable;
    }

    function displayNews() {
        let newSymbolList = Object.keys(p.trackedStocks).map((el) => (
            <option key={el + "ddl"} value={el}>
                {p.trackedStocks[el].dStock(p.exchangeList)}
            </option>
        ));

        let symbolSelectorDropDown = (
            <>
                <div>
                    <select value={p.config.targetSecurity} onChange={changeStockSelection}>
                        {newSymbolList}
                    </select>
                    <button onClick={() => changeIncrememnt(-1)}>
                        <i className="fa fa-backward" aria-hidden="true"></i>
                    </button>
                    <button onClick={() => changeIncrememnt(1)}>
                        <i className="fa fa-forward" aria-hidden="true"></i>
                    </button>
                </div>
                <div>{newsTable()}</div>
            </>
        );
        return symbolSelectorDropDown;
    }

    function updateStartDate(e) {
        setStart(e.target.value)
    }

    function updateEndDate(e) {
        setEnd(e.target.value)
    }

    function renderSearchPane() {

        return (
            <>
                <div className="stockSearch">
                    <form className="form-stack">
                        <label htmlFor="start">Start date:</label>
                        <input className="btn" id="start" type="date" name="startDate" onChange={updateStartDate} onBlur={updateFilter} value={start}></input>
                        <br />
                        <label htmlFor="end">End date:</label>
                        <input className="btn" id="end" type="date" name="endDate" onChange={updateEndDate} onBlur={updateFilter} value={end}></input>
                    </form>
                </div>

                <div>{Object.keys(p.trackedStocks).length > 0 ? editNewsListForm() : <></>}</div>
            </>
        )

    }

    function changeStockSelection(e) { //DELETE IF no target stock
        const target = e.target.value;
        p.updateWidgetConfig(p.widgetKey, {
            targetSecurity: target,
        })
        setNewsIncrementor(1)
    }

    function renderStockData() {
        return (
            <div>
                {Object.keys(p.trackedStocks).length > 0 ? displayNews() : <></>}
            </div>
        )
    }

    return (
        <div data-testid='companyNewsBody'>
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

export default forwardRef(FundamentalsCompanyNews)

export function newsWidgetProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        defaultExchange: that.props.defaultExchange,
        exchangeList: that.props.exchangeList,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateWidgetConfig: that.props.updateWidgetConfig,
        updateDefaultExchange: that.props.updateDefaultExchange,
        updateWidgetFilters: that.props.updateWidgetFilters,
        updateGlobalStockList: that.props.updateGlobalStockList,
        updateWidgetStockList: that.props.updateWidgetStockList,
        widgetKey: key,
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}


export const companyNewsFilters: object = {
    startDate: -604800 * 1000 * 52,
    endDate: 0,
    Description: 'Date numbers are millisecond offset from now. Used for Unix timestamp calculations.'
}

