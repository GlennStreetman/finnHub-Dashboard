import produce from "immer"
import { AppState, widgetList, dashBoardData } from './../../App'

export const syncGlobalStockList = async function () {
    const s: AppState = this.state;
    const updatedWidgetList: widgetList = produce(s.widgetList, (draftState: widgetList) => {
        for (const w in draftState) {
            if (draftState[w].widgetConfig === 'stockWidget') {
                draftState[w]["trackedStocks"] = s.globalStockList;
            }
        }
    })
    this.setState(() => {
        const resObj: Partial<AppState> = { widgetList: updatedWidgetList }
        return resObj
    }, async () => {
        // console.log('--SAVING DAHSBOARD--')
        let savedDash: boolean = await this.saveCurrentDashboard(s.currentDashBoard) //saves dashboard setup to server
        // console.log('here', savedDash)
        if (savedDash === true) {
            console.log('--syncGlobal Finishing--')
            let returnedDash: dashBoardData = await this.getSavedDashBoards()
            console.log('--fin--', returnedDash)
            this.updateDashBoards(returnedDash)
            if (Object.keys(s.globalStockList)[0] !== undefined) this.setSecurityFocus(Object.keys(s.globalStockList)[0])
        }
    });
}