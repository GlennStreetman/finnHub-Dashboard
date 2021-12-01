import { dStock } from '../appFunctions/formatStockSymbols'
import { stockList } from '../App'
import { dashBoardData } from 'src/App'
import { rSetWidgetStockList } from 'src/slices/sliceDashboardData'
import { useAppDispatch } from 'src/hooks';
import { tSaveDashboard } from 'src/thunks/thunkSaveDashboard'

const useDispatch = useAppDispatch

interface Props {
    trackedStocks: stockList,
    widgetKey: string | number,
    exchangeList: string[],
    dashBoardData: dashBoardData,
    currentDashboard: string,
    apiKey: string,
}

export default function WidgetRemoveSecurityTable(p: Props) {
    const dispatch = useDispatch();

    const stockList = Object.keys(p.trackedStocks);
    const stockListRows = stockList.map((el) =>
        <tr key={el + "container"}>
            <td className="centerTE" key={el + "buttonC"}>
                <button
                    data-testid={`remove-${el}`}
                    key={el + "button"}
                    onClick={() => {
                        dispatch(rSetWidgetStockList({
                            widgetId: p.widgetKey,
                            symbol: el,
                            currentDashboard: p.currentDashboard,
                            stockObj: false
                        })) //consider updating data model on remove?
                        dispatch(tSaveDashboard({ dashboardName: p.currentDashboard }))
                    }}
                >
                    <i className="fa fa-times" aria-hidden="true" key={el + "icon"}></i>
                </button>
            </td>
            <td className='centerTE' key={el + "name"}>{dStock(p.trackedStocks[el], p.exchangeList)}</td>
            <td className='leftTE'>{p.trackedStocks[el].description}</td>
        </tr>
    )

    return (
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
    )
}
