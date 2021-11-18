import { AppState, setApp } from './../../../App'
import { useAppDispatch, useAppSelector } from './../../../hooks';

const useDispatch = useAppDispatch
const useSelector = useAppSelector

export const SaveDashboard = async function (dashboardName: string | number, AppState: AppState, setApp: setApp) {

    const dashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const menuList = useSelector((state) => { return state.menuList })
    //saves current dashboard by name. Assigns new widget ids if using new name (copy function). Returns true on success.
    //throttled to save at most once every 5 seconds.
    const now = Date.now()
    if (this.state.enableDrag === true) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        SaveDashboard(dashboardName, AppState, setApp) //try again
    } else if (AppState.saveDashboardFlag === false && now - AppState.saveDashboardThrottle > 5000) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        setApp.setSaveDashboardFlag(false)
        const globalStockList = dashboardData[currentDashboard].globalstocklist
        let status = await new Promise((res) => {
            const data = {
                dashBoardName: dashboardName,
                globalStockList: globalStockList,
                widgetList: dashboardData[currentDashboard].widgetlist,
                menuList: menuList,
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
    } else if (AppState.saveDashboardFlag === false && now - AppState.saveDashboardThrottle < 5000) {
        //if not updating but flag not set to true, suspend save and try again after timer.

        const waitPeriod = 5000 - (now - AppState.saveDashboardThrottle) > 0 ? 5000 - (now - AppState.saveDashboardThrottle) : 1000
        await new Promise(resolve => setTimeout(resolve, waitPeriod));
        return SaveDashboard(dashboardName, AppState, setApp) //try again
    } else { //save is already running suspend. 
        return new Promise(resolve => resolve(true))
    }
}