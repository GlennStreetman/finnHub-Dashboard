import produce from "immer"
import { AppState, AppProps } from './../../App'
import { sliceMenuList, menu } from './../../slices/sliceMenuList'
import { sliceDashboardData, widget, widgetList } from "src/slices/sliceDashboardData"

export const SetDrag = function setDrag(stateRef: 'menuWidget' | 'widgetList', widgetId: string | number, widgetCopy: widget, rSetMenuList: Function) {
    const s: AppState = this.state
    const p: AppProps = this.props
    const ref = stateRef === "menuWidget" ? "menuList" : "sliceDashboardData";
    let updatedWidgetLocation
    if (stateRef === 'menuWidget') { //if menu widget set drag
        const thisList: sliceMenuList | sliceDashboardData = s[ref]
        updatedWidgetLocation = produce(thisList, (draftState: sliceMenuList | widgetList) => {
            draftState[widgetId]['column'] = 'drag'
        })
    } else { //if not menuwidget set drag
        const thisList: sliceMenuList | sliceDashboardData = s[ref]
        updatedWidgetLocation = produce(thisList, (draftState: sliceMenuList | sliceDashboardData) => {
            draftState[this.props.currentDashboard]['widgetlist'][widgetId]['column'] = 'drag'
        })
    }

    return new Promise((resolve) => {

        stateRef = 'menuWidget' ? p.rSetMenuList(updatedWidgetLocation) : p.rSetDashboardData(updatedWidgetLocation)

        const payload: Partial<AppState> = {
            enableDrag: true,
            widgetCopy: widgetCopy
        }
        this.setState(payload, () => {
            resolve(true)
        })
    })
}

export const MoveWidget = function moveWidget(stateRef: 'menuWidget' | 'widgetList', widgetId: string | number, xxAxis: number, yyAxis: number, thisCallBack = () => { }) {
    const s: AppState = this.state
    const ref = stateRef === "menuWidget" ? "menuList" : "sliceDashboardData";
    let updatedWidgetLocation
    if (stateRef === 'menuWidget') {
        const thisList: sliceMenuList | sliceDashboardData = s[ref]
        updatedWidgetLocation = produce(thisList, (draftState: sliceMenuList | widgetList) => {
            draftState[widgetId]["xAxis"] = xxAxis;
            draftState[widgetId]["yAxis"] = yyAxis;
        })
    } else {
        const thisList: sliceMenuList | sliceDashboardData = s[ref]
        updatedWidgetLocation = produce(thisList, (draftState: sliceMenuList | widgetList) => {
            draftState[this.props.currentDashboard]['widgetlist'][widgetId]["xAxis"] = xxAxis;
            draftState[this.props.currentDashboard]['widgetlist'][widgetId]["yAxis"] = yyAxis;
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
    const draft = {
        menuList: this.props.menuList,
        sliceDashboardData: this.props.dashboardData
    }
    const newWidgetLists: Partial<AppProps> = produce(draft, (draftState: Partial<AppProps>) => {
        const thisWidgetList = draftState?.dashboardData?.[this.props.currentDashboard]?.widgetlist
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
    this.props.rSetMenuList(newMenu)
    this.props.rSetDashboardData(newWidget)
    const payload: Partial<AppState> = {
        enableDrag: false,
    }
    this.setState(payload, () => { return true })
}

export const SnapWidget = async function snapWidget(stateRef: 'menuWidget' | 'widgetList', widgetId: string, xxAxis: number, yyAxis: number) {
    //snaps widget to desired location mouse up. If stateRef = menuwidget it should always snap to column 0.
    const s: AppState = this.state
    let column: number = stateRef !== 'menuWidget' ? Math.floor(xxAxis / 400) : 0 //base column calc
    if (stateRef !== 'menuWidget' && s.showMenuColumn === false) column = column + 1 //add 1 if menu column is hidden.

    await this.snapOrder(widgetId, column, yyAxis, stateRef)
    this.saveDashboard(this.props.currentDashboard)
}
