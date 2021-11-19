
import { estimateOptions, fundamentalsOptions, priceOptions } from '../registers/topNavReg'
import { widgetSetup, setApp, AppState } from './../App'
import { finnHubQueue } from "./../appFunctions/appImport/throttleQueueAPI";
import { AddNewWidgetContainer } from "./../appFunctions/appImport/widgetLogic";

import { sliceMenuList } from './../slices/sliceMenuList'
import { filters } from './../slices/sliceDashboardData'

import { AppBar, Toolbar, Tooltip } from '@material-ui/core/';
import WidgetsIcon from '@material-ui/icons/Widgets';
import TableChartIcon from '@material-ui/icons/TableChart';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import InfoIcon from '@material-ui/icons/Info';
import LockRoundedIcon from '@material-ui/icons/LockRounded';
import LockOpenRoundedIcon from '@material-ui/icons/LockOpenRounded';
import { ToggleBackGroundMenu } from "./../appFunctions/appImport/toggleBackGroundMenu"
import { Logout } from './../appFunctions/appImport/appLogin'

import { useAppDispatch, useAppSelector } from './../hooks';

const useDispatch = useAppDispatch
const useSelector = useAppSelector

interface topNavProps {
    backGroundMenu: string,
    login: number,
    logoutServer: Function,
    showStockWidgets: number,
    widgetSetup: widgetSetup,
    finnHubQueue: finnHubQueue,
    setAppState: setApp,
    appState: AppState,
    dispatch: Function,
}

export default function TopNav(p: topNavProps) {

    const dispatch = useDispatch(); //allows widget to run redux actions.
    const apiKey = useSelector((state) => { return state.apiKey })
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })

    function isChecked(el: [string, string, string, string, filters | undefined, string]) {
        if (p.widgetSetup[el[0]] !== undefined) {
            return p.widgetSetup[el[0]]
        } else if (p.widgetSetup[el[0]] === undefined && el[5] === 'Free') {
            return true
        } else {
            return false
        }
    }

    function dropDownList(dropList: [string, string, string, string, filters | undefined, string][]) {
        let newList = dropList.map((el) => {
            let [a, b, c, d, e] = el
            if (isChecked(el) === true) {
                return (<li key={a + 'li'} id='ddi'>
                    <a key={a} data-testid={d} href="#r" onClick={() => { AddNewWidgetContainer(dispatch, a, b, c, e, p.finnHubQueue, p.appState, p.setAppState, dashboardData, currentDashboard, apiKey); }}>
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

    return p.login === 2 ? (
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
                            <a href="#home" onClick={() => { ToggleBackGroundMenu('', p.appState, p.setAppState) }}>
                                {p.backGroundMenu === '' ? " " : "Back to Dashboards"}
                            </a>
                        </li>
                        <li id='templatesButton' className="navItem">
                            <a href="#home" onClick={() => { ToggleBackGroundMenu('templates', p.appState, p.setAppState) }}>
                                <Tooltip title="Excel Templates" placement="bottom"><TableChartIcon /></Tooltip>
                            </a>
                        </li>
                        <li id='manageAccountButton' className="navItem">
                            <a href="#home" onClick={() => { ToggleBackGroundMenu('manageAccount', p.appState, p.setAppState) }}>
                                <Tooltip title="Manage Account" placement="bottom"><AccountBoxIcon /></Tooltip>
                            </a>
                        </li>
                        <li id='aboutButton' className='navItem'>
                            <a href="#home" onClick={() => { ToggleBackGroundMenu('about', p.appState, p.setAppState) }}>
                                <Tooltip title="About Finnhub" placement="bottom"><InfoIcon /></Tooltip>
                            </a>
                        </li>
                        <li id='LogButton' className='navItem'>
                            <a id='LogButtonLink' href="#home" onClick={async () => {
                                await p.logoutServer()
                                Logout(p.dispatch, p.setAppState)
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
                    <a id='aboutButton' href="#home" onClick={() => { ToggleBackGroundMenu('about', p.appState, p.setAppState) }}>
                        {p.backGroundMenu === 'about' ?
                            <Tooltip title="Login" placement="bottom"><LockOpenRoundedIcon /></Tooltip> :
                            <Tooltip title="About Finnhub" placement="bottom"><InfoIcon /></Tooltip>}
                    </a>
                </div>
            </div>
        </>
    );
}
