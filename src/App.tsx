import React from "react";
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import queryString from "query-string";
import { createTheme, ThemeProvider } from '@material-ui/core/styles'

//app functions
import { createFunctionQueueObject, finnHubQueue } from "./appFunctions/appImport/throttleQueueAPI";
import { LoadTickerSocket } from "./appFunctions/socketData";

//component imports
import TopNav from "./components/topNav";
import Login from "./components/login";
import AboutMenu from "./components/AboutMenu";
import AccountMenu, { accountMenuProps } from "./components/accountMenu";
import WidgetMenu, { widgetMenuProps } from "./components/widgetMenu";
import ExchangeMenu, { exchangeMenuProps } from "./components/exchangeMenu";
import TemplateMenu from "./components/templateMenu";
import { WidgetController } from "./components/widgetController";

//redux imports
// import { connect } from "react-redux";
// import { storeState } from './store'
// import { rSetTargetDashboard } from "./slices/sliceShowData";
import { rResetUpdateFlag, rSetUpdateStatus, } from "./slices/sliceDataModel"; //sliceDataModel, rRebuildTargetDashboardModel 
import { tGetFinnhubData, tgetFinnHubDataReq } from "./thunks/thunkFetchFinnhub";
import { tGetMongoDB } from "./thunks/thunkGetMongoDB";
import { tGetSavedDashboards } from './thunks/thunkGetSavedDashboards'
import { rSetTargetSecurity } from 'src/slices/sliceTargetSecurity'
import { rUpdateCurrentDashboard } from 'src/slices/sliceCurrentDashboard'
import { rSetMenuList, } from 'src/slices/sliceMenuList' //sliceMenuList
import { rSetDashboardData, } from 'src/slices/sliceDashboardData' //sliceDashboardData
import { rUpdateQuotePriceStream } from 'src/slices/sliceQuotePrice'
import { tProcessLogin } from 'src/thunks/thunkProcessLogin'

