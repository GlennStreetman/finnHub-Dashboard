import produce from "immer"
import { AppState, AppProps, setApp } from '../../App'
import { sliceMenuList, menu, rSetMenuList } from '../../slices/sliceMenuList'
import { sliceDashboardData, widget, widgetList, rSetDashboardData } from "src/slices/sliceDashboardData"
import { resolvePreset } from "@babel/core"
import { SaveDashboard } from './setupDashboard'

export const setDrag = function setDrag(
    dispatch: Function,
    stateRef: string,
    widgetId: string | number,
    widgetCopy: widget | null,
    currentDashboard: string,
    menuList: sliceMenuList,
    dashboardData: sliceDashboardData,
    setAppState: setApp,
) {
    let updatedWidgetLocation
    if (stateRef === 'menuWidget') { //if menu widget set drag
        updatedWidgetLocation = produce(menuList, (draftState: sliceMenuList | widgetList) => {
            draftState[widgetId]['column'] = 'drag'
        })
    } else { //if not menuwidget set drag
        updatedWidgetLocation = produce(dashboardData, (draftState: sliceMenuList | sliceDashboardData) => {
            draftState[currentDashboard]['widgetlist'][widgetId]['column'] = 'drag'
        })
    }

    return new Promise((resolve) => {
        stateRef = 'menuWidget' ? dispatch(rSetMenuList(updatedWidgetLocation)) : dispatch(rSetDashboardData(updatedWidgetLocation))
        setAppState.setEnableDrag(true)
        setAppState.setWidgetCopy(widgetCopy)
        resolve(true)
    })
}

export const moveWidget = function moveWidget(
    dispatch: Function,
    stateRef: string,
    widgetId: string | number,
    xxAxis: number,
    yyAxis: number,
    currentDashboard: string,
    menuList: sliceMenuList,
    dashboardData: sliceDashboardData,
    thisCallBack = () => { }) {
    let updatedWidgetLocation
    if (stateRef === 'menuWidget') {
        updatedWidgetLocation = produce(menuList, (draftState: sliceMenuList | widgetList) => {
            draftState[widgetId]["xAxis"] = xxAxis;
            draftState[widgetId]["yAxis"] = yyAxis;
        })
        dispatch(rSetMenuList(updatedWidgetLocation))
        thisCallBack()
    } else {
        updatedWidgetLocation = produce(dashboardData, (draftState: sliceMenuList | widgetList) => {
            draftState[currentDashboard]['widgetlist'][widgetId]["xAxis"] = xxAxis;
            draftState[currentDashboard]['widgetlist'][widgetId]["yAxis"] = yyAxis;
        })
        dispatch(rSetDashboardData(updatedWidgetLocation)).then(thisCallBack()) //THIS NEEDS TO BE A THUNK
    }
}

export const snapOrder = function (
    dispatch: Function,
    widget: string | number,
    column: number,
    yyAxis: number,
    wType: string | number,
    currentDashboard: string,
    menuList: sliceMenuList,
    dashboardData: sliceDashboardData,
    setAppState: setApp,
) {
    const draft = {
        menuList: menuList,
        sliceDashboardData: dashboardData
    }
    const newWidgetLists: Partial<AppProps> = produce(draft, (draftState: Partial<AppProps>) => {
        const thisWidgetList = draftState?.dashboardData?.[currentDashboard]?.widgetlist
        let allWidgets: (menu | widget)[] = [...Object.values(draftState.menuList!) as menu[], ...Object.values(thisWidgetList!) as widget[]]
        allWidgets = allWidgets.filter(w => (w['column'] === column ? true : false))
        allWidgets = allWidgets.sort((a, b) => (a.columnOrder > b.columnOrder) ? 1 : -1)

        let targetLocation = 0
        let foundInsertPoint = false
        let insertionPoint = 0
        let totalHeight = 60
        for (const w in allWidgets) {
            const thisID: string | number = allWidgets[w]['widgetID'] ? allWidgets[w]['widgetID'] : ''
            const h = document.getElementById(thisID + "box")!.clientHeight
            // console.log("dragHeight:",yyAxis, " ", allWidgets[w].widgetType, totalHeight)
            if (foundInsertPoint === true) {
                allWidgets[w].columnOrder = targetLocation
                targetLocation = targetLocation + 1
            } else if (totalHeight > yyAxis) {
                foundInsertPoint = true
                allWidgets[w].columnOrder = targetLocation + 1
                insertionPoint = targetLocation
                targetLocation = targetLocation + 1
            } else {
                allWidgets[w].columnOrder = targetLocation
                totalHeight = totalHeight + h
                targetLocation = targetLocation + 1
            }
        }

        if (foundInsertPoint === false) insertionPoint = targetLocation + 1
        const newMenu = draftState.menuList!
        const newWidget = thisWidgetList!
        for (const w in allWidgets) {
            if (allWidgets[w]['widgetConfig'] === 'stockWidget' || allWidgets[w]['widgetConfig'] === 'marketWidget') {
                newWidget[allWidgets[w]['widgetID']]['columnOrder'] = allWidgets[w]['columnOrder']
            } else {
                newMenu[allWidgets[w]['widgetID']]['columnOrder'] = allWidgets[w]['columnOrder']
            }
        }
        if (wType === 'stockWidget' || wType === 'marketWidget') {
            newWidget[widget].column = column
            newWidget[widget].columnOrder = insertionPoint
        } else {
            newMenu[widget].column = column
            newMenu[widget].columnOrder = insertionPoint
        }
    })
    const newMenu: sliceMenuList = produce(newWidgetLists, (draft: Partial<AppProps>) => {
        const updatedMenu: sliceMenuList = draft.menuList!
        return updatedMenu
    })
    const newWidget: sliceDashboardData = produce(newWidgetLists, (draft: Partial<AppProps>) => {
        const updatedWidgetList: sliceDashboardData = draft.dashboardData!
        return updatedWidgetList
    })
    dispatch(rSetMenuList(newMenu))
    dispatch(rSetDashboardData(newWidget))
    setAppState.setEnableDrag(false)
    return true
}

export const snapWidget = async function snapWidget(
    dispatch: Function,
    stateRef: string | number,
    widgetId: string | number,
    xxAxis: number,
    yyAxis: number,
    currentDashboard: string,
    menuList: sliceMenuList,
    dashboardData: sliceDashboardData,
    appState: AppState,
    setAppState: setApp
) {
    //snaps widget to desired location mouse up. If stateRef = menuwidget it should always snap to column 0.
    let column: number = stateRef !== 'menuWidget' ? Math.floor(xxAxis / 400) : 0 //THIS NEEEDS TO CALC OFF VIEWPORT, not hard corded
    // if (stateRef !== 'menuWidget' && s.showMenuColumn === false) column = column + 1 //add 1 if menu column is hidden.
    await snapOrder(dispatch, widgetId, column, yyAxis, stateRef, currentDashboard, menuList, dashboardData, setAppState)
    SaveDashboard(currentDashboard, appState, setAppState)
}
