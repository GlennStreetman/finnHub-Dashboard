import * as React from "react"
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { rBuildVisableData } from '../../../slices/sliceShowData'

const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface FinnHubAPIData { //rename
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

interface filters { //Any paramas not related to stock used by finnHub endpoint.
    categorySelection: string,
}

//add any additional type guard functions here used for live code.
function isFinnHubData(arg: any): arg is FinnHubAPIDataArray { //typeguard
    if (arg !== undefined && Object.keys(arg).length > 0 && arg[0].category) {
        return true
    } else {
        return false
    }
}
//RENAME FUNCTION
function FundamentalsMarketNews(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const startingstockData = () => {
        if (isInitialMount.current === true) {
            if (p.widgetCopy && p.widgetCopy.widgetID === p.widgetKey) {
                const stockData = JSON.parse(JSON.stringify(p.widgetCopy.stockData))
                return (stockData)
            } else {
                return ([])
            }
        }
    }

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
    const [stockData, setStockData] = useState(startingstockData());
    const [newsIncrementor, setNewsIncrementor] = useState(startingNewsIncrementor());
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false' &&
            state.showData.dataSet[p.widgetKey] !== undefined) {
            const showData: object = state.showData.dataSet[p.widgetKey]['market']
            return (showData)
        }
    })

    useImperativeHandle(ref, () => (
        {
            state: {
                stockData: stockData,
                newsIncrementor: newsIncrementor,
            },
        }
    ))

    useEffect(() => {
        //On mount, use widget copy, else build visable data.
        //On update, if change in target stock, rebuild visable data.
        if (isInitialMount.current === true && widgetCopy === p.widgetKey) {
            isInitialMount.current = false;
        } else {
            if (isInitialMount.current === true) { isInitialMount.current = false }
            const payload: object = {
                key: p.widgetKey,
                securityList: [[`market`]]
            }
            dispatch(rBuildVisableData(payload))
        }
    }, [p.widgetKey, widgetCopy, dispatch])

    useEffect((filters: filters = p.filters, update: Function = p.updateWidgetFilters, key: number = p.widgetKey) => {

        if (filters['categorySelection'] === undefined) {
            const categorySelection = 'general' //['general', 'forex', 'crypto', 'merger']
            update(key, { categorySelection: categorySelection })

        }
    }, [p.filters, p.updateWidgetFilters, p.widgetKey])


    useEffect(() => { //on update to redux data, update widget stock data, as long as data passes typeguard.
        if (isFinnHubData(rShowData) === true) { setStockData(rShowData) } else { setStockData([]) }
    }, [rShowData])

    function updateFilter(e) {
        p.updateWidgetFilters(p.widgetKey, { categorySelection: e })
    }

    function formatSourceName(source) {
        //clean up source names for news articles.
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
        let shortHeadLine = headline.slice(0, 48) + "...";
        return shortHeadLine;
    }

    function changeIncrememnt(e) {
        const newIncrement = newsIncrementor + e;
        if (newIncrement > 0 && newIncrement < 11) setNewsIncrementor(newIncrement)
    }

    function changeCategory(e) { //needs to update category selection.
        const target = e.target.value;
        // this.setState({ categorySelection: target });
        updateFilter(target)
        setNewsIncrementor(1);
    }

    function newsTable() {

        let increment = 10 * newsIncrementor;
        let newStart = increment - 10;
        let newsEnd = increment;
        let newsSlice = stockData.slice(newStart, newsEnd);
        let mapNews = newsSlice.map((el, index) => (
            <tr key={el + "newsRow" + index}>
                <td key={el + "newsSource"}>{formatSourceName(el["source"])}</td>
                <td key={el + "newsHeadline"}>
                    <a key={el + "newsUrl"} href={el["url"]} target="_blank" rel="noopener noreferrer">
                        {shortHeadline(el["headline"])}
                    </a>
                </td>
            </tr>
        ));

        let thisnewsTable = (
            <div className="newsBody">
                <table>
                    <thead>
                        <tr>
                            <td>Source</td>
                            <td>Headline</td>
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
            <>
            </>
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
                    <select value={p.filters.categorySelection} onChange={changeCategory}>
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

    return (
        <>
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
        </>
    )
}

export default forwardRef(FundamentalsMarketNews)

export function marketNewsProps(that, key = "newWidgetNameProps") {
    let propList = {
        apiKey: that.props.apiKey,
        filters: that.props.widgetList[key]["filters"],
        showPane: that.showPane,
        updateWidgetFilters: that.props.updateWidgetFilters,
        widgetKey: key,
    };
    return propList;
}

export const marketNewsFilters: object = {
    categorySelection: 'general'  //['general', 'forex', 'crypto', 'merger']
}

