
import { useNavigate, useLocation } from "react-router-dom";

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
import Button from '@material-ui/core/Button';


import { useAppDispatch } from 'src/hooks';

import { rDataModelLogout } from "src/slices/sliceDataModel"
import { rExchangeDataLogout } from "src/slices/sliceExchangeData";
import { rExchangeListLogout } from "src/slices/sliceExchangeList";
import { rTargetDashboardLogout } from "src/slices/sliceShowData";

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

    // function isChecked(el: [string, string, string, string, filters | undefined, string]) {
    //     if (p.widgetSetup?.[el[0]] !== undefined) {
    //         return p.widgetSetup[el[0]]
    //     } else if (p.widgetSetup?.[el[0]] === undefined && el[5] === 'Free') {
    //         return true
    //     } else {
    //         return false
    //     }
    // }

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


    const showDashBoardButtons = () => {
        if (location.pathname === '/dashboard') {
            return (<>
                {/* <li id='ddi' className="menu-item-has-children"> */}
                <Tooltip title="Add Widget" placement="bottom">
                    <Button onClick={() => { navigate('/manageWidgets') }} data-testid="widgetsDropdown">
                        <WidgetsIcon style={{ fill: 'white' }} />
                    </Button>
                </Tooltip>
                {/* {widgetDropDown} */}
                {/* </li> */}

            </>
            )
        } else { return <></> }
    }

    return p.login === 1 ? (
        <AppBar position="static">
            <Toolbar >
                {width > 600 ? <img src="logo2.png" alt="logo" /> : <></>}
                {/* <ul id='ddu' className="menu">
                    <li id='ddi'></li>

                </ul> */}

                <div className="navItemEnd">
                    {/* <ul id='ddu' className="sub-menu"> */}
                    {showDashBoardButtons()}
                    {location.pathname !== '/dashboard' ? (
                        // <li id='templatesButton' className="navItem">
                        <Button onClick={() => { navigate('/dashboard') }}>
                            <Tooltip title="Show Dashboards" placement="bottom"><AppsIcon style={{ fill: 'white' }} /></Tooltip>
                        </Button>
                        // </li>
                    ) : <></>}

                    {location.pathname !== '/templates' ? (
                        // <li id='templatesButton' className="navItem">
                        <Button onClick={() => { navigate('/templates') }}>
                            <Tooltip title="Excel Templates" placement="bottom"><TableChartIcon style={{ fill: 'white' }} /></Tooltip>
                        </Button>
                        // </li>
                    ) : <></>}

                    {location.pathname !== '/manageAccount' ? (
                        // <li id='manageAccountButton' className="navItem">
                        <Button onClick={() => { navigate('/manageAccount') }}>
                            <Tooltip title="Manage Account" placement="bottom"><AccountBoxIcon style={{ fill: 'white' }} /></Tooltip>
                        </Button>
                        // </li>
                    ) : <></>}
                    {location.pathname !== '/about' ? (
                        // <li id='aboutButton' className='navItem'>
                        <Button onClick={() => { navigate('/about') }}>
                            <Tooltip title="About Finnhub" placement="bottom"><InfoIcon style={{ fill: 'white' }} /></Tooltip>
                        </Button>
                        // </li>
                    ) : <></>}
                    {/* <li id='LogButton' className='navItem'> */}
                    <Button id='LogButtonLink' onClick={async () => { logout() }}>
                        <Tooltip title="Logout" placement="bottom"><LockRoundedIcon style={{ fill: 'white' }} /></Tooltip>
                    </Button>
                    {/* </li> */}

                    {/* </ul> */}
                </div>
            </Toolbar>
        </AppBar >

    ) : (
        <>
            <div className="topnav">
                <div className='navItemEnd'>
                    {location.pathname === '/about' ?
                        <Button id='aboutButton' onClick={() => { navigate('/login') }}>
                            <Tooltip title="Login" placement="bottom"><LockOpenRoundedIcon style={{ fill: 'white' }} /></Tooltip>
                        </Button> :
                        <Button id='aboutButton' onClick={() => { navigate('/about') }}>
                            <Tooltip title="About Finnhub" placement="bottom"><InfoIcon style={{ fill: 'white' }} /></Tooltip>
                        </Button>
                    }
                </div>
            </div>
        </>
    );
}

export default TopNav
