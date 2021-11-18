import React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import queryString from "query-string";
import produce from 'immer'
import { createTheme, ThemeProvider } from '@material-ui/core/styles'

import { useAppDispatch, useAppSelector } from './hooks';


//app functions
import { createFunctionQueueObject, finnHubQueue } from "./appFunctions/appImport/throttleQueueAPI";
// import { UpdateTickerSockets, LoadTickerSocket } from "./appFunctions/socketData";
import { logoutServer, Logout, ProcessLogin } from "./appFunctions/appImport/appLogin";
// import {
//      RemoveWidget,
//     UpdateWidgetStockList, UpdateWidgetConfig,
//     ToggleWidgetBody, SetWidgetFocus, RemoveDashboardFromState
// } from "./appFunctions/appImport/widgetLogic";
import { NewDashboard, CopyDashboard } from "./appFunctions/appImport/setupDashboard";
import { GetSavedDashBoards, GetSavedDashBoardsRes } from "./appFunctions/appImport/getSavedDashboards";
// import { SetDrag, MoveWidget, SnapOrder, SnapWidget } from "./appFunctions/appImport/widgetGrid";
// import { updateGlobalStockList, setNewGlobalStockList } from "./appFunctions/appImport/updateGlobalStockList"
// import { syncGlobalStockList } from "./appFunctions/appImport/syncGlobalStockList"
// import { toggleBackGroundMenu } from "./appFunctions/appImport/toggleBackGroundMenu"
import { updateWidgetSetup } from "./appFunctions/appImport/updateWidgetSetup"


//component imports
import TopNav from "./components/topNav";
// import BottomNav from "./components/bottomNav";
import Login from "./components/login";
import AboutMenu from "./components/AboutMenu";
import AccountMenu, { accountMenuProps } from "./components/accountMenu";
import WidgetMenu, { widgetMenuProps } from "./components/widgetMenu";
// import EndPointMenu, { endPointProps } from "./widgets/Menu/GQLMenu/endPointMenu";
import ExchangeMenu, { exchangeMenuProps } from "./components/exchangeMenu";
import TemplateMenu, { templateMenuProps } from "./components/templateMenu";
import { WidgetController } from "./components/widgetController";

//redux imports
// import { connect } from "react-redux";
// import { storeState } from './store'
import { tGetSymbolList, rExchangeDataLogout } from "./slices/sliceExchangeData";
import { rSetTargetDashboard, rTargetDashboardLogout } from "./slices/sliceShowData";
// import { rUpdateExchangeList, rExchangeListLogout } from "./slices/sliceExchangeList";
// import { rUpdateQuotePriceStream, rUpdateQuotePriceSetup } from "./slices/sliceQuotePrice";
import {
    rBuildDataModel, rResetUpdateFlag, rSetUpdateStatus,
    sliceDataModel, rDataModelLogout, rRebuildTargetDashboardModel,
    rRebuildTargetWidgetModel, rAddNewDashboard
} from "./slices/sliceDataModel";
import { tGetFinnhubData, tgetFinnHubDataReq } from "./thunks/thunkFetchFinnhub";
import { tGetMongoDB } from "./thunks/thunkGetMongoDB";
import { rUpdateCurrentDashboard } from './slices/sliceCurrentDashboard'
import { rSetTargetSecurity } from "./slices/sliceTargetSecurity";
import { rSetMenuList, sliceMenuList } from "./slices/sliceMenuList";
import { stockList, widget, sliceDashboardData, rSetDashboardData } from './slices/sliceDashboardData'
import { rSetApiKey } from './slices/sliceAPiKey'
// import { rSetApiAlias } from './slices/sliceApiAlias'
// import { rSetDefaultExchange } from './slices/sliceDefaultExchange'

export interface defaultGlobalStockList {
    [key: string]: any
}

export interface priceObj {
    currentPrice: number
}

export interface widgetSetup {
    [key: string]: boolean
}

interface App { [key: string]: any }

