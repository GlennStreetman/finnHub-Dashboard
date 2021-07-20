import * as React from "react"
import { useState, forwardRef, useRef, useMemo } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';

import { useDragCopy } from './../../widgetHooks/useDragCopy'
import { useSearchMongoDb } from './../../widgetHooks/useSearchMongoDB'
import { useBuildVisableData } from './../../widgetHooks/useBuildVisableData'
import { useStartingFilters } from './../../widgetHooks/useStartingFilters'


const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface FinnHubAPIData {
    category: string,
    datetime: number,
    headline: string,
    id: number,
    image: string, //URL
    related: string,
    source: string,
    summary: string,
    url: string //URL

}

export interface FinnHubAPIDataArray {
    [index: number]: FinnHubAPIData
}

function FundamentalsMarketNews(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingNewsIncrementor = () => { //REMOVE IF TARGET STOCK NOT NEEDED.
        if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
            return (p.widgetCopy.newsIncrementor)
        } else { return (1) }
    }

    const startingWidgetCoptyRef = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy !== undefined && p.widgetCopy.widgetID !== null) {
                return p.widgetCopy.widgetID
            } else { return -1 }
        }
    }

    const [widgetCopy] = useState(startingWidgetCoptyRef())
    const [newsIncrementor, setNewsIncrementor] = useState(startingNewsIncrementor());

    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: any = state.showData.dataSet[p.widgetKey]['market']
            return (showData)
        }
    })

    const focusSecurityList = useMemo(() => { //remove if all securities should stay in focus.
        return ['market']
    }, [])

    const updateFilterMemo = useMemo(() => { //remove if no filters
        return {
            categorySelection: 'general'
        }
    }, [])

    useDragCopy(ref, { newsIncrementor: newsIncrementor, })//useImperativeHandle. Saves state on drag. Dragging widget pops widget out of component array causing re-render as new component.
    useSearchMongoDb(p.currentDashBoard, p.finnHubQueue, p.config.targetSecurity, p.widgetKey, widgetCopy, dispatch, isInitialMount) //on change to target security retrieve fresh data from mongoDB
    useBuildVisableData(focusSecurityList, p.widgetKey, widgetCopy, dispatch, isInitialMount) //rebuild visable data on update to target security
    useStartingFilters(p.filters['categorySelection'], updateFilterMemo, p.updateWidgetFilters, p.widgetKey)

    function updateFilter(e) {
        p.updateWidgetFilters(p.widgetKey, { categorySelection: e })
    }

    function formatSourceName(source) {//clean up source names for news articles.
        let formattedSource = source;
        if (formattedSource !== undefined) {
            formattedSource = formattedSource.replace(".com", "");
            formattedSource = formattedSource.replace("http:", "");
            formattedSource = formattedSource.replace("https:", "");
            formattedSource = formattedSource.replace("//", "");
            formattedSource = formattedSource.replace("www.", "");
            formattedSource = formattedSource.replace("wsj", "Wall Street Journal");
            formattedSource = formattedSource.replace(formattedSource[0], formattedSource[0].toUpperCase());
        }
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

    function changeCategory(e) { //needs to update category selection.
        const target = e.target.value;
        updateFilter(target)
        setNewsIncrementor(1);
    }

    function newsTable() {

        let increment = 10 * newsIncrementor;
        let newStart = increment - 10;
        let newsEnd = increment;
        let newsSlice = Array.isArray(rShowData) === true ? rShowData.slice(newStart, newsEnd) : [];
        let mapNews = newsSlice.map((el, index) => (
            <tr key={el + "newsRow" + index}>
                <td className='rightTE' key={el + "newsSource"}>{formatSourceName(el["source"])}: &nbsp;&nbsp;</td>
                <td className='leftTE' key={el + "newsHeadline"}>
                    <a key={el + "newsUrl"} href={el["url"]} target="_blank" rel="noopener noreferrer">
                        {shortHeadline(el["headline"])}
                    </a>
                </td>
            </tr>
        ));

        let thisnewsTable = (
            <div className='scrollableDiv'>
                <table className='dataTable'>
                    <thead>
                        <tr>
                            <td>Source</td>
                            <td className='leftTE'>Headline</td>
                        </tr>
                    </thead>
                    <tbody>{mapNews}</tbody>
                </table>
            </div>
        );
        return thisnewsTable;
    }

    function renderSearchPane() {
        //no filters or searches needed.
        let searchForm = (
            <></>
        );
        return searchForm
    }

    function renderStockData() {
        let newSymbolList = ['general', 'forex', 'crypto', 'merger'].map((el) => (
            <option key={el + "ddl"} value={el}>
                {el}
            </option>
        ));

        let symbolSelectorDropDown = (
            <>
                <div>
                    <select data-testid={`focus-${p.widgetType}`} value={p.filters.categorySelection} onChange={changeCategory}>
                        {newSymbolList}
                    </select>
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

    return (
        <div data-testid='marketNewsBody'>
            {p.showEditPane === 1 && (
                <>
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

export default forwardRef(FundamentalsMarketNews)

export function marketNewsProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        filters: that.props.widgetList[key]["filters"],
        updateWidgetFilters: that.props.updateWidgetFilters,
        widgetKey: key,
    };
    return propList;
}

export const marketNewsFilters: object = {
    categorySelection: 'general'  //['general', 'forex', 'crypto', 'merger']
}

