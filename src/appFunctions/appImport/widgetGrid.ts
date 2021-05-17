import produce from "immer"
import { AppState, widget, menu, menuList, widgetList } from './../../App'

export const SetDrag = function setDrag(stateRef: 'menuWidget' | 'widgetList', widgetId: string | number, widgetCopy: widget) {
    const s: AppState = this.state
    const ref = stateRef === "menuWidget" ? "menuList" : "widgetList";
    const thisList: menuList | widgetList = s[ref]
    const updatedWidgetLocation = produce(thisList, (draftState: menuList | widgetList) => {
        draftState[widgetId]['column'] = 'drag'
    })
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
    const ref = stateRef === "menuWidget" ? "menuList" : "widgetList"
    const thisList: menuList | widgetList = s[ref]
    const updateWidgetLocation = produce(thisList, (draftState: menuList | widgetList) => {
        draftState[widgetId]["xAxis"] = xxAxis;
        draftState[widgetId]["yAxis"] = yyAxis;
    })
    const payload: Partial<AppState> = { [ref]: updateWidgetLocation }
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
        widgetList: s.widgetList
    }
    const newWidgetLists: Partial<AppState> = produce(draft, (draftState: Partial<AppState>) => {
        let allWidgets: (menu | widget)[] = [...Object.values(draftState.menuList!) as menu[], ...Object.values(draftState.widgetList!) as widget[]]
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
        const newWidget = draftState.widgetList!
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
    const newWidget: widgetList = produce(newWidgetLists, (draft: Partial<AppState>) => {
        const updatedWidgetList: widgetList = draft.widgetList!
        return updatedWidgetList
    })
    const payload: Partial<AppState> = {
        enableDrag: false,
        menuList: newMenu,
        widgetList: newWidget,
    }
    this.setState(payload)
}

export const SnapWidget = function snapWidget(stateRef: string, widgetId: string, xxAxis: number, yyAxis: number) {
    //adjust column based upon status of hidden menu columns.
    const s: AppState = this.state
    const addColumn: { [key: string]: any } = {}
    const thisColumn = s.menuList.DashBoardMenu.column
    addColumn[thisColumn] = []
    addColumn[s.menuList.WatchListMenu.column] = []
    addColumn[s.menuList.DashBoardMenu.column].push(s.dashBoardMenu)
    addColumn[s.menuList.WatchListMenu.column].push(s.watchListMenu)
    for (const w in s.widgetList) {
        if (addColumn[s.widgetList[w].column] !== undefined) {
            addColumn[s.widgetList[w].column].push(1)
        }
    }
    let column: number = Math.floor(xxAxis / 400)
    for (const x in addColumn) {
        if (addColumn[x].reduce((a: number, b: number) => a + b, 0) === 0) {
            column = column + 1
        }
    }
    this.snapOrder(widgetId, column, yyAxis, stateRef)
}