const outerTheme = createTheme({
    palette: {
        primary: {
            main: '#1d69ab',
        },
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

export default function App() {

    const dispatch = useDispatch(); //allows widget to run redux actions.

    const [login, setLogin] = useState(0) //login state. 0 logged out, 1 logged in.
    const [navigate, setNavigate] = useState<string | null>(null)
    const [finnHubQueue, setFinnHubQueue] = useState(createFunctionQueueObject(1, 1000, true))
    const [enableDrag, setEnableDrag] = useState(false)
    const [socket, setSocket] = useState("") //socket connection for streaming stock data.
    const [socketUpdate, setSocketUpdate] = useState(Date.now())
    const [widgetCopy, setWidgetCopy] = useState(null) //copy of state of widget being dragged.
    const [widgetSetup, setWidgetSetup] = useState({}) //activates premium api routes.

    const updateAppState = {
        login: setLogin,
        navigate: setNavigate,
        finnHubQueue: setFinnHubQueue,
        enableDrag: setEnableDrag,
        socket: setSocket,
        socketUpdate: setSocketUpdate,
        widgetCopy: setWidgetCopy,
        widgetSetup: setWidgetSetup,
    }

    const appState = {
        login: login,
        navigate: navigate,
        finnHubQueue: finnHubQueue,
        enableDrag: enableDrag,
        socket: socket,
        socketUpdate: socketUpdate,
        widgetCopy: widgetCopy,
        widgetSetup: widgetSetup,
        updateAppState: updateAppState,
    }

    const apiKey = useSelector((state) => { return state.apiKey })
    const targetSecurity = useSelector((state) => { return state.targetSecurity })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const globalStockList = useSelector((state) => {
        if (state.dashboardData?.[state.currentDashboard]?.['globalstocklist']) {
            return state.dashboardData[state.currentDashboard]['globalstocklist']
        } else {
            return ({})
        }
    })

    useEffect(() => {
        fetch("/checkLogin")
            .then((response) => response.json())
            .then(async (data) => {
                if (data.login === 1) {
                    const parseSetup: widgetSetup = JSON.parse(data.widgetsetup)
                    const newList: string[] = data.exchangelist.split(",");
                    await dispatch(tProcessLogin({
                        defaultexchange: data.defaultexchange,
                        apiKey: data.apiKey,
                        apiAlias: data.apiAlias,
                        exchangelist: newList
                    }))
                    setLogin(1)
                    setWidgetSetup(parseSetup)
                    setNavigate('dashboard')
                    finnHubQueue.updateInterval(data.ratelimit)
                } else {
                    setNavigate('login')
                }
            })
    }, [])

    useEffect(() => {
        if (login === 1) { //on login build dashboard state, then use state to build redux dataModel.
            console.log('rebuilding state')
            console.log('appState', appState)
            buildDashboardState()
        }
    }, [login])

    useEffect(() => {
        if (navigate) { //on login build dashboard state, then use state to build redux dataModel.
            setNavigate(null)
        }
    }, [navigate])

    useEffect(() => {
        if ((Object.keys(globalStockList).length > 0 && login === 1 && apiKey !== '')) { //price data for watchlist, including socket data.
            LoadTickerSocket(globalStockList, socket, apiKey, socketUpdate, updateAppState, rUpdateQuotePriceStream, dispatch);
        }
    }, [globalStockList, login, apiKey, dispatch])

    useEffect(() => {
        const globalKeys = globalStockList ? Object.keys(globalStockList) : []
        if (targetSecurity === '' && globalKeys.length > 0) {
            dispatch(rSetTargetSecurity(globalKeys[0]))
        }
    }, [globalStockList, targetSecurity, dispatch])

    // function updateAppState(updateObj) {
    //     return new Promise((resolve) => {
    //         setState(updateObj, () => resolve(true))
    //     })
    // }

    async function buildDashboardState() { //fetches dashboard data, then updates p.dashboardData, then builds redux model.
        try {
            const data: any = await dispatch(tGetSavedDashboards({ apiKey: apiKey })).unwrap()
            rUpdateCurrentDashboard(data.currentDashBoard)
            rSetMenuList(data.menuList)
            rSetDashboardData(data.dashBoardData)
            rResetUpdateFlag() //sets all dashboards status to updating in redux store.
            await tGetMongoDB()

            const targetDash: string[] = dashboardData?.[currentDashboard]?.widgetlist ? Object.keys(dashboardData?.[currentDashboard]?.widgetlist) : []
            for (const widget in targetDash) {
                const payload: tgetFinnHubDataReq = { //get data for default dashboard.
                    dashboardID: dashboardData[currentDashboard].id,
                    targetDashBoard: currentDashboard,
                    widgetList: [targetDash[widget]],
                    finnHubQueue: finnHubQueue,
                    rSetUpdateStatus: rSetUpdateStatus,
                }
                tGetFinnhubData(payload)
            }
            const dashBoards: string[] = Object.keys(dashboardData) //get data for dashboards not being shown
            for (const dash of dashBoards) {
                if (dash !== currentDashboard) {
                    const payload: tgetFinnHubDataReq = { //run in background, do not await.
                        dashboardID: dashboardData[dash].id,
                        targetDashBoard: dash,
                        widgetList: Object.keys(dashboardData[dash].widgetlist),
                        finnHubQueue: finnHubQueue,
                        rSetUpdateStatus: rSetUpdateStatus,
                    }
                    await tGetFinnhubData(payload)
                }
            }

        } catch (error: any) {
            console.error("Failed to recover dashboards");
        }
    }

    const quaryData = queryString.parse(window.location.search)

    const navigateComp = () => {
        if (navigate !== null) {
            return <Navigate to={navigate} />
        } else {
            return (<></>)
        }
    }

    const loginComp = <Login
        queryData={quaryData}
        finnHubQueue={finnHubQueue}
        updateAppState={updateAppState}
    />

    const dashboard = <WidgetController
        enableDrag={enableDrag}
        finnHubQueue={finnHubQueue}
        login={login}
        widgetCopy={widgetCopy}
        updateAppState={updateAppState}
    />

    const topNav = <>
        <TopNav
            login={login}
            widgetSetup={widgetSetup}
            updateAppState={updateAppState}
            dashboardData={dashboardData}
            currentDashboard={currentDashboard}
            apiKey={apiKey}
            finnHubQueue={finnHubQueue}
        />
        <Outlet />
    </>

    return (
        <ThemeProvider theme={outerTheme}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={topNav}>
                        {/*  */}
                        <Route path="dashboard" element={<></>} />
                        <Route path="login" element={loginComp} />
                        <Route path="manageAccount" element={React.createElement(AccountMenu, accountMenuProps(appState))} />
                        <Route path="widgetMenu" element={React.createElement(WidgetMenu, widgetMenuProps(appState))} />
                        <Route path="about" element={React.createElement(AboutMenu, {})} />
                        <Route path="exchangeMenu" element={React.createElement(ExchangeMenu, exchangeMenuProps(appState))} />
                        <Route path="templates" element={React.createElement(TemplateMenu)} />
                    </Route>
                </Routes>
                {navigateComp()}
            </BrowserRouter>
        </ThemeProvider>
    );
}

// const mapStateToProps = (state: storeState) => ({
//     exchangeList: state.exchangeList.exchangeList,
//     dataModel: state.dataModel,
//     apiKey: state.apiKey,
//     apiAlias: state.apiAlias,
//     defaultExchange: state.defaultExchange,
//     targetSecurity: state.targetSecurity,
//     currentDashboard: state.currentDashboard,
//     menuList: state.menuList,
//     dashboardData: state.dashboardData
// });

// export default connect(mapStateToProps, {
//     tGetFinnhubData,
//     tGetMongoDB,
//     rResetUpdateFlag,
//     rSetTargetDashboard,
//     rSetUpdateStatus,
//     rRebuildTargetDashboardModel,
//     tGetSavedDashboards,
//     rSetTargetSecurity,
//     rUpdateCurrentDashboard,
//     rSetMenuList,
//     rSetDashboardData,
//     rUpdateQuotePriceStream,
//     tProcessLogin
// })(App);

export interface stock {
    currency: string,
    description: string,
    displaySymbol: string,
    exchange: string,
    figi: string,
    key: string,
    mic: string,
    symbol: string,
    type: string,
}

export interface stockList {
    [key: string]: stock
}

export interface globalStockList {
    [key: string]: stock
}

export interface filters { //unique to each widget, not required
    [key: string]: any
}

export interface config { //unique to each widget, not required
    [key: string]: any
}

export interface widget {
    column: string | number, //can be set to drag.
    columnOrder: number,
    config: config,
    filters: filters,
    showBody: boolean,
    trackedStocks: stockList,
    widgetConfig: string,
    widgetHeader: string,
    widgetID: string | number,
    widgetType: string,
    xAxis: number | string,
    yAxis: number | string,
}

export interface widgetList {
    [key: string]: widget
}

export interface dashboard {
    dashboardname: string,
    globalstocklist: globalStockList,
    id: number,
    widgetlist: widgetList
}

export interface dashBoardData {
    [key: string]: dashboard,
}

export interface defaultGlobalStockList {
    [key: string]: any
}

export interface menu {
    column: number | string,
    columnOrder: number,
    widgetConfig: string,
    widgetHeader: string,
    widgetID: string,
    widgetType: string,
    xAxis: number | string,
    yAxis: number | string,
    showBody: boolean,
}

export interface menuList {
    [key: string]: menu
}

export interface priceObj {
    currentPrice: number
}

export interface widgetSetup {
    [key: string]: boolean
}

interface App { [key: string]: any }

export interface AppState {
    enableDrag: boolean,
    finnHubQueue: finnHubQueue,
    login: number, //login state. 0 logged out, 1 logged in.
    socket: any, //socket connection for streaming stock data.+
    socketUpdate: number,
    widgetCopy: widget | null, //copy of state of widget being dragged.
    widgetSetup: widgetSetup, //activates premium api routes.
    navigate: string | null,
    updateAppState: Object,
}