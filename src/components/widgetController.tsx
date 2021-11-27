import React from "react";
import { useState } from "react";
import WidgetContainer from "./widgetContainer";
import { returnBodyProps } from "../registers/widgetControllerReg.js"
import useWindowDimensions from '../appFunctions/hooks/windowDimensions'
import BottomNav from "./bottomNav";

import { Grid } from '@material-ui/core/';

function WidgetController(p) {

    const [focus, setFocus] = useState(0) //sets left most column focus for widgets. 0 shows menu column on far left. 


    const widgetList = p.dashBoardData?.[p.currentDashBoard] ?
        p.dashBoardData[p.currentDashBoard].widgetlist : {}

    const width = useWindowDimensions().width //also returns height
    const columnLookup = [
        [0, 400, 1],
        [400, 800, 1], //12
        [800, 1200, 2], //6
        [1200, 1600, 3], //4
        [1600, 2400, 4], //3
        [2400, 99999999, 6] //2
    ]

    const columnSetup = function (): number[] {
        let ret: number[] = columnLookup.reduce((acc, el) => {
            if (width > el[0] && width <= el[1]) {
                const newVal = el
                acc = newVal
                return (acc)
            } else { return (acc) }
        })
        return (ret)
    }()

    const columnCount = columnSetup[2]
    const widgetWidth = Math.round(width / columnCount)
    const bottomNav = p.login === 1 ? <BottomNav setFocus={setFocus} columnCount={columnCount} /> : <></>

    // console.log('widgetWidth', width, columnCount, widgetWidth)

    function renderWidgetColumn(widgetObjList) {
        if (widgetObjList !== undefined && widgetObjList[0]['pass'] === undefined) {
            widgetObjList.sort((a, b) => (a.columnOrder > b.columnOrder) ? 1 : -1) //sort into column order.
            const widgetGroup = widgetObjList.map((el) => { //for each widget, add props.
                const thisWidgetProps: any = {
                    apiKey: p.apiKey,
                    currentDashBoard: p.currentDashBoard,
                    dashboardData: p.dashBoardData,
                    dashboardID: p.dashboardID,
                    enableDrag: p.enableDrag,
                    exchangeList: p.exchangeList,
                    finnHubQueue: p.finnHubQueue,
                    key: el.widgetId,
                    showMenuColumn: p.showMenuColumn,
                    showStockWidgets: p.showStockWidgets,
                    snapWidget: p.snapWidget,
                    stateRef: el.widgetConfig,
                    targetSecurity: p.targetSecurity,
                    widgetBodyProps: returnBodyProps({ props: p }, el.widgetType, el.widgetID),
                    widgetKey: el.widgetID,
                    widgetList: el,
                    rAddNewDashboard: p.rAddNewDashboard,
                    rSetTargetDashboard: p.rSetTargetDashboard,
                    updateAppState: p.updateAppState,
                    menuList: p.menuList,
                    widgetWidth: widgetWidth,
                    focus: focus,
                }
                if (el.widgetConfig === 'menuWidget') {
                    thisWidgetProps['showMenu'] = p[el.widgetID]
                    thisWidgetProps['rebuildVisableDashboard'] = p.rebuildVisableDashboard
                }
                if (p.widgetCopy?.widgetID === el.widgetID) {
                    thisWidgetProps.widgetCopy = p.widgetCopy
                }

                const subComponent = React.createElement(WidgetContainer, thisWidgetProps)
                return (
                    <div key={el.widgetID + 'thisKey'} style={{ padding: "1px" }}>
                        {subComponent}
                    </div>
                )

            })
            return widgetGroup
        } else {
            const phantomStyle = {
                padding: "1px",
                height: "10px",
                width: `${widgetWidth}px`,

            }
            return ( //empty column place holder.
                <div
                    key={widgetObjList[0]['pass'] + "phantom"}
                    style={phantomStyle}
                />
            )
        }
    }

    //this is derived state. Should this be in useEffect?
    const allWidgetColumns = Array.from({ length: 7 }, (i, x) => { return [{ 'pass': x }] }) //creates 7 columns, 6 possible snap locations, 1 drag column.
    const allWidgets = { ...widgetList, ...p.menuList }

    for (const w in allWidgets) { //puts widgets into columns
        const thisColumn = allWidgets[w]?.column
        if (thisColumn === 'drag') {
            allWidgetColumns[6] = []
            allWidgetColumns[6].push(allWidgets[w])
        } else {
            if (allWidgetColumns?.[thisColumn]?.[0]?.['pass'] !== undefined) {
                allWidgetColumns[thisColumn] = []
            }
            allWidgetColumns?.[thisColumn].push(allWidgets[w]) //if (allWidgetColumns?.[thisColumn - focus])
        }
    }

    const displayColumns = allWidgetColumns.slice(focus, columnCount) //display in grid
    const dragColumn = allWidgetColumns[6] //display widget current being dragged to new location.
    // console.log('all', allWidgetColumns, 'display', displayColumns, 'drag', dragColumn)

    const renderWidgetColumns = Object.keys(displayColumns).map((el) => {
        return <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={el + "divkey"} >
            {renderWidgetColumn(displayColumns[el])}
        </Grid>
    })

    return p.login === 1 ? (<>
        <Grid container>
            {renderWidgetColumns}
        </Grid>
        {renderWidgetColumn(dragColumn)}
        {bottomNav}
    </>
    ) : (
        <>
        </>
    )
}

export { WidgetController };