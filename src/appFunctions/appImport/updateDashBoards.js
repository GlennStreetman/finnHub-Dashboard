export const updateDashBoards = function(data){
    const p = this.props
    const s = this.state
    //{dashboardData, currentDashBoard, menuList}
    this.setState(data, async ()=>{
        p.rBuildDataModel({
        apiKey: s.apiKey,
        dashBoardData: s.dashBoardData
        })
    })
}