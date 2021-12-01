
import StockDataList from "./stockDataList";
import ToolTip from './toolTip.js'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";
import { rSetGlobalStockList, rSetWidgetStockList } from 'src/slices/sliceDashboardData'
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { rSetDefaultExchange } from 'src/slices/sliceDefaultExchange'
import { tSaveDashboard } from 'src/thunks/thunkSaveDashboard'

const useDispatch = useAppDispatch
const useSelector = useAppSelector
//compnoent used when searching for a stock via "Add stock to watchlist" on top bar or any widget searches.

interface props {
    changeSearchText: Function,
    finnHubQueue: finnHubQueue,
    searchText: string,
    widgetKey: string,
    widgetType: string,
}

function StockSearchPane(p: props) {

    const defaultExchange = useSelector((state) => { return state.defaultExchange })
    const exchangeList = useSelector((state) => { return state.exchangeList.exchangeList })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const rUpdateStock = useSelector((state) => {
        const thisExchange = state.exchangeData.e?.data
        const inputSymbol = p.searchText.slice(0, p.searchText.indexOf(":"))
        const updateStock: any = thisExchange !== undefined ? thisExchange[inputSymbol] : {}
        return updateStock
    })
    const dispatch = useDispatch(); //allows widget to run redux actions.

    function handleChange(e) {
        p.changeSearchText(e.target.value.toUpperCase())
    }

    function changeDefault(event) {
        event.preventDefault()
        const newValue = event.target.value
        console.log('newValue', newValue)
        dispatch(rSetDefaultExchange(newValue))
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
        <div className="stockSearch" data-testid={`stockSearchPane-${p.widgetType}`}>
            <form
                className="form-stack"
                onSubmit={(e) => { //submit stock to be added/removed from global & widget stocklist.
                    e.preventDefault();
                    if (rUpdateStock !== undefined && widgetKey === 'watchListMenu') {
                        console.log('update global')
                        const thisStock = rUpdateStock
                        const stockKey = thisStock.key
                        dispatch(rSetGlobalStockList)
                        dispatch(rSetGlobalStockList({
                            stockRef: stockKey,
                            currentDashboard: currentDashboard,
                            stockObj: thisStock,
                        }))
                        dispatch(tSaveDashboard({ dashboardName: currentDashboard }))
                    } else if (Number.isNaN(widgetKey) === false && rUpdateStock !== undefined) { //Not menu widget. Menus named, widgets numbered.
                        const thisStock = rUpdateStock
                        const stockKey = thisStock.key

                        dispatch(rSetWidgetStockList({
                            widgetId: widgetKey,
                            symbol: stockKey,
                            currentDashboard: currentDashboard,
                            stockObj: thisStock
                        })) //consider updating data model on remove?

                        dispatch(tSaveDashboard({ dashboardName: currentDashboard }))
                    } else {
                        console.log(`invalid stock selection:`, rUpdateStock, p.searchText, typeof widgetKey);
                    }
                }}
            >
                <ToolTip textFragment={exchangeList.length > 1 ? helpText : helpText2} hintName='sspe2' />
                {exchangeList.length > 1 && <>
                    <select value={defaultExchange} name='exchangeList' onChange={changeDefault}>
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
                        searchText={p.searchText}
                        finnHubQueue={p.finnHubQueue}
                    />
                </datalist>
                <input className="btn" type="submit" value="Submit" data-testid={`SubmitSecurity-${p.widgetType}`} />
            </form>
        </div>
    );
}

export default StockSearchPane;

export function searchPaneProps(p) {
    const propList = {
        changeSearchText: p.changeSearchText,
        finnHubQueue: p.finnHubQueue,
        searchText: p.searchText,
        widgetKey: p.widgetKey,
        widgetType: p.widgetType,
    };
    return propList;
}
