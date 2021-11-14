import * as React from "react"
import { useState, useMemo, forwardRef, useRef } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';

//components
import WidgetFocus from '../../../components/widgetFocus'
import WidgetRemoveSecurityTable from '../../../components/widgetRemoveSecurityTable'
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import WidgetFilterDates from '../../../components/widgetFilterDates'

//hooks
import { useDragCopy } from '../../widgetHooks/useDragCopy'
import { useSearchMongoDb } from '../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from '../../widgetHooks/useBuildVisableData'
import { useUpdateFocus } from './../../widgetHooks/useUpdateFocus'
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

    const focusSecurityList = useMemo(() => { //remove if all securities should stay in focus.
        return [p?.config?.targetSecurity]
    }, [p?.config?.targetSecurity])

    useDragCopy(ref, { newsIncrementor: newsIncrementor, })//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useUpdateFocus(p.targetSecurity, p.updateWidgetConfig, p.widgetKey, isInitialMount, p.config) //sets security focus in config. Used for redux.visable data and widget excel templating.
    useSearchMongoDb(p.currentDashboard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount, p.dashboardID) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security
    useStartingFilters(p.filters['startDate'], updateFilterMemo, p.updateWidgetFilters, p.widgetKey)

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
        let shortHeadLine = headline.slice(0, 128) + "...";
        return shortHeadLine;
    }

    function changeIncrememnt(e) {
        const newIncrement = newsIncrementor + e;
        if (newIncrement > 0 && newIncrement < 11) setNewsIncrementor(newIncrement)
    }

    function editNewsListForm() {

        let stockNewsTable = (
            <WidgetRemoveSecurityTable
                trackedStocks={p.trackedStocks}
                widgetKey={p.widgetKey}
                updateWidgetStockList={p.updateWidgetStockList}
                exchangeList={p.exchangeList}
            />
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
                <td className='rightTE' key={el + "newsSource"}>{formatSourceName(el["source"])}</td>
                <td className='leftTE' key={el + "newsHeadline"}>
                    <a key={el + "newsUrl"} href={el["url"]} target="_blank" rel="noopener noreferrer">
                        {shortHeadline(el["headline"])}
                    </a>
                </td>
            </tr>
        )) : <></>;

        let thisnewsTable = (
            <div className='scrollableDiv'>
                <table className='dataTable'>
                    <thead>
                        <tr>
                            <td>Source</td>
                            <td className='leftTE'>Headline</td>
                        </tr>
                    </thead>
                    <tbody data-testid='newBodyTable'>{mapNews}</tbody>
                </table>
            </div>
        );
        return thisnewsTable;
    }

    function displayNews() {

        let symbolSelectorDropDown = (
            <>
                <div>
                    <WidgetFocus
                        widgetType={p.widgetType} updateWidgetConfig={p.updateWidgetConfig}
                        widgetKey={p.widgetKey}
                        trackedStocks={p.trackedStocks}
                        exchangeList={p.exchangeList}
                        config={p.config}
                        callback={() => { setNewsIncrementor(1) }}
                    />
                    <button data-testid='pageBackward' onClick={() => changeIncrememnt(-1)}>
                        <i className="fa fa-backward" aria-hidden="true"></i>
                    </button>
                    <button data-testid='pageForward' onClick={() => changeIncrememnt(1)}>
                        <i className="fa fa-forward" aria-hidden="true"></i>
                    </button>
                </div>
                <div>{newsTable()}</div>
            </>
        );
        return symbolSelectorDropDown;
    }

    function renderSearchPane() {

        return (
            <>
                <WidgetFilterDates
                    start={start}
                    end={end}
                    setStart={setStart}
                    setEnd={setEnd}
                    updateWidgetFilters={p.updateWidgetFilters}
                    widgetKey={p.widgetKey}
                    widgetType={p.widgetType}
                />
                <div>{Object.keys(p.trackedStocks).length > 0 ? editNewsListForm() : <></>}</div>
            </>
        )

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
        trackedStocks: that.props.widgetList[key]["trackedStocks"],
        updateWidgetConfig: that.props.updateWidgetConfig,
        updateWidgetFilters: that.props.updateWidgetFilters,
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

