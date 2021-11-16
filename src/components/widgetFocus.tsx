import { ReactElement } from 'react'
import { dStock } from '../appFunctions/formatStockSymbols'
import { stockList, config } from './.././slices/sliceDashboardData'

interface props {
    widgetType: string,
    updateWidgetConfig: Function,
    widgetKey: string,
    trackedStocks: stockList,
    exchangeList: string[],
    config: config,

    callback?: Function | false //any additional logic that needs to be run on change to focus. Reset pagination?
}

export default function WidgetFocus(p: props): ReactElement {
    //selector that sets widgets security focus. Used with widgets that display a single security at a time.

    function changeStockSelection(e) {
        const target = e.target.value;
        p.updateWidgetConfig(p.widgetKey, {
            ...p.config, ...{ targetSecurity: target }
        })
        if (p.callback) { p.callback() }
    }

    let newStockList = Object.keys(p.trackedStocks).map((el) => (
        <option key={el + "ddl"} value={el} data-testid={`select-${el}`} >
            {dStock(p.trackedStocks[el], p.exchangeList)}
        </option>
    ))

    return (
        <select data-testid={`focus-${p.widgetType}`} className="btn" value={p.config.targetSecurity} onChange={changeStockSelection}>
            {newStockList}
        </select>
    )
}
