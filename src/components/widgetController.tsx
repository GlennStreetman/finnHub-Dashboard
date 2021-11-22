import React from "react";
import { useState } from "react";
import WidgetContainer from "./widgetContainer";
import { returnBodyProps } from "../registers/widgetControllerReg.js"
import useWindowDimensions from '../appFunctions/hooks/windowDimensions'
import BottomNav from "./bottomNav";

import { Grid } from '@material-ui/core/';

function WidgetController(p) {

    const [focus, setFocus] = useState(0) //sets left most column focus for widgets. 0 shows menu column on far left. 
    const bottomNav = p.login === 1 ? <BottomNav setFocus={setFocus} /> : <></>

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

    // console.log('widgetWidth', width, columnCount, widgetWidth)

    function renderWidgetGroup(widgetObjList) {
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
                    moveWidget: p.moveWidget,
                    setDrag: p.setDrag,
                    showMenuColumn: p.showMenuColumn,
                    showStockWidgets: p.showStockWidgets,
                    snapWidget: p.snapWidget,
                    stateRef: el.widgetConfig,
                    targetSecurity: p.targetSecurity,
                    updateWidgetConfig: p.updateWidgetConfig,
                    widgetBodyProps: returnBodyProps({ props: p }, el.widgetType, el.widgetID),
                    widgetKey: el.widgetID,
                    widgetList: el,
                    widgetLockDown: p.widgetLockDown,
                    zIndex: p.zIndex,
                    rAddNewDashboard: p.rAddNewDashboard,
                    rSetTargetDashboard: p.rSetTargetDashboard,
                    updateAppState: p.updateAppState,
                    saveDashboard: p.saveDashboard,
                    menuList: p.menuList,
                    widgetWidth: widgetWidth,
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

    const allWidgets = { ...widgetList, ...p.menuList }
    const widgetGroups = Array.from({ length: columnCount }, (i, x) => { return [{ 'pass': x }] }) //creates 32 columns

    for (const w in allWidgets) { //puts widgets into columns
        const thisColumn = allWidgets[w]?.column
        if (thisColumn === 'drag') {
            widgetGroups[7] = []
            widgetGroups[7].push(allWidgets[w])
        } else {
            if (widgetGroups?.[thisColumn]?.[0]?.['pass'] !== undefined) {
                widgetGroups[thisColumn] = []
            }
            if (widgetGroups?.[thisColumn - focus]) widgetGroups?.[thisColumn - focus].push(allWidgets[w])
        }
    }

    const renderWidgetColumns = Object.keys(widgetGroups).map((el) => {
        return <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={el + "divkey"} >
            {renderWidgetGroup(widgetGroups[el])}
        </Grid>
    })

    return p.login === 1 ? (<>
        <Grid container>
            {renderWidgetColumns}
        </Grid>
        {bottomNav}
    </>
    ) : (
        <>
        </>
    )
}

export { WidgetController };