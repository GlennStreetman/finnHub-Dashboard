import produce from "immer"
import { AppState, widget, menu, menuList, widgetList, dashBoardData } from 'src/App'

export const setDragWidget = function (currentDashboard: string, dashBoardData: dashBoardData, widgetId: string | number, widgetCopy: widget) {
    const updatedWidgetLocation = produce(dashBoardData, (draftState: dashBoardData) => {
        draftState[currentDashboard]['widgetlist'][widgetId]['column'] = 'drag'
    })

    const payload: Partial<AppState> = {
        widgetCopy: widgetCopy
    }
    return ([payload, updatedWidgetLocation])

}

export const setDragMenu = function (menuList: menuList, widgetId: string | number, widgetCopy: widget) {
    const updatedWidgetLocation = produce(menuList, (draftState: menuList) => {
        draftState[widgetId]['column'] = 'drag'
    })

    const payload: Partial<AppState> = {
        widgetCopy: widgetCopy
    }
    return [payload, updatedWidgetLocation]

}

export function moveStockWidget(dashBoardData: dashBoardData, currentDashboard: string, widgetId: string | number, xxAxis: number, yyAxis: number) {
    console.log('moveStockWidget')
    const updatedWidgetLocation = produce(dashBoardData, (draftState: dashBoardData) => {
        draftState[currentDashboard]['widgetlist'][widgetId]["xAxis"] = xxAxis;
        draftState[currentDashboard]['widgetlist'][widgetId]["yAxis"] = yyAxis;
        draftState[currentDashboard]['widgetlist'][widgetId]["column"] = 'drag';
    })
    return updatedWidgetLocation
}

export function moveMenu(menuList: menuList, widgetId: string | number, xxAxis: number, yyAxis: number) {
    const updatedWidgetLocation = produce(menuList, (draftState: menuList) => {
        draftState[widgetId]["xAxis"] = xxAxis;
        draftState[widgetId]["yAxis"] = yyAxis;
        draftState[widgetId]["column"] = 'drag';
    })
    return updatedWidgetLocation
}

export const SnapOrder = function (
    widgetId: string | number,
    column: number,
    yyAxis: number,
    wType: string,
    dashBoardData: dashBoardData,
    menuList: menuList,
    currentDashboard: string,
) {
    const draft = {
        menuList: menuList,
        dashBoardData: dashBoardData
    }
    const newWidgetLists = produce(draft, (draftState) => {
        const thisWidgetList = draftState?.dashBoardData?.[currentDashboard]?.widgetlist
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
            newWidget[widgetId].column = column
            newWidget[widgetId].columnOrder = insertionPoint
        } else {
            newMenu[widgetId].column = column
            newMenu[widgetId].columnOrder = insertionPoint
        }
    })
    const newMenu: menuList = produce(newWidgetLists, (draft) => {
        const updatedMenu: menuList = draft.menuList!
        return updatedMenu
    })
    const newWidget: dashBoardData = produce(newWidgetLists, (draft) => {
        const updatedWidgetList: dashBoardData = draft.dashBoardData!
        return updatedWidgetList
    })

    return [newWidget, newMenu]
}

export const SnapWidget = async function (
    stateRef: any,
    widgetId: string | number,
    xxAxis: number,
    yyAxis: number,
    widgetWidth: number,
    focus: number,
    dashBoardData: dashBoardData,
    menuList: menuList,
    currentDashboard: string,

) {
    //snaps widget to desired location mouse up. If stateRef = menuwidget it should always snap to column 0.
    let column: number = stateRef !== 'menuWidget' ? Math.floor((xxAxis) / widgetWidth) + focus : 0 //base column calc
    return SnapOrder(widgetId, column, yyAxis, stateRef, dashBoardData, menuList, currentDashboard)

}
