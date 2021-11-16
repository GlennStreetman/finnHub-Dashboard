import React from "react";
import { useState } from "react";
import WidgetContainer from "./widgetContainer";
import { returnBodyProps } from "../registers/widgetControllerReg.js"
import useWindowDimensions from '../appFunctions/hooks/windowDimensions'

import BottomNav from "./bottomNav";
import { Grid } from '@material-ui/core/';


function WidgetController(p) {

    const [focus, setFocus] = useState(0)

    const bottomNav = p.login === 1 ? <BottomNav setFocus={setFocus} /> : <></>

    const { height, width } = useWindowDimensions()
    const columnLookup = [
        [0, 400, 1],
        [400, 800, 1], //12
        [800, 1200, 2], //6
        [1200, 1600, 3], //4
        [1600, 2400, 4], //3
        [2400, 99999999, 6] //2
    ]
    // const columnCount = width / 400 < 1 ? 1 :  width / 400 > 6 ? 6 : Math.round(width / 400)
    const columnCount = function (): number {
        // @ts-ignore
        let ret: number = columnLookup.reduce((acc, el) => {
            if (width > el[0] && width < el[1]) {
                const newVal = el[2]
                // @ts-ignore
                return (acc = newVal)
            } else { return (acc) }
        })
        return (ret)
    }()

    const widgetWidth = Math.round((width / columnCount) - 5)

    function renderWidgetGroup(widgetObjList) {
        if (widgetObjList !== undefined && widgetObjList[0]['pass'] === undefined) {
            widgetObjList.sort((a, b) => (a.columnOrder > b.columnOrder) ? 1 : -1) //sort into column order.
            const widgetGroup = widgetObjList.map((el) => { //for each widget, add props.
                const thisWidgetProps: any = {
                    apiKey: p.apiKey,
                    changeWidgetName: p.changeWidgetName,
                    currentDashboard: p.currentDashboard,
                    dashboardID: p.dashboardID,
                    enableDrag: p.enableDrag ? p.enableDrag : false,
                    exchangeList: p.exchangeList,
                    finnHubQueue: p.finnHubQueue,
                    // key: el.widgetID,
                    loadSavedDashboard: p.loadSavedDashboard,
                    moveWidget: p.moveWidget,
                    refreshFinnhubAPIDataCurrentDashboard: p.refreshFinnhubAPIDataCurrentDashboard,
                    removeWidget: p.removeWidget,
                    removeDashboardFromState: p.removeDashboardFromState,
                    setDrag: p.setDrag,
                    setSecurityFocus: p.setSecurityFocus,
                    showMenuColumn: p.showMenuColumn,
                    showStockWidgets: p.showStockWidgets,
                    snapWidget: p.snapWidget,
                    stateRef: el.widgetConfig,
                    targetSecurity: p.targetSecurity,
                    toggleWidgetBody: p.toggleWidgetBody,
                    updateAPIFlag: p.updateAPIFlag,
                    updateDefaultExchange: p.updateDefaultExchange,
                    updateWidgetConfig: p.updateWidgetConfig,
                    widgetBodyProps: returnBodyProps({ props: p }, el.widgetType, el.widgetID),
                    widgetKey: el.widgetID,
                    widgetList: el,
                    widgetLockDown: p.widgetLockDown,
                    zIndex: p.zIndex,
                    rebuildDashboardState: p.rebuildDashboardState,
                    rAddNewDashboard: p.rAddNewDashboard,
                    rSetTargetDashboard: p.rSetTargetDashboard,
                }
                if (el.widgetConfig === 'menuWidget') {
                    // thisWidgetProps['showMenu'] = '1'
                    thisWidgetProps['setWidgetFocus'] = p.setWidgetFocus
                    thisWidgetProps['rUpdateCurrentDashboard'] = p.rUpdateCurrentDashboard
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

    const allWidgets = { ...p.widgetList, ...p.menuList }
    const widgetGroups = Array.from({ length: columnCount }, (i, x) => { return [{ 'pass': x }] }) //pass is place holder in case column is empty.

    for (const w in allWidgets) { //puts widgets into columns
        const thisColumn = allWidgets[w]?.column
        if (thisColumn === 'drag') {
            widgetGroups[7] = []
            widgetGroups[7].push(allWidgets[w])
        } else {
            if (widgetGroups?.[thisColumn - focus]?.[0]?.['pass'] !== undefined) {
                widgetGroups[thisColumn - focus] = []
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

