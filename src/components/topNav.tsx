
import { useNavigate, useLocation } from "react-router-dom";

import { estimateOptions, fundamentalsOptions, priceOptions } from '../registers/topNavReg'
import { widgetSetup, filters, dashBoardData } from 'src/App'
import { finnHubQueue, createFunctionQueueObject } from "src/appFunctions/appImport/throttleQueueAPI";

import { AppBar, Toolbar, Tooltip } from '@material-ui/core/';
import WidgetsIcon from '@material-ui/icons/Widgets';
import TableChartIcon from '@material-ui/icons/TableChart';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import InfoIcon from '@material-ui/icons/Info';
import LockRoundedIcon from '@material-ui/icons/LockRounded';
import LockOpenRoundedIcon from '@material-ui/icons/LockOpenRounded';
import AppsIcon from '@material-ui/icons/Apps';


import { useAppDispatch } from 'src/hooks';

import { rDataModelLogout } from "src/slices/sliceDataModel"
import { rExchangeDataLogout } from "src/slices/sliceExchangeData";
import { rExchangeListLogout } from "src/slices/sliceExchangeList";
import { rTargetDashboardLogout } from "src/slices/sliceShowData";
import { tSaveDashboard } from 'src/thunks/thunkSaveDashboard'
import { tAddNewWidgetContainer } from 'src/thunks/thunkAddNewWidgetContainer'

import useWindowDimensions from '../appFunctions/hooks/windowDimensions'

interface topNavProps {
    login: number,
    widgetSetup: widgetSetup,
    updateAppState: Object,
    dashboardData: dashBoardData,
    currentDashboard: string,
    apiKey: string,
    finnHubQueue: finnHubQueue,
}

function TopNav(p: topNavProps) {
    let navigate = useNavigate();
    let location = useLocation();
    const useDispatch = useAppDispatch
    const dispatch = useDispatch(); //allows widget to run redux actions.
    const width = useWindowDimensions().width //also returns height

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
        console.log('logout')
        await fetch("/logOut") //ignore result, continue logout process.
        dispatch(rDataModelLogout());
        dispatch(rExchangeDataLogout());
        dispatch(rExchangeListLogout());
        dispatch(rTargetDashboardLogout());
        p.updateAppState['login'](0)
        p.updateAppState['navigate'](null)
        p.updateAppState['finnHubQueue'](createFunctionQueueObject(1, 1000, true))
        p.updateAppState['enableDrag'](false)
        p.updateAppState['socket']("")
        p.updateAppState['socketUpdate'](Date.now())
        p.updateAppState['widgetCopy'](null)
        p.updateAppState['widgetSetup']({})
        navigate('/login')
    }

    function dropDownList(dropList: [string, string, string, string, filters | undefined, string][]) {
        let newList = dropList.map((el) => {
            let [widgetDescription, widgetHeader, widgetConfig, d, defaultFilters] = el
            if (isChecked(el) === true) {
                return (<li key={widgetDescription + 'li'} id='ddi'>
                    <a key={widgetDescription} data-testid={d} href="#r" onClick={async () => {

                        const thisDashboard = p.currentDashboard

                        await dispatch(tAddNewWidgetContainer({
                            widgetDescription: widgetDescription, //a
                            widgetHeader: widgetHeader, //b
                            widgetConfig: widgetConfig, //c
                            defaultFilters: defaultFilters, //d
                        })).unwrap()

                        dispatch(tSaveDashboard({ dashboardName: thisDashboard }))
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
        if (location.pathname === '/dashboard') {
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
                {width > 600 ? <img src="logo2.png" alt="logo" /> : <></>}
                <ul id='ddu' className="menu">
                    <li id='ddi'></li>
                    {showDashBoardButtons()}
                </ul>

                <div className="navItemEnd">
                    <ul id='ddu' className="sub-menu">
                        {location.pathname !== '/dashboard' ? (
                            <li id='templatesButton' className="navItem">
                                <a href="#home" onClick={() => { navigate('/dashboard') }}>
                                    <Tooltip title="Show Dashboards" placement="bottom"><AppsIcon /></Tooltip>
                                </a>
                            </li>
                        ) : <></>}

                        {location.pathname !== '/templates' ? (
                            <li id='templatesButton' className="navItem">
                                <a href="#home" onClick={() => { navigate('/templates') }}>
                                    <Tooltip title="Excel Templates" placement="bottom"><TableChartIcon /></Tooltip>
                                </a>
                            </li>
                        ) : <></>}

                        {location.pathname !== '/manageAccount' ? (
                            <li id='manageAccountButton' className="navItem">
                                <a href="#home" onClick={() => { navigate('/manageAccount') }}>
                                    <Tooltip title="Manage Account" placement="bottom"><AccountBoxIcon /></Tooltip>
                                </a>
                            </li>
                        ) : <></>}
                        {location.pathname !== '/about' ? (
                            <li id='aboutButton' className='navItem'>
                                <a href="#home" onClick={() => { navigate('/about') }}>
                                    <Tooltip title="About Finnhub" placement="bottom"><InfoIcon /></Tooltip>
                                </a>
                            </li>
                        ) : <></>}
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
                    <a id='aboutButton' href="#home" onClick={() => { navigate('/about') }}>
                        {location.pathname === '/about' ?
                            <Tooltip title="Login" placement="bottom"><LockOpenRoundedIcon /></Tooltip> :
                            <Tooltip title="About Finnhub" placement="bottom"><InfoIcon /></Tooltip>}
                    </a>
                </div>
            </div>
        </>
    );
}

export default TopNav