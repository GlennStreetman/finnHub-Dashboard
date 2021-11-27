
import { estimateOptions, fundamentalsOptions, priceOptions } from '../registers/topNavReg'
import { widgetSetup, filters, dashBoardData } from 'src/App'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

import { AppBar, Toolbar, Tooltip } from '@material-ui/core/';
import WidgetsIcon from '@material-ui/icons/Widgets';
import TableChartIcon from '@material-ui/icons/TableChart';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import InfoIcon from '@material-ui/icons/Info';
import LockRoundedIcon from '@material-ui/icons/LockRounded';
import LockOpenRoundedIcon from '@material-ui/icons/LockOpenRounded';
import { CreateNewWidgetContainer } from 'src/appFunctions/appImport/widgetLogic';

import { useAppDispatch } from 'src/hooks';

import { rDataModelLogout, rSetUpdateStatus, rRebuildTargetWidgetModel } from "src/slices/sliceDataModel"
import { rExchangeDataLogout } from "src/slices/sliceExchangeData";
import { rExchangeListLogout } from "src/slices/sliceExchangeList";
import { rTargetDashboardLogout } from "src/slices/sliceShowData";
import { tGetFinnhubData } from "src/thunks/thunkFetchFinnhub";
import { rSetDashboardData } from 'src/slices/sliceDashboardData'
import { toggleBackGroundMenu } from 'src/appFunctions/appImport/toggleBackGroundMenu'

interface topNavProps {
    backGroundMenu: string,
    login: number,
    showStockWidgets: number,
    widgetSetup: widgetSetup,
    updateAppState: Function,
    baseState: Object,
    dashboardData: dashBoardData,
    currentDashboard: string,
    saveDashboard: Function,
    apiKey: string,
    finnHubQueue: finnHubQueue,
}

function TopNav(p: topNavProps) {

    const useDispatch = useAppDispatch
    const dispatch = useDispatch(); //allows widget to run redux actions.

    function isChecked(el: [string, string, string, string, filters | undefined, string]) {
        if (p.widgetSetup?.[el[0]] !== undefined) {
            return p.widgetSetup[el[0]]
        } else if (p.widgetSetup?.[el[0]] === undefined && el[5] === 'Free') {
            return true
        } else {
            return false
        }
    }

    async function logout() {
        await fetch("/logOut") //ignore result, continue logout process.
        dispatch(rDataModelLogout());
        dispatch(rExchangeDataLogout());
        dispatch(rExchangeListLogout());
        dispatch(rTargetDashboardLogout());
        p.updateAppState(p.baseState)
    }

    function dropDownList(dropList: [string, string, string, string, filters | undefined, string][]) {
        let newList = dropList.map((el) => {
            let [a, b, c, d, e] = el
            if (isChecked(el) === true) {
                return (<li key={a + 'li'} id='ddi'>
                    <a key={a} data-testid={d} href="#r" onClick={async () => {
                        const [newDash, widgetName] = CreateNewWidgetContainer(a, b, c, e, p.dashboardData, p.currentDashboard);
                        console.log('newDash', newDash)
                        dispatch(rSetDashboardData(newDash))
                        p.saveDashboard(p.currentDashboard)
                        const payload = {
                            apiKey: p.apiKey,
                            dashBoardData: newDash,
                            targetDashboard: p.currentDashboard,
                            targetWidget: widgetName,
                        }
                        console.log('payload', payload)
                        dispatch(rRebuildTargetWidgetModel(payload))
                        let updatePayload = {
                            dashboardID: newDash[p.currentDashboard].id,
                            targetDashBoard: p.currentDashboard,
                            widgetList: [`${widgetName}`],
                            finnHubQueue: p.finnHubQueue,
                            rSetUpdateStatus: rSetUpdateStatus,
                        }
                        console.log('updatePayload', updatePayload)
                        dispatch(tGetFinnhubData(updatePayload))
                    }}>
                        {d}
                    </a>
                </li>)
            } else return (false)
        })
        return <ul id='ddu' className='sub-menu'>{newList}</ul>
    }

    let widgetDropDown = <>
        <ul id='ddu' className='sub-Menu' data-testid='widgetDropDown'>
            <li id='ddi' className='menu-item-has-children'><a data-testid="estimatesDropdown" href='#1'>Estimate</a>
                {dropDownList(estimateOptions)}
            </li>
            <li id='ddi' className='menu-item-has-children'><a data-testid="fundamentalsDropDown" href='#2'>Fundamentals</a>
                {dropDownList(fundamentalsOptions)}
            </li>
            <li id='ddi' className='menu-item-has-children'><a data-testid="priceDropDown" href='#3'>Price Data</a>
                {dropDownList(priceOptions)}
            </li>
        </ul>
    </>

    const showDashBoardButtons = () => {
        if (p.showStockWidgets === 1) {
            return (<>
                <li id='ddi' className="menu-item-has-children">
                    <Tooltip title="Add Widget" placement="bottom">
                        <a data-testid="widgetsDropdown" href="#contact">
                            <WidgetsIcon />
                        </a>
                    </Tooltip>
                    {widgetDropDown}
                </li>

            </>
            )
        } else { return <></> }
    }

    return p.login === 1 ? (
        <AppBar position="static">
            <Toolbar >
                <img src="logo2.png" alt="logo" />
                <ul id='ddu' className="menu">
                    <li id='ddi'></li>
                    {showDashBoardButtons()}
                </ul>

                <div className="navItemEnd">
                    <ul id='ddu' className="sub-menu">
                        <li id='toggleBackGroundMenuButton' className="navItem">
                            <a href="#home" onClick={() => { toggleBackGroundMenu('', p.updateAppState, p.backGroundMenu) }}>
                                {p.backGroundMenu === '' ? " " : "Back to Dashboards"}
                            </a>
                        </li>
                        <li id='templatesButton' className="navItem">
                            <a href="#home" onClick={() => { toggleBackGroundMenu('templates', p.updateAppState, p.backGroundMenu) }}>
                                <Tooltip title="Excel Templates" placement="bottom"><TableChartIcon /></Tooltip>
                            </a>
                        </li>
                        <li id='manageAccountButton' className="navItem">
                            <a href="#home" onClick={() => { toggleBackGroundMenu('manageAccount', p.updateAppState, p.backGroundMenu) }}>
                                <Tooltip title="Manage Account" placement="bottom"><AccountBoxIcon /></Tooltip>
                            </a>
                        </li>
                        <li id='aboutButton' className='navItem'>
                            <a href="#home" onClick={() => { toggleBackGroundMenu('about', p.updateAppState, p.backGroundMenu) }}>
                                <Tooltip title="About Finnhub" placement="bottom"><InfoIcon /></Tooltip>
                            </a>
                        </li>
                        <li id='LogButton' className='navItem'>
                            <a id='LogButtonLink' href="#home" onClick={async () => {
                                logout()
                            }}>
                                <Tooltip title="Logout" placement="bottom"><LockRoundedIcon /></Tooltip>

                            </a>
                        </li>
                    </ul>
                </div>
            </Toolbar>
        </AppBar>

    ) : (
        <>
            <div className="topnav">
                <div className='navItemEnd'>
                    <a id='aboutButton' href="#home" onClick={() => { toggleBackGroundMenu('about', p.updateAppState, p.backGroundMenu) }}>
                        {p.backGroundMenu === 'about' ?
                            <Tooltip title="Login" placement="bottom"><LockOpenRoundedIcon /></Tooltip> :
                            <Tooltip title="About Finnhub" placement="bottom"><InfoIcon /></Tooltip>}
                    </a>
                </div>
            </div>
        </>
    );
}

export default TopNav