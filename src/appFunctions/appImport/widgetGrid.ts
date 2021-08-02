import produce from "immer"
import { AppState, widget, menu, menuList, widgetList, dashBoardData } from './../../App'

export const SetDrag = function setDrag(stateRef: 'menuWidget' | 'widgetList', widgetId: string | number, widgetCopy: widget) {
    const s: AppState = this.state
    const ref = stateRef === "menuWidget" ? "menuList" : "dashBoardData";
    let updatedWidgetLocation
    if (stateRef === 'menuWidget') {
        const thisList: menuList | dashBoardData = s[ref]
        updatedWidgetLocation = produce(thisList, (draftState: menuList | widgetList) => {
            draftState[widgetId]['column'] = 'drag'
        })
    } else {

        const thisList: menuList | dashBoardData = s[ref]
        updatedWidgetLocation = produce(thisList, (draftState: menuList | dashBoardData) => {
            draftState[s.currentDashBoard]['widgetlist'][widgetId]['column'] = 'drag'
        })
    }
    return new Promise((resolve) => {
        const payload: Partial<AppState> = {
            enableDrag: true,
            [ref]: updatedWidgetLocation,
            widgetCopy: widgetCopy
        }
        this.setState(payload, () => {
            resolve(true)
        })
    })
}

export const MoveWidget = function moveWidget(stateRef: 'menuWidget' | 'widgetList', widgetId: string | number, xxAxis: number, yyAxis: number, thisCallBack = () => { }) {
    const s: AppState = this.state
    const ref = stateRef === "menuWidget" ? "menuList" : "dashBoardData";
    let updatedWidgetLocation
    if (stateRef === 'menuWidget') {
        const thisList: menuList | dashBoardData = s[ref]
        updatedWidgetLocation = produce(thisList, (draftState: menuList | widgetList) => {
            draftState[widgetId]["xAxis"] = xxAxis;
            draftState[widgetId]["yAxis"] = yyAxis;
        })
    } else {
        const thisList: menuList | dashBoardData = s[ref]
        updatedWidgetLocation = produce(thisList, (draftState: menuList | widgetList) => {
            draftState[s.currentDashBoard]['widgetlist'][widgetId]["xAxis"] = xxAxis;
            draftState[s.currentDashBoard]['widgetlist'][widgetId]["yAxis"] = yyAxis;
        })
    }
    const payload: Partial<AppState> = { [ref]: updatedWidgetLocation }
    this.setState((state: AppState) => {
        if (state.enableDrag === true) {
            return (payload)
        } else {
            // console.log('drag not enabled')
            return false
        }
    }, thisCallBack());
}

export const SnapOrder = function snapOrder(widget: string, column: number, yyAxis: number, wType: string) {
    const s: AppState = this.state
    const draft: Partial<AppState> = {
        menuList: s.menuList,
        dashBoardData: s.dashBoardData
    }
    const newWidgetLists: Partial<AppState> = produce(draft, (draftState: Partial<AppState>) => {
        const thisWidgetList = draftState?.dashBoardData?.[s.currentDashBoard]?.widgetlist
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
    const newMenu: menuList = produce(newWidgetLists, (draft: Partial<AppState>) => {
        const updatedMenu: menuList = draft.menuList!
        return updatedMenu
    })
    const newWidget: dashBoardData = produce(newWidgetLists, (draft: Partial<AppState>) => {
        const updatedWidgetList: dashBoardData = draft.dashBoardData!
        return updatedWidgetList
    })
    const payload: Partial<AppState> = {
        enableDrag: false,
        menuList: newMenu,
        dashBoardData: newWidget,
    }
    this.setState(payload, () => { return true })
}

export const SnapWidget = async function snapWidget(stateRef: 'menuWidget' | 'widgetList', widgetId: string, xxAxis: number, yyAxis: number) {
    //snaps widget to desired location mouse up. If stateRef = menuwidget it should always snap to column 0.
    const s: AppState = this.state
    let column: number = stateRef !== 'menuWidget' ? Math.floor(xxAxis / 400) : 0 //base column calc
    if (stateRef !== 'menuWidget' && s.showMenuColumn === false) column = column + 1 //add 1 if menu column is hidden.

    await this.snapOrder(widgetId, column, yyAxis, stateRef)
    this.saveDashboard(this.state.currentDashBoard)
}
