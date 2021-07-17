import React, { ReactElement } from 'react'
import { dStock } from '../appFunctions/formatStockSymbols'
import { stockList } from '../App'

interface Props {
    trackedStocks: stockList,
    widgetKey: string,
    updateWidgetStockList: Function,
    exchangeList: string[],
}

export default function WidgetRemoveSecurityTable(p: Props): ReactElement {

    const stockList = Object.keys(p.trackedStocks);
    const stockListRows = stockList.map((el) =>
        <tr key={el + "container"}>
            <td className="centerTE" key={el + "buttonC"}>
                <button
                    data-testid={`remove-${el}`}
                    key={el + "button"}
                    onClick={() => {
                        p.updateWidgetStockList(p.widgetKey, el);
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
