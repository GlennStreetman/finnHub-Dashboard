
import { useNavigate, useLocation } from "react-router-dom";
import { widgetSetup, dashBoardData } from 'src/App'
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
import IconButton from '@material-ui/core/IconButton';
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
        navigate('/splash')
    }

    const showDashBoardButtons = () => {
        if (location.pathname === '/dashboard') {
            return (<>
                <Tooltip title="Add Widget" placement="bottom">
                    <Button onClick={() => { navigate('/manageWidgets') }} data-testid="widgetsDropdown">
                        <WidgetsIcon style={{ fill: 'white' }} />
                    </Button>
                </Tooltip>
            </>
            )
        } else { return <></> }
    }
    if (location.pathname !== '/splash' && p.login === 1) {
        return (
            <AppBar position="static">
                <Toolbar >
                    {/* {width > 600 ? <img src="logo2.png" alt="logo" /> : <></>} */}
                    <img height='50' width='auto' src="small.png" alt="logo" />

                    <div className="navItemEnd">
                        {showDashBoardButtons()}
                        {location.pathname !== '/dashboard' ? (
                            <IconButton onClick={() => { navigate('/dashboard') }}>
                                <Tooltip title="Show Dashboards" placement="bottom"><AppsIcon style={{ fill: 'white' }} /></Tooltip>
                            </IconButton>
                        ) : <></>}

                        {location.pathname !== '/templates' ? (
                            <IconButton onClick={() => { navigate('/templates') }}>
                                <Tooltip title="Excel Templates" placement="bottom"><TableChartIcon style={{ fill: 'white' }} /></Tooltip>
                            </IconButton>
                        ) : <></>}

                        {location.pathname !== '/manageAccount' ? (
                            <IconButton onClick={() => { navigate('/manageAccount') }}>
                                <Tooltip title="Manage Account" placement="bottom"><AccountBoxIcon style={{ fill: 'white' }} /></Tooltip>
                            </IconButton>

                        ) : <></>}
                        {location.pathname !== '/about' ? (
                            <IconButton onClick={() => { navigate('/about') }}>
                                <Tooltip title="About Finnhub" placement="bottom"><InfoIcon style={{ fill: 'white' }} /></Tooltip>
                            </IconButton>
                        ) : <></>}
                        <IconButton id='LogButtonLink' onClick={async () => { logout() }}>
                            <Tooltip title="Logout" placement="bottom"><LockRoundedIcon style={{ fill: 'white' }} /></Tooltip>
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar >
        )
    } else if (location.pathname !== '/splash' && p.login !== 1) {
        return (
            <>
                <div className="topnav">
                    <img height='50' width='auto' src="small.png" alt="logo" />
                    <div className='navItemEnd'>
                        {location.pathname === '/about' ?
                            <IconButton id='aboutButton' onClick={() => { navigate('/login') }}>
                                <Tooltip title="Login/Register" placement="bottom"><LockOpenRoundedIcon style={{ fill: 'white' }} /></Tooltip>
                            </IconButton> :
                            <IconButton id='aboutButton' onClick={() => { navigate('/about') }}>
                                <Tooltip title="About Finnhub" placement="bottom"><InfoIcon style={{ fill: 'white' }} /></Tooltip>
                            </IconButton>
                        }
                    </div>
                </div>
            </>
        )
    } else { return (<></>) }
}

export default TopNav
