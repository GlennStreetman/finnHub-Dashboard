import { useNavigate, useLocation } from "react-router-dom";
import { widgetSetup, dashBoardData } from "src/App";
import {
    finnHubQueue,
    createFunctionQueueObject,
} from "src/appFunctions/appImport/throttleQueueAPI";
import { AppBar, Toolbar, Tooltip } from "@mui/material/";
import WidgetsIcon from "@mui/icons-material/Widgets";
import TableChartIcon from "@mui/icons-material/TableChart";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import InfoIcon from "@mui/icons-material/Info";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import AppsIcon from "@mui/icons-material/Apps";
import IconButton from "@mui/material/IconButton";
import { useAppDispatch } from "src/hooks";
import { rDataModelLogout } from "src/slices/sliceDataModel";
import { rExchangeDataLogout } from "src/slices/sliceExchangeData";
import { rExchangeListLogout } from "src/slices/sliceExchangeList";
import { rTargetDashboardLogout } from "src/slices/sliceShowData";

interface topNavProps {
    login: number;
    widgetSetup: widgetSetup;
    updateAppState: Object;
    dashboardData: dashBoardData;
    currentDashboard: string;
    apiKey: string;
    finnHubQueue: finnHubQueue;
}

function TopNav(p: topNavProps) {
    let navigate = useNavigate();
    let location = useLocation();
    const useDispatch = useAppDispatch;
    const dispatch = useDispatch(); //allows widget to run redux actions.
    // const width = useWindowDimensions().width //also returns height

    async function logout() {
        console.log("logout");
        await fetch("/api/logOut"); //ignore result, continue logout process.
        dispatch(rDataModelLogout());
        dispatch(rExchangeDataLogout());
        dispatch(rExchangeListLogout());
        dispatch(rTargetDashboardLogout());
        p.updateAppState["login"](0);
        p.updateAppState["navigate"](null);
        p.updateAppState["finnHubQueue"](
            createFunctionQueueObject(1, 1000, true)
        );
        p.updateAppState["enableDrag"](false);
        p.updateAppState["socket"]("");
        p.updateAppState["socketUpdate"](Date.now());
        p.updateAppState["widgetCopy"](null);
        p.updateAppState["widgetSetup"]({});
        navigate("/splash");
    }

    const showDashBoardButtons = () => {
        if (location.pathname === "/dashboard") {
            return (
                <>
                    <Tooltip title="Add Widget" placement="bottom">
                        <IconButton
                            onClick={() => {
                                navigate("/manageWidgets");
                            }}
                            data-testid="showWidgetManagementMenu"
                        >
                            <WidgetsIcon style={{ fill: "white" }} />
                        </IconButton>
                    </Tooltip>
                </>
            );
        } else {
            return <></>;
        }
    };
    if (location.pathname !== "/splash" && p.login === 1) {
        return (
            <AppBar position="static">
                <Toolbar>
                    {/* {width > 600 ? <img src="logo2.png" alt="logo" /> : <></>} */}
                    <img height="50" width="auto" src="small.png" alt="logo" />

                    <div className="navItemEnd">
                        {showDashBoardButtons()}
                        {location.pathname !== "/dashboard" ? (
                            <IconButton
                                onClick={() => {
                                    navigate("/dashboard");
                                }}
                                data-testid="showDashboardMenu"
                            >
                                <Tooltip
                                    title="Show Dashboards"
                                    placement="bottom"
                                >
                                    <AppsIcon style={{ fill: "white" }} />
                                </Tooltip>
                            </IconButton>
                        ) : (
                            <></>
                        )}

                        {location.pathname !== "/templates" ? (
                            <IconButton
                                onClick={() => {
                                    navigate("/templates");
                                }}
                            >
                                <Tooltip
                                    title="Excel Templates"
                                    placement="bottom"
                                >
                                    <TableChartIcon style={{ fill: "white" }} />
                                </Tooltip>
                            </IconButton>
                        ) : (
                            <></>
                        )}

                        {location.pathname !== "/manageAccount" ? (
                            <IconButton
                                onClick={() => {
                                    navigate("/manageAccount");
                                }}
                            >
                                <Tooltip
                                    title="Manage Account"
                                    placement="bottom"
                                >
                                    <AccountBoxIcon style={{ fill: "white" }} />
                                </Tooltip>
                            </IconButton>
                        ) : (
                            <></>
                        )}
                        {location.pathname !== "/about" ? (
                            <IconButton
                                onClick={() => {
                                    navigate("/about");
                                }}
                            >
                                <Tooltip
                                    title="About Finnhub"
                                    placement="bottom"
                                >
                                    <InfoIcon style={{ fill: "white" }} />
                                </Tooltip>
                            </IconButton>
                        ) : (
                            <></>
                        )}
                        <IconButton
                            id="LogButtonLink"
                            onClick={async () => {
                                logout();
                            }}
                        >
                            <Tooltip title="Logout" placement="bottom">
                                <LockRoundedIcon style={{ fill: "white" }} />
                            </Tooltip>
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
        );
    } else if (location.pathname !== "/splash" && p.login !== 1) {
        return (
            <>
                <div className="topnav">
                    <img height="50" width="auto" src="small.png" alt="logo" />
                    <div className="navItemEnd">
                        {location.pathname === "/about" ? (
                            <IconButton
                                id="loginButton"
                                // onClick={() => {
                                //     navigate("/login");
                                // }}
                            >
                                <Tooltip
                                    title="Login/Register"
                                    placement="bottom"
                                >
                                    <a href={process.env.REACT_APP_LOGIN_LINK}>
                                        <LockOpenRoundedIcon
                                            style={{ fill: "white" }}
                                        />
                                    </a>
                                </Tooltip>
                            </IconButton>
                        ) : (
                            <IconButton
                                id="aboutButton"
                                onClick={() => {
                                    navigate("/about");
                                }}
                            >
                                <Tooltip
                                    title="About Finnhub"
                                    placement="bottom"
                                >
                                    <InfoIcon style={{ fill: "white" }} />
                                </Tooltip>
                            </IconButton>
                        )}
                    </div>
                </div>
            </>
        );
    } else {
        return <></>;
    }
}

export default TopNav;
