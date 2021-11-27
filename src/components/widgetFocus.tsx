import React, { ReactElement } from 'react'
import { dStock } from '../appFunctions/formatStockSymbols'
import { stockList, config } from '../App'
import { updateWidgetConfig } from 'src/appFunctions/appImport/widgetLogic'
import { dashBoardData } from 'src/App'
import { useAppDispatch } from '../hooks';

interface props {
    widgetType: string,
    widgetKey: number,
    trackedStocks: stockList,
    exchangeList: string[],
    config: config,
    callback?: Function | false //any additional logic that needs to be run on change to focus. Reset pagination?
    dashBoardData: dashBoardData
    currentDashBoard: string,
    enableDrag: boolean,
}

export default function WidgetFocus(p: props): ReactElement {
    //selector that sets widgets security focus. Used with widgets that display a single security at a time.
    const dispatch = useAppDispatch(); //allows widget to run redux actions.
    function changeStockSelection(e) {
        const target = e.target.value;
        updateWidgetConfig(
            p.widgetKey,
            { ...p.config, ...{ targetSecurity: target } },
            p.dashBoardData,
            p.currentDashBoard,
            p.enableDrag,
            dispatch,
        )
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