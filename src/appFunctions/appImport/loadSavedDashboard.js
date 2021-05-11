export const loadSavedDashboard = function(target ,globalStockList, widgetList) {
    const p = this.props
    console.log('target', target)
    this.props.rSetTargetDashboard({targetDashboard: target})
    this.loadDashBoard(globalStockList, widgetList);
    const updateVisable = async function(that){
    const s = that.state
    await that.props.tGetMongoDB()
    p.rSetUpdateStatus({
        [s.currentDashBoard]: 'Updating'
    })
    await that.props.tGetFinnhubData({ //get data for default dashboard.
        targetDashBoard: s.currentDashBoard, 
        widgetList: Object.keys(s.dashBoardData[s.currentDashBoard].widgetlist),
        finnHubQueue: s.finnHubQueue,
    })
    p.rSetUpdateStatus({
        [s.currentDashBoard]: 'Ready'
    })
    }
    updateVisable(this)
}