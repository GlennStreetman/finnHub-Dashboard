

export const saveDashboard = async function (dashboardName: string) {
    //saves current dashboard by name. Assigns new widget ids if using new name (copy function). Returns true on success.
    //throttled to save at most once every 5 seconds.
    const now = Date.now()
    if (this.state.enableDrag === true) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.saveDashboard(dashboardName) //try again
    } else if (this.state.saveDashboardFlag === false && now - this.state.saveDashboardThrottle > 5000) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        this.setState({ saveDashboardFlag: false })
        const globalStockList = this.state.dashBoardData[this.state.currentDashBoard].globalstocklist
        let status = await new Promise((res) => {
            const data = {
                dashBoardName: dashboardName,
                globalStockList: globalStockList,
                widgetList: this.state.dashBoardData[this.state.currentDashBoard].widgetlist,
                menuList: this.state.menuList,
            };
            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            };
            fetch("/dashBoard", options) //posts that data to be saved.
                .then(res => res.json())
                .then((data) => {
                    res(true)
                })
                .catch((err) => {
                    console.log("dashboard save error: ", err)
                    res(false)
                })
        })
        return status
    } else if (this.state.saveDashboardFlag === false && now - this.state.saveDashboardThrottle < 5000) {
        //if not updating but flag not set to true, suspend save and try again after timer.

        const waitPeriod = 5000 - (now - this.state.saveDashboardThrottle) > 0 ? 5000 - (now - this.state.saveDashboardThrottle) : 1000
        await new Promise(resolve => setTimeout(resolve, waitPeriod));
        return this.saveDashboard(dashboardName) //try again
    } else { //save is already running suspend. 
        return new Promise(resolve => resolve(true))
    }
}