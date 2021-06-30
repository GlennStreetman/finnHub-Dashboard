import produce from "immer"
import { AppState, widgetList } from './../../App'

export const syncGlobalStockList = async function () {
    const oldState: AppState = this.state;
    const oldWidgetList = oldState.widgetList
    const updatedWidgetList: widgetList = produce(oldWidgetList, (draftState: widgetList) => {
        for (const w in draftState) {
            if (draftState[w].widgetConfig === 'stockWidget') {
                draftState[w]["trackedStocks"] = this.state.globalStockList;
            }
        }
    })
    this.setState(() => {
        const resObj: Partial<AppState> = { widgetList: updatedWidgetList }
        return resObj
    }, async () => {
        console.log('HERE', this.state.dashBoardData[this.state.currentDashBoard])
        let savedDash: boolean = await this.saveDashboard(this.state.currentDashBoard) //saves dashboard setup to server
        if (savedDash === true) {
            if (Object.keys(this.state.globalStockList)[0] !== undefined) this.setSecurityFocus(Object.keys(this.state.globalStockList)[0])
        }
    });
}