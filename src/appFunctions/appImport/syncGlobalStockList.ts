import produce from "immer"
import { AppState, widgetList, dashBoardData } from './../../App'

export const syncGlobalStockList = async function () {
    const s: AppState = this.state;
    // let completeUpade = async function(){
    const updatedWidgetList: widgetList = produce(s.widgetList, (draftState: widgetList) => {
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
        let savedDash: boolean = await this.saveCurrentDashboard(this.state.currentDashBoard)
        if (savedDash === true) {
            let returnedDash: dashBoardData = await this.getSavedDashBoards()
            this.updateDashBoards(returnedDash)
            if (Object.keys(s.globalStockList)[0] !== undefined) this.setSecurityFocus(Object.keys(s.globalStockList)[0])
        }
    });
}