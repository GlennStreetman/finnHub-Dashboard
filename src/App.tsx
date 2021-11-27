import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import queryString from "query-string";
import { createTheme, ThemeProvider } from '@material-ui/core/styles'

//app functions
import { createFunctionQueueObject, finnHubQueue } from "./appFunctions/appImport/throttleQueueAPI";
import { UpdateTickerSockets, LoadTickerSocket } from "./appFunctions/socketData";
import { saveDashboard } from "./appFunctions/appImport/setupDashboard";

//component imports
import TopNav from "./components/topNav";
import Login from "./components/login";
import AboutMenu from "./components/AboutMenu";
import AccountMenu, { accountMenuProps } from "./components/accountMenu";
import WidgetMenu, { widgetMenuProps } from "./components/widgetMenu";
import ExchangeMenu, { exchangeMenuProps } from "./components/exchangeMenu";
import TemplateMenu, { templateMenuProps } from "./components/templateMenu";
import { WidgetController } from "./components/widgetController";

//redux imports
import { connect } from "react-redux";
import { storeState } from './store'
import { tGetSymbolList, rExchangeDataLogout } from "./slices/sliceExchangeData";
import { rSetTargetDashboard, rTargetDashboardLogout } from "./slices/sliceShowData";
import { rExchangeListLogout } from "./slices/sliceExchangeList";
import { rUpdateQuotePriceStream, rUpdateQuotePriceSetup } from "./slices/sliceQuotePrice";
import {
    rBuildDataModel, rResetUpdateFlag, rSetUpdateStatus,
    sliceDataModel, rDataModelLogout, rRebuildTargetDashboardModel,
    rRebuildTargetWidgetModel
} from "./slices/sliceDataModel";
import { tGetFinnhubData, tgetFinnHubDataReq } from "./thunks/thunkFetchFinnhub";
import { tGetMongoDB } from "./thunks/thunkGetMongoDB";
import { tGetSavedDashboards } from './thunks/thunkGetSavedDashboards'
import { rSetTargetSecurity } from 'src/slices/sliceTargetSecurity'
import { rUpdateCurrentDashboard } from 'src/slices/sliceCurrentDashboard'
import { rSetMenuList, sliceMenuList } from 'src/slices/sliceMenuList'
import { rSetDashboardData, sliceDashboardData } from 'src/slices/sliceDashboardData'



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

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);

        this.state = {
            accountMenu: 0,
            aboutMenu: 0,
            apiFlag: 0, //set to 1 when retrieval of apiKey is needed, 2 if problem with API key.
            backGroundMenu: "", //reference to none widet info displayed when s.showWidget === 0
            finnHubQueue: createFunctionQueueObject(1, 1000, true),
            login: 0, //login state. 0 logged out, 1 logged in.
            showMenuColumn: true, //true shows column 0
            enableDrag: false,
            saveDashboardThrottle: Date.now(),
            saveDashboardFlag: false,
            socket: "", //socket connection for streaming stock data.
            socketUpdate: Date.now(),
            showStockWidgets: 1, //0 hide dashboard, 1 show dashboard.
            widgetCopy: null, //copy of state of widget being dragged.
            widgetSetup: {},//activates premium api routes.
            zIndex: [], //list widgets. Index location sets zIndex
        };

        this.baseState = this.state; //used to reset state upon logout.
        //login state logic.

        //App logic for setting up dashboards.
        this.saveDashboard = saveDashboard.bind(this); //this will probable be last function to be unbound, not from this file.
        this.updateAppState = this.updateAppState.bind(this)

        //update and apply state, in module.
        this.rebuildDashboardState = this.rebuildDashboardState.bind(this) //sets p.dashboardData. Used to build dataModel in redux
        this.rebuildVisableDashboard = this.rebuildVisableDashboard.bind(this) //rebuilds dashboard in redux state.dataModel
    }

    componentDidUpdate(prevProps: AppProps, prevState: AppState) {

        if (this.state.login === 1 && prevState.login === 0) { //on login build dashboard state, then use state to build redux dataModel.
            console.log('rebuilding state')
            this.rebuildDashboardState()
        }

        if ( //if apikey not setup show about menu
            (this.props.apiKey === '' && this.state.apiFlag === 0 && this.state.login === 1) ||
            (this.props.apiKey === null && this.state.apiFlag === 0 && this.state.login === 1)
        ) {
            this.setState({
                apiFlag: 1,
                aboutMenu: 0,
                showStockWidgets: 0,
                backGroundMenu: 'about',
            })
        }

        const globalStockList = this.props.dashboardData?.[this.props.currentDashboard]?.globalstocklist ? this.props.dashboardData?.[this.props.currentDashboard].globalstocklist : false
        if ((globalStockList && globalStockList !== prevProps.dashboardData?.[prevProps.currentDashboard]?.globalstocklist && this.state.login === 1)) { //price data for watchlist, including socket data.
            LoadTickerSocket(this, prevState, prevProps, globalStockList, this.state.socket, this.props.apiKey, UpdateTickerSockets);
        }

        const globalKeys = globalStockList ? Object.keys(globalStockList) : []
        if (this.props.targetSecurity === '' && globalKeys.length > 0) {
            this.props.rSetTargetSecurity(globalKeys[0])
        }
    }

    componentWillUnmount() {
        if (this.state.socket !== "") {
            this.state.socket.close();
        }
    }

    updateAppState(updateObj) {
        return new Promise((resolve) => {
            this.setState(updateObj, () => resolve(true))
        })
    }

    async rebuildDashboardState() { //fetches dashboard data, then updates p.dashboardData, then builds redux model.
        try {
            const data = await this.props.tGetSavedDashboards({ apiKey: this.props.apiKey }).unwrap()

            this.props.rUpdateCurrentDashboard(data.currentDashBoard)
            this.props.rSetMenuList(data.menuList)
            this.props.rSetDashboardData(data.dashBoardData)
            this.props.rResetUpdateFlag() //sets all dashboards status to updating in redux store.

            const s: AppState = this.state;
            const p: AppProps = this.props;
            await p.tGetMongoDB()
            const targetDash: string[] = p.dashboardData?.[p.currentDashboard]?.widgetlist ? Object.keys(p.dashboardData?.[p.currentDashboard]?.widgetlist) : []
            for (const widget in targetDash) {
                const payload: tgetFinnHubDataReq = { //get data for default dashboard.
                    dashboardID: p.dashboardData[p.currentDashboard].id,
                    targetDashBoard: p.currentDashboard,
                    widgetList: [targetDash[widget]],
                    finnHubQueue: s.finnHubQueue,
                    rSetUpdateStatus: p.rSetUpdateStatus,
                }
                p.tGetFinnhubData(payload)
            }
            const dashBoards: string[] = Object.keys(p.dashboardData) //get data for dashboards not being shown
            for (const dash of dashBoards) {
                if (dash !== p.currentDashboard) {
                    const payload: tgetFinnHubDataReq = { //run in background, do not await.
                        dashboardID: p.dashboardData[dash].id,
                        targetDashBoard: dash,
                        widgetList: Object.keys(p.dashboardData[dash].widgetlist),
                        finnHubQueue: s.finnHubQueue,
                        rSetUpdateStatus: p.rSetUpdateStatus,
                    }
                    await p.tGetFinnhubData(payload)
                }
            }

        } catch (error: any) {
            console.error("Failed to recover dashboards");
        }
    }

    async rebuildVisableDashboard() {
        const payload = {
            apiKey: this.props.apiKey,
            dashBoardData: this.props.dashboardData[this.props.currentDashboard],
            targetDashboard: this.props.currentDashboard,
        }
        this.props.rRebuildTargetDashboardModel(payload) //rebuilds redux.Model
        const s: AppState = this.state;
        const p: AppProps = this.props;
        await p.tGetMongoDB({ dashboard: p.dashboardData[p.currentDashboard].id })
        const payload2: tgetFinnHubDataReq = {
            dashboardID: p.dashboardData[p.currentDashboard].id,
            targetDashBoard: p.currentDashboard,
            widgetList: Object.keys(p.dashboardData[p.currentDashboard].widgetlist),
            finnHubQueue: s.finnHubQueue,
            rSetUpdateStatus: p.rSetUpdateStatus,
        }
        await p.tGetFinnhubData(payload2)
    }

    render() {
        const s: AppState = this.state
        const quaryData = queryString.parse(window.location.search);
        const loginScreen =
            this.state.login === 0 && this.state.backGroundMenu === "" ? (
                <Login
                    queryData={quaryData}
                    finnHubQueue={this.state.finnHubQueue}
                    updateAppState={this.updateAppState}
                />
            ) : (
                <></>
            );

        const backGroundSelection: { [key: string]: React.ReactElement } = { //topnav menus.
            // endPoint: React.createElement(EndPointMenu, endPointProps(this)),
            manageAccount: React.createElement(AccountMenu, accountMenuProps(this)),
            widgetMenu: React.createElement(WidgetMenu, widgetMenuProps(this)),
            about: React.createElement(AboutMenu, { apiFlag: this.state.apiFlag }),
            exchangeMenu: React.createElement(ExchangeMenu, exchangeMenuProps(this)),
            templates: React.createElement(TemplateMenu, templateMenuProps(this)),
        };

        const backGroundMenu = () => {
            return <div className="backgroundMenu">{backGroundSelection[s.backGroundMenu]}</div>;
        };

        const widgetList = this.props.dashboardData?.[this.props.currentDashboard]?.['widgetlist'] ?
            this.props.dashboardData?.[this.props.currentDashboard]['widgetlist'] : {}

        const dashboardID = this.props.dashboardData?.[this.props.currentDashboard]?.id ? this.props.dashboardData[this.props.currentDashboard].id : ''
        // const bottomNav = this.state.login === 1 ? <BottomNav showMenuColumn={this.state.showMenuColumn} /> : <></>

        return (
            <ThemeProvider theme={outerTheme}>
                <BrowserRouter>
                    <Switch>
                        <Route path="/">
                            <TopNav
                                backGroundMenu={this.state.backGroundMenu}
                                login={this.state.login}
                                showStockWidgets={this.state.showStockWidgets}
                                widgetSetup={this.state.widgetSetup}
                                updateAppState={this.updateAppState}
                                baseState={this.baseState}
                                dashboardData={this.props.dashboardData}
                                currentDashboard={this.props.currentDashboard}
                                saveDashboard={this.saveDashboard}
                                apiKey={this.props.apiKey}
                                finnHubQueue={this.state.finnHubQueue}
                            />
                            <WidgetController
                                apiKey={this.props.apiKey}
                                apiAlias={this.props.apiAlias}
                                currentDashBoard={this.props.currentDashboard}
                                dashBoardData={this.props.dashboardData}
                                dashboardID={dashboardID}
                                defaultExchange={this.props.defaultExchange}
                                enableDrag={this.state.enableDrag}
                                exchangeList={this.props.exchangeList}
                                finnHubQueue={this.state.finnHubQueue}
                                login={this.state.login}
                                menuList={this.props.menuList}
                                newDashboard={this.newDashboard}
                                saveDashboard={this.saveDashboard}
                                showMenuColumn={this.state.showMenuColumn}
                                showStockWidgets={this.state.showStockWidgets}
                                targetSecurity={this.props.targetSecurity}
                                widgetCopy={this.state.widgetCopy}
                                widgetList={widgetList}
                                zIndex={this.state.zIndex}
                                rSetTargetDashboard={this.props.rSetTargetDashboard}
                                updateAppState={this.updateAppState}
                                rebuildVisableDashboard={this.rebuildVisableDashboard}
                            />
                            {loginScreen}
                            {backGroundMenu()}
                            {/* {bottomNav} */}
                        </Route>
                    </Switch>
                </BrowserRouter>
            </ThemeProvider>
        );
    }
}

