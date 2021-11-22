import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import queryString from "query-string";
import { createTheme, ThemeProvider } from '@material-ui/core/styles'

//app functions
import { createFunctionQueueObject, finnHubQueue } from "./appFunctions/appImport/throttleQueueAPI";
import { UpdateTickerSockets, LoadTickerSocket } from "./appFunctions/socketData";
import { UpdateWidgetFilters, UpdateWidgetStockList, updateWidgetConfig } from "./appFunctions/appImport/widgetLogic";
import { saveDashboard } from "./appFunctions/appImport/setupDashboard";
import { SetDrag, MoveWidget, SnapOrder, SnapWidget } from "./appFunctions/appImport/widgetGrid";


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
            availableStocks: [],
            aboutMenu: 0,
            apiFlag: 0, //set to 1 when retrieval of apiKey is needed, 2 if problem with API key.
            apiKey: "", //API key retrieved from login database.
            apiAlias: "",
            backGroundMenu: "", //reference to none widet info displayed when s.showWidget === 0
            currentDashBoard: "", //dashboard being displayed
            dashBoardData: {}, //All saved dashboards
            defaultExchange: "US",
            exchangeList: ["US"], //list of all exchanges activated under account management.
            finnHubQueue: createFunctionQueueObject(1, 1000, true),
            login: 0, //login state. 0 logged out, 1 logged in.
            loadStartingDashBoard: 0, //flag switches to 1 after attemping to load default dashboard.
            showMenuColumn: true, //true shows column 0
            menuList: {}, //lists of all menu widgets.
            enableDrag: false,
            saveDashboardThrottle: Date.now(),
            saveDashboardFlag: false,
            socket: "", //socket connection for streaming stock data.
            socketUpdate: Date.now(),
            showStockWidgets: 1, //0 hide dashboard, 1 show dashboard.
            targetSecurity: '', //target security for widgets. Update changes widget focus.
            widgetCopy: null, //copy of state of widget being dragged.
            widgetLockDown: 0, //1 removes buttons from all widgets.
            widgetSetup: {},//activates premium api routes.
            zIndex: [], //list widgets. Index location sets zIndex
        };

        this.baseState = this.state; //used to reset state upon logout.
        //login state logic.

        //app logic for creating/removing, modifying, populating widgets.
        this.updateWidgetFilters = UpdateWidgetFilters.bind(this);
        this.updateWidgetStockList = UpdateWidgetStockList.bind(this);
        this.updateWidgetConfig = updateWidgetConfig.bind(this);

        //App logic for setting up dashboards.
        this.saveDashboard = saveDashboard.bind(this); //this will probable be last function to be unbound, not from this file.
        this.updateAppState = this.updateAppState.bind(this)

        //app logic for MOVING widgets and snapping them into location.
        this.setDrag = SetDrag.bind(this);
        this.moveWidget = MoveWidget.bind(this);
        this.snapWidget = SnapWidget.bind(this);
        this.snapOrder = SnapOrder.bind(this);

        //update and apply state, in module.
        this.rebuildDashboardState = this.rebuildDashboardState.bind(this) //sets s.dashboardData. Used to build dataModel in redux
        this.rebuildVisableDashboard = this.rebuildVisableDashboard.bind(this) //rebuilds dashboard in redux state.dataModel
    }

    componentDidUpdate(prevProps: AppProps, prevState: AppState) {

        if (this.state.login === 1 && prevState.login === 0) { //on login build dashboard state, then use state to build redux dataModel.
            console.log('rebuilding state')
            this.rebuildDashboardState()
        }

        if ( //if apikey not setup show about menu
            (this.state.apiKey === '' && this.state.apiFlag === 0 && this.state.login === 1) ||
            (this.state.apiKey === null && this.state.apiFlag === 0 && this.state.login === 1)
        ) {
            this.setState({
                apiFlag: 1,
                aboutMenu: 0,
                showStockWidgets: 0,
                backGroundMenu: 'about',
            })
        }

        const globalStockList = this.state.dashBoardData?.[this.state.currentDashBoard]?.globalstocklist ? this.state.dashBoardData?.[this.state.currentDashBoard].globalstocklist : false
        if ((globalStockList && globalStockList !== prevState.dashBoardData?.[prevState.currentDashBoard]?.globalstocklist && this.state.login === 1)) { //price data for watchlist, including socket data.
            LoadTickerSocket(this, prevState, globalStockList, this.state.socket, this.state.apiKey, UpdateTickerSockets);
        }

        const globalKeys = globalStockList ? Object.keys(globalStockList) : []
        if (this.state.targetSecurity === '' && globalKeys.length > 0) {
            this.setState({
                targetSecurity: globalKeys[0]
            })
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

    async rebuildDashboardState() { //fetches dashboard data, then updates s.dashBoardData, then builds redux model.
        try {
            const data = await this.props.tGetSavedDashboards({ apiKey: this.state.apiKey }).unwrap()
            console.log('rebuildData', data.currentDashBoard)
            const payload = {
                dashBoardData: data.dashBoardData,
                currentDashBoard: data.currentDashBoard,
                menuList: data.menuList!,
            }
            this.setState(payload, async () => {
                this.props.rResetUpdateFlag() //sets all dashboards status to updating in redux store.

                const s: AppState = this.state;
                const p: AppProps = this.props;
                await p.tGetMongoDB()
                const targetDash: string[] = s.dashBoardData?.[s.currentDashBoard]?.widgetlist ? Object.keys(s.dashBoardData?.[s.currentDashBoard]?.widgetlist) : []
                for (const widget in targetDash) {
                    const payload: tgetFinnHubDataReq = { //get data for default dashboard.
                        dashboardID: s.dashBoardData[s.currentDashBoard].id,
                        targetDashBoard: s.currentDashBoard,
                        widgetList: [targetDash[widget]],
                        finnHubQueue: s.finnHubQueue,
                        rSetUpdateStatus: p.rSetUpdateStatus,
                    }
                    p.tGetFinnhubData(payload)
                }
                const dashBoards: string[] = Object.keys(s.dashBoardData) //get data for dashboards not being shown
                for (const dash of dashBoards) {
                    if (dash !== s.currentDashBoard) {
                        const payload: tgetFinnHubDataReq = { //run in background, do not await.
                            dashboardID: s.dashBoardData[dash].id,
                            targetDashBoard: dash,
                            widgetList: Object.keys(s.dashBoardData[dash].widgetlist),
                            finnHubQueue: s.finnHubQueue,
                            rSetUpdateStatus: p.rSetUpdateStatus,
                        }
                        await p.tGetFinnhubData(payload)
                    }
                }
            })


        } catch (error: any) {
            console.error("Failed to recover dashboards");
        }
    }

    async rebuildVisableDashboard() {
        const payload = {
            apiKey: this.state.apiKey,
            dashBoardData: this.state.dashBoardData[this.state.currentDashBoard],
            targetDashboard: this.state.currentDashBoard,
        }
        this.props.rRebuildTargetDashboardModel(payload) //rebuilds redux.Model
        const s: AppState = this.state;
        const p: AppProps = this.props;
        await p.tGetMongoDB({ dashboard: s.dashBoardData[s.currentDashBoard].id })
        const payload2: tgetFinnHubDataReq = {
            dashboardID: s.dashBoardData[s.currentDashBoard].id,
            targetDashBoard: s.currentDashBoard,
            widgetList: Object.keys(s.dashBoardData[s.currentDashBoard].widgetlist),
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

        const widgetList = this.state.dashBoardData?.[this.state.currentDashBoard]?.['widgetlist'] ?
            this.state.dashBoardData?.[this.state.currentDashBoard]['widgetlist'] : {}

        const dashboardID = this.state.dashBoardData?.[this.state.currentDashBoard]?.id ? this.state.dashBoardData[this.state.currentDashBoard].id : ''
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
                                dashboardData={this.state.dashBoardData}
                                currentDashboard={this.state.currentDashBoard}
                                saveDashboard={this.saveDashboard}
                                apiKey={this.state.apiKey}
                                finnHubQueue={this.state.finnHubQueue}
                            />
                            <WidgetController
                                apiKey={this.state.apiKey}
                                apiAlias={this.state.apiAlias}
                                availableStocks={this.state.availableStocks}
                                currentDashBoard={this.state.currentDashBoard}
                                dashBoardData={this.state.dashBoardData}
                                dashboardID={dashboardID}
                                defaultExchange={this.state.defaultExchange}
                                exchangeList={this.state.exchangeList}
                                finnHubQueue={this.state.finnHubQueue}
                                login={this.state.login}
                                menuList={this.state.menuList}
                                moveWidget={this.moveWidget}
                                newDashboard={this.newDashboard}
                                saveDashboard={this.saveDashboard}
                                setDrag={this.setDrag}
                                showMenuColumn={this.state.showMenuColumn}
                                showStockWidgets={this.state.showStockWidgets}
                                snapWidget={this.snapWidget}
                                targetSecurity={this.state.targetSecurity}
                                updateWidgetConfig={this.updateWidgetConfig}
                                updateWidgetFilters={this.updateWidgetFilters}
                                updateWidgetStockList={this.updateWidgetStockList}
                                widgetCopy={this.state.widgetCopy}
                                widgetList={widgetList}
                                widgetLockDown={this.state.widgetLockDown}
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
    rExchangeList: state.exchangeList.exchangeList,
    dataModel: state.dataModel,
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
})(App);




export interface stock {
    currency: string,
    dStock: Function,
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
    xAxis: number,
    yAxis: number,
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
    column: number,
    columnOrder: number,
    widgetConfig: string,
    widgetHeader: string,
    widgetID: string,
    widgetType: string,
    xAxis: string,
    yAxis: string,
    showBody: boolean,
}

export interface menuList {
    [key: string]: menu
}

export interface priceObj {
    currentPrice: number
}

// export interface streamingPriceData {
//     [key: string]: priceObj
// }

export interface widgetSetup {
    [key: string]: boolean
}

interface App { [key: string]: any }

export interface AppProps {
    rExchangeList: string[],
    dataModel: sliceDataModel,
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
}

export interface AppState {
    accountMenu: number,
    availableStocks: any,
    aboutMenu: number,
    apiFlag: number, //set to 1 when retrieval of apiKey is needed, 2 if problem with API key.
    apiKey: string, //API key retrieved from login database.
    apiAlias: string,
    backGroundMenu: string, //reference to none widet info displayed when s.showWidget === 0
    currentDashBoard: string, //dashboard being displayed
    dashBoardData: dashBoardData, //All saved dashboards
    defaultExchange: string,
    enableDrag: boolean,
    exchangeList: string[], //list of all exchanges activated under account management.
    finnHubQueue: finnHubQueue,
    login: number, //login state. 0 logged out, 1 logged in.
    loadStartingDashBoard: number, //flag switches to 1 after attemping to load default dashboard.
    showMenuColumn: boolean, //true shows column 0
    menuList: menuList, //lists of all menu widgets.
    saveDashboardThrottle: number, //delay timer for saving dashboard.
    saveDashboardFlag: boolean, //sets to true when a save starts.
    socket: any, //socket connection for streaming stock data.+
    socketUpdate: number,
    showStockWidgets: number, //0 hide dashboard, 1 show dashboard.
    targetSecurity: string, //target security for widgets. Update changes widget focus.
    widgetCopy: widget | null, //copy of state of widget being dragged.
    widgetLockDown: number, //1 removes buttons from all widgets.
    widgetSetup: widgetSetup, //activates premium api routes.
    zIndex: string[], //list widgets. Index location sets zIndex
}