import React from "react";
import { useState } from "react";
import WidgetContainer from "./widgetContainer";
import { returnBodyProps } from "../registers/widgetControllerReg.js"
import useWindowDimensions from '../appFunctions/hooks/windowDimensions'
// import { widget } from './../slices/sliceDashboardData'

import { setApp, AppState } from './../App'

import BottomNav from "./bottomNav";
import { Grid } from '@material-ui/core/';

import { useAppSelector } from './../hooks';
const useSelector = useAppSelector

interface props {
    appState: AppState,
    setAppState: setApp,
    dispatch: Function,
}

function WidgetController(p: props) {

    const dashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const menuList = useSelector((state) => { return state.menuList })

    const widgetList = dashboardData?.[currentDashboard]?.['widgetlist'] ?
        dashboardData?.[currentDashboard]['widgetlist'] : {}

    const [focus, setFocus] = useState(0)

    const bottomNav = p.appState.login === 1 ? <BottomNav setFocus={setFocus} /> : <></>

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
    const columnSetup = function (): number {
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

    const columnCount = columnSetup[2]

    console.log('columnCount', columnCount)

    const widgetWidth = Math.round((width / columnCount) - 5)

    function renderWidgetGroup(widgetObjList) {
        if (widgetObjList !== undefined && widgetObjList[0]['pass'] === undefined) {
            widgetObjList.sort((a, b) => (a.columnOrder > b.columnOrder) ? 1 : -1) //sort into column order.
            const widgetGroup = widgetObjList.map((el) => { //for each widget, add props.
                const thisWidgetProps: any = {
                    stateRef: el.widgetConfig,
                    widgetKey: el.widgetID,
                    widgetList: el,
                    appState: p.appState,
                    setAppState: p.setAppState,
                    dispatch: p.dispatch,
                    widgetBodyProps: returnBodyProps({ props: p.appState }, el.widgetType, el.widgetID),
                }
                if (p.appState.widgetCopy?.widgetID === el.widgetID) {
                    thisWidgetProps.widgetCopy = p.appState.widgetCopy
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

    const allWidgets = { ...widgetList, ...menuList }
    const widgetGroups: any = Array.from({ length: columnCount }, (i, x) => { return [{ 'pass': x }] }) //pass is place holder in case column is empty.
    console.log('allWidgets', widgetGroups, columnCount)
    for (const w in allWidgets) { //puts widgets into columns
        const thisColumn = allWidgets[w]?.column
        if (thisColumn === 'drag') {
            widgetGroups[7] = []
            widgetGroups[7].push(allWidgets[w])
        } else if (typeof thisColumn === 'number') {
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

    return p.appState.login === 2 ? (<>
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