const mapStateToProps = (state: storeState) => ({
    exchangeList: state.exchangeList.exchangeList,
    dataModel: state.dataModel,
    apiKey: state.apiKey,
    apiAlias: state.apiAlias,
    defaultExchange: state.defaultExchange,
    targetSecurity: state.targetSecurity,
    currentDashboard: state.currentDashboard,
    menuList: state.menuList,
    dashboardData: state.dashboardData
});

export default connect(mapStateToProps, {
    tGetSymbolList,
    tGetFinnhubData,
    tGetMongoDB,
    rBuildDataModel,
    rResetUpdateFlag,
    rSetTargetDashboard,
    rSetUpdateStatus,
    rDataModelLogout,
    rExchangeDataLogout,
    rExchangeListLogout,
    rTargetDashboardLogout,
    rRebuildTargetDashboardModel,
    rRebuildTargetWidgetModel,
    rUpdateQuotePriceStream,
    rUpdateQuotePriceSetup,
    tGetSavedDashboards,
    rSetTargetSecurity,
    rUpdateCurrentDashboard,
    rSetMenuList,
    rSetDashboardData
})(App);




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

export interface AppProps {
    apiKey: string,
    apiAlias: string,
    currentDashboard: string,
    dashboardData: sliceDashboardData,
    exchangeList: string[],
    targetSecurity: string,
    dataModel: sliceDataModel,
    defaultExchange: string,
    menuList: sliceMenuList,
    tGetSymbolList: Function,
    tGetFinnhubData: Function,
    tGetMongoDB: Function,
    rBuildDataModel: Function,
    rRebuildTargetDashboardModel: Function,
    rResetUpdateFlag: Function,
    rSetTargetDashboard: Function,
    rSetUpdateStatus: Function,
    rDataModelLogout: Function,
    rExchangeDataLogout: Function,
    rExchangeListLogout: Function,
    rTargetDashboardLogout: Function,
    rRebuildTargetWidgetModel: Function,
    rUpdateQuotePriceStream: Function,
    rUpdateQuotePriceSetup: Function,
    tGetSavedDashboards: Function,
    rSetTargetSecurity: Function,
    rUpdateCurrentDashboard: Function,
    rSetMenuList: Function,
    rSetDashboardData: Function,
}

export interface AppState {
    accountMenu: number,
    aboutMenu: number,
    apiFlag: number, //set to 1 when retrieval of apiKey is needed, 2 if problem with API key.
    backGroundMenu: string, //reference to none widet info displayed when s.showWidget === 0
    // dashBoardData: dashBoardData, //All saved dashboards
    enableDrag: boolean,
    finnHubQueue: finnHubQueue,
    login: number, //login state. 0 logged out, 1 logged in.
    showMenuColumn: boolean, //true shows column 0
    saveDashboardThrottle: number, //delay timer for saving dashboard.
    saveDashboardFlag: boolean, //sets to true when a save starts.
    socket: any, //socket connection for streaming stock data.+
    socketUpdate: number,
    showStockWidgets: number, //0 hide dashboard, 1 show dashboard.
    widgetCopy: widget | null, //copy of state of widget being dragged.
    widgetSetup: widgetSetup, //activates premium api routes.
    zIndex: string[], //list widgets. Index location sets zIndex
}