export interface AppProps {
    apiKey: string,
    apiAlias: string,
    defaultExchange: string,
    exchangeList: string[],
    dashboardData: sliceDashboardData,
    menuList: sliceMenuList,
    targetSecurity: string,
    currentDashboard: string,
    dataModel: sliceDataModel,
    tGetSymbolList: Function,
    tGetFinnhubData: Function,
    tGetMongoDB: Function,
    rBuildDataModel: Function,
    rRebuildTargetDashboardModel: Function,
    rResetUpdateFlag: Function,
    rSetTargetDashboard: Function,
    rSetUpdateStatus: Function,
    rUpdateExchangeList: Function,
    rDataModelLogout: Function,
    rExchangeDataLogout: Function,
    rExchangeListLogout: Function,
    rTargetDashboardLogout: Function,
    rRebuildTargetWidgetModel: Function,
    rUpdateQuotePriceStream: Function,
    rUpdateQuotePriceSetup: Function,
    rAddNewDashboard: Function,
    rUpdateCurrentDashboard: Function,
    rSetTargetSecurity: Function,
    rSetMenuList: Function,
    rSetDashboardData: Function,
    rSetApiKey: Function,
    rSetApiAlias,
    rSetDefaultExchange,
}

export interface AppState {
    accountMenu: number,
    aboutMenu: number,
    apiFlag: number, //set to 1 when retrieval of apiKey is needed, 2 if problem with API key.
    backGroundMenuFlag: string, //reference to none widet info displayed when s.showWidget === 0
    enableDrag: boolean,
    finnHubQueue: finnHubQueue,
    login: number, //login state. 0 logged out, 1 logged in.
    loadStartingDashBoard: number, //flag switches to 1 after attemping to load default dashboard.
    showMenuColumn: boolean, //true shows column 0
    saveDashboardThrottle: number, //delay timer for saving dashboard.
    saveDashboardFlag: boolean, //sets to true when a save starts.
    socket: any, //socket connection for streaming stock data.+
    socketUpdate: number,
    showStockWidgets: number, //0 hide dashboard, 1 show dashboard.
    widgetCopy: widget | null, //copy of state of widget being dragged.
    widgetLockDown: number, //1 removes buttons from all widgets.
    widgetSetup: widgetSetup, //activates premium api routes.
    zIndex: string[], //list widgets. Index location sets zIndex
}

export interface setApp {
    setAccountMenu: Function,
    setAboutMenu: Function,
    setApiFlag: Function, //set to 1 when retrieval of apiKey is needed, 2 if problem with API key.
    setBackGroundMenuFlag: Function, //reference to none widet info displayed when s.showWidget === 0
    setEnableDrag: Function,
    setFinnHubQueue: Function,
    setLogin: Function, //login state. 0 logged out, 1 logged in.
    setLoadStartingDashBoard: Function, //flag switches to 1 after attemping to load default dashboard.
    setShowMenuColumn: Function, //true shows column 0
    setSaveDashboardThrottle: Function, //delay timer for saving dashboard.
    setSaveDashboardFlag: Function, //sets to true when a save starts.
    setSocket: Function, //socket connection for streaming stock data.+
    setSocketUpdate: Function,
    setShowStockWidgets: Function, //0 hide dashboard, 1 show dashboard.
    setWidgetCopy: Function, //copy of state of widget being dragged.
    setWidgetLockDown: Function, //1 removes buttons from all widgets.
    setWidgetSetup: Function, //activates premium api routes.
    setZIndex: Function, //list widgets. Index location sets zIndex
}

const outerTheme = createTheme({
    palette: {
        primary: {
            // light: '#757ce8',
            main: '#1d69ab',
            // dark: '#002884',
            // contrastText: '#fff',
        },

        //   secondary: {
        //     light: '#ff7961',
        //     main: '#f44336',
        //     dark: '#ba000d',
        //     contrastText: '#000',
        //   },
    },
    breakpoints: {
        values: {
            xs: 400, //12
            sm: 800, //6
            md: 1200, //4
            lg: 1600, //3
            xl: 2400, //2
        },
    },
});

const useDispatch = useAppDispatch
const useSelector = useAppSelector


