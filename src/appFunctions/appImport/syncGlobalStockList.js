import produce from "immer"

export const syncGlobalStockList = async function() {
    const s = this.state;
    // let completeUpade = async function(){
    const updatedWidgetList = produce(s.widgetList, (draftState) => {
        for (const w in draftState) {
        if (draftState[w].widgetConfig === 'stockWidget'){
            draftState[w]["trackedStocks"] = this.state.globalStockList;
        }
        }
    })
    this.setState({ widgetList: updatedWidgetList }, async ()=>{
        let savedDash = await this.saveCurrentDashboard(this.state.currentDashBoard)
        if (savedDash === true) {
        let returnedDash = await this.getSavedDashBoards()
        console.log(returnedDash)
        this.updateDashBoards(returnedDash)
        if (Object.keys(s.globalStockList)[0] !== undefined) this.setSecurityFocus(Object.keys(s.globalStockList)[0])
        }
    });
}