function App() {

    const dispatch = useDispatch(); //allows widget to run redux actions.

    const [accountMenu, setAccountMenu] = useState(0)
    const [aboutMenu, setAboutMenu] = useState(0)
    const [apiFlag, setApiFlag] = useState(0) //set to 1 when retrieval of apiKey is needed, 2 if problem with API key.
    const [backGroundMenuFlag, setBackGroundMenuFlag] = useState("") //reference to none widet info displayed when s.showWidget === 0
    const [finnHubQueue, setFinnHubQueue] = useState(createFunctionQueueObject(1, 1000, true))
    const [login, setLogin] = useState(0) //login state. 0 logged out, 1 process login. 2 logged in.
    const [loadStartingDashBoard, setLoadStartingDashbBoard] = useState(0) //flag switches to 1 after attemping to load default dashboard.
    const [showMenuColumn, setShowMenuColumn] = useState(true) //true shows column 0
    const [enableDrag, setEnableDrag] = useState(false)
    const [saveDashboardThrottle, setSaveDashboardThrottle] = useState(Date.now())
    const [saveDashboardFlag, setSaveDashboardFlag] = useState(false)
    const [socket, setSocket] = useState("") //socket connection for streaming stock data.
    const [socketUpdate, setSocketUpdate] = useState(Date.now())
    const [showStockWidgets, setShowStockWidgets] = useState(1) //0 hide dashboard, 1 show dashboard.
    const [widgetCopy, setWidgetCopy] = useState(null) //copy of state of widget being dragged.
    const [widgetLockDown, setWidgetLockDown] = useState(0) //1 removes buttons from all widgets.
    const [widgetSetup, setWidgetSetup] = useState({})//items added to list add premium api route widgets (i.e. NOT FREE from finnhub.io).
    const [zIndex, setZIndex] = useState([]) //list widgets. Index location sets zIndex

    const appState: AppState = {
        accountMenu: accountMenu,
        aboutMenu: aboutMenu,
        apiFlag: apiFlag,
        backGroundMenuFlag: backGroundMenuFlag,
        finnHubQueue: finnHubQueue,
        login: login,
        loadStartingDashBoard: loadStartingDashBoard,
        showMenuColumn: showMenuColumn,
        enableDrag: enableDrag,
        saveDashboardThrottle: saveDashboardThrottle,
        saveDashboardFlag: saveDashboardFlag,
        socket: socket,
        socketUpdate: socketUpdate,
        showStockWidgets: showStockWidgets,
        widgetCopy: widgetCopy,
        widgetLockDown: widgetLockDown,
        widgetSetup: widgetSetup,
        zIndex: zIndex,
    }

    const setAppState: setApp = {
        setAccountMenu: setAccountMenu,
        setAboutMenu: setAboutMenu,
        setApiFlag: setApiFlag,
        setBackGroundMenuFlag: setBackGroundMenuFlag,
        setFinnHubQueue: setFinnHubQueue,
        setLogin: setLogin,
        setLoadStartingDashBoard: setLoadStartingDashbBoard,
        setShowMenuColumn: setShowMenuColumn,
        setEnableDrag: setEnableDrag,
        setSaveDashboardThrottle: setSaveDashboardThrottle,
        setSaveDashboardFlag: setSaveDashboardFlag,
        setSocket: setSocket,
        setSocketUpdate: setSocketUpdate,
        setShowStockWidgets: setShowStockWidgets,
        setWidgetCopy: setWidgetCopy,
        setWidgetLockDown: setWidgetLockDown,
        setWidgetSetup: setWidgetSetup,
        setZIndex: setZIndex,
    }

    // const baseState = this.state; //used to reset state upon logout.

    const apiKey = useSelector((state) => { return state.apiKey })
    const apiAlias = useSelector((state) => { return state.apiAlias })
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const dataModel = useSelector((state) => { return state.dataModel })
    const menuList = useSelector((state) => { return state.menuList })
    const exchangeList = useSelector((state) => { return state.exchangeList.exchangeList })
    const defaultExchange = useSelector((state) => { return state.defaultExchange })

    //ALL EFFECTS
    useEffect(() => { //process login. This should be moved into login function.
        if (login === 1) {
            setLogin(2)
            rebuildDashboardState()
        }
    }, [login])

    useEffect(() => { //create new dashboard if none exists. This should be moved server side. A dashboard should always be returned.
        if (dashboardData?.[currentDashboard] && !dashboardData?.[currentDashboard]?.id) {
            NewDashboard(currentDashboard, dashboardData, setZIndex)
        }
    }, [dashboardData, currentDashboard])

    useEffect(() => { //on login or data model update update dataset with finnHub data.
        if ((dataModel.created === 'true' && login === 1) || (dataModel.created === 'updated' && login === 1)) {
            dispatch(rResetUpdateFlag()) //sets all dashboards status to updating in redux store.
            refreshFinnhubAPIDataAll() //fetches finnhub api data, from mongo if avilable, else queues Finnhub.io api alls. When complete sets dashboard status ready.
        }
    }, [dataModel.created, login])

    // useEffect(()=>{                   MOVE INTO SNACK BAR!

    //     if ( //if apikey not setup show about menu
    //         (apiKey === '' && s.apiFlag === 0 && s.login === 1) ||
    //         (apiKey === null && s.apiFlag === 0 && s.login === 1)
    //     ) {
    //         this.setState({
    //             apiFlag: 1,
    //             aboutMenu: 0,
    //             showStockWidgets: 0,
    //         }, () => { this.toggleBackGroundMenu('about') })
    //     }
    // }, [])

    // useEffect(()=>{}, [])

    const rebuildDashboardState = async function () { //fetches dashboard data, then updates dashboardData, then builds redux model.
        // console.log('running rebuild')
        try {
            const data: GetSavedDashBoardsRes = await GetSavedDashBoards()
            if ((data.dashboardData[data.currentDashBoard] === undefined && Object.keys(data.dashboardData))) { //if invalid current dashboard returned
                console.log('invalid dashboard')
                data.currentDashBoard = Object.keys(data.dashboardData)[0]
            }
            dispatch(rSetDashboardData(data.dashboardData))
            dispatch(rUpdateCurrentDashboard(data.currentDashBoard))
            dispatch(rSetMenuList(data.menuList))
            dispatch(rSetTargetDashboard({ targetDashboard: data.currentDashBoard })) //update target dashboard in redux dataModel
            dispatch(rBuildDataModel({ ...data, apiKey: apiKey }))
            if (data.message === 'No saved dashboards') { return (true) } else { return (false) }

        } catch (error: any) {
            console.error("Failed to recover dashboards", error);
            return false
        }
    }

    // const globalStockList = dashboardData?.[p.currentDashboard]?.globalstocklist ? dashboardData?.[p.currentDashboard].globalstocklist : false
    // if ((globalStockList && globalStockList !== prevProps.dashboardData?.[prevProps.currentDashboard]?.globalstocklist && s.login === 1)) { //price data for watchlist, including socket data.
    //     LoadTickerSocket(this, prevState, prevProps, globalStockList, s.socket, apiKey, UpdateTickerSockets);
    // }

    // const globalKeys = globalStockList ? Object.keys(globalStockList) : []
    // if (targetSecurity === '' && globalKeys.length > 0) {
    //     rSetTargetSecurity(globalKeys[0])
    // }

    const refreshFinnhubAPIDataCurrentDashboard = async function () { //queues all finnhub data to be refreshed for current dashboard.
        console.log('refresh finnhub data for current dashboard', currentDashboard)
        await dispatch(tGetMongoDB({ dashboard: dashboardData[currentDashboard].id }))
        const payload: tgetFinnHubDataReq = {
            dashboardID: dashboardData[currentDashboard].id,
            widgetList: Object.keys(dashboardData[currentDashboard].widgetlist),
            finnHubQueue: finnHubQueue,
            rSetUpdateStatus: rSetUpdateStatus,
        }
        dispatch(tGetFinnhubData(payload))
    }

    const refreshFinnhubAPIDataAll = async function () { //queues all finnhub data to be refreshes for all dashboards.
        await dispatch(tGetMongoDB())
        const targetDash: string[] = dashboardData?.[currentDashboard]?.widgetlist ? Object.keys(dashboardData?.[currentDashboard]?.widgetlist) : []
        for (const widget in targetDash) {
            const payload: tgetFinnHubDataReq = { //get data for default dashboard.
                dashboardID: dashboardData[currentDashboard].id,
                widgetList: [targetDash[widget]],
                finnHubQueue: finnHubQueue,
                rSetUpdateStatus: rSetUpdateStatus,
            }
            dispatch(tGetFinnhubData(payload))
        }
        const dashBoards: string[] = Object.keys(dashboardData) //get data for dashboards not being shown
        for (const dash of dashBoards) {
            if (dash !== currentDashboard) {
                const payload: tgetFinnHubDataReq = { //run in background, do not await.
                    dashboardID: dashboardData[dash].id,
                    widgetList: Object.keys(dashboardData[dash].widgetlist),
                    finnHubQueue: finnHubQueue,
                    rSetUpdateStatus: rSetUpdateStatus,
                }
                await dispatch(tGetFinnhubData(payload))
            }
        }
    }

    function rebuildVisableDashboard() {
        const payload = {
            apiKey: apiKey,
            dashboardData: dashboardData,
            targetDashboard: currentDashboard,
        }
        dispatch(rRebuildTargetDashboardModel(payload)) //rebuilds redux.Model
        refreshFinnhubAPIDataCurrentDashboard() //queue refresh for all finhub data for this dashboard.
    }

    function uploadGlobalStockList(newStockObj: stockList) {
        const newDashboardObj = produce(dashboardData, (draftState: sliceDashboardData) => {
            draftState[currentDashboard].globalstocklist = newStockObj
            return draftState
        })

        dispatch(rSetDashboardData(newDashboardObj))
    }

    function updateAPIKey(newKey: string) {
        dispatch(rSetApiKey(newKey))
    }

    function setSecurityFocus(target: string) {
        dispatch(rSetTargetSecurity(target))
        return true
        // this.setState({ targetSecurity: target }, () => { return true })
    }


    const quaryData = queryString.parse(window.location.search);
    const loginScreen =
        login === 0 && backGroundMenuFlag === "" ? (
            <Login
                queryData={quaryData}
                finnHubQueue={finnHubQueue}
                setAppState={setAppState}
                dispatch={dispatch}
            />
        ) : (
            <></>
        );

    const accountMenuPropsObj: accountMenuProps = {
        finnHubQueue: finnHubQueue,
        apiKey: apiKey,
        widgetKey: 'AccountMenu',
        updateAPIKey: updateAPIKey,
        exchangeList: exchangeList,
        tGetSymbolList: tGetSymbolList,
        defaultExchange: defaultExchange,
        AppState: appState,
        setAppState: setAppState,
    }

    const widgetMenuPropsObj: widgetMenuProps = {
        updateWidgetSetup: updateWidgetSetup,
        widgetSetup: widgetSetup,
    }

    const exchangeMenuProps: exchangeMenuProps = {
        apiKey: apiKey,
        finnHubQueue: finnHubQueue,
        exchangeList: exchangeList,
        dispatch: dispatch,
    }

    const templateMenuProp: templateMenuProps = {
        apiKey: apiKey,
        apiAlias: apiAlias,
    }

    const backGroundSelection: { [key: string]: React.ReactElement } = { //topnav menus.
        manageAccount: React.createElement(AccountMenu, accountMenuPropsObj),
        widgetMenu: React.createElement(WidgetMenu, widgetMenuPropsObj),
        about: React.createElement(AboutMenu, { apiFlag: apiFlag }),
        exchangeMenu: React.createElement(ExchangeMenu, exchangeMenuProps),
        templates: React.createElement(TemplateMenu, templateMenuProp),
    };

    const backGroundMenu = () => {
        return <div className="backgroundMenu">{backGroundSelection[backGroundMenuFlag]}</div>;
    };

    const widgetList = dashboardData?.[currentDashboard]?.['widgetlist'] ?
        dashboardData?.[currentDashboard]['widgetlist'] : {}

    const globalStockList = dashboardData?.[currentDashboard]?.globalstocklist ? dashboardData?.[currentDashboard].globalstocklist : {}
    const dashboardID = dashboardData?.[currentDashboard]?.id ? dashboardData[currentDashboard].id : ''

    return (
        <ThemeProvider theme={outerTheme}>
            <BrowserRouter>
                <Switch>
                    <Route path="/">
                        <TopNav
                            backGroundMenu={backGroundMenuFlag}
                            finnHubQueue={finnHubQueue}
                            login={login}
                            logoutServer={logoutServer}
                            showStockWidgets={showStockWidgets}
                            widgetSetup={widgetSetup}
                            setAppState={setAppState}
                            appState={appState}
                            dispatch={dispatch}
                        />
                        <WidgetController
                            setAppState={setAppState}
                            appState={appState}
                            dispatch={dispatch}
                        />
                        {loginScreen}
                        {backGroundMenu()}

                    </Route>
                </Switch>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;

