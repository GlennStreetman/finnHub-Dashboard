import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import queryString from "query-string";
import produce from 'immer'
import { createTheme, ThemeProvider } from '@material-ui/core/styles'

//app functions
import { createFunctionQueueObject, finnHubQueue } from "./appFunctions/appImport/throttleQueueAPI";
import { UpdateTickerSockets, LoadTickerSocket } from "./appFunctions/socketData";
import { logoutServer, Logout, ProcessLogin } from "./appFunctions/appImport/appLogin";
import {
    NewMenuContainer, AddNewWidgetContainer, LockWidgets,
    ToggleWidgetVisability, ChangeWidgetName, RemoveWidget,
    UpdateWidgetFilters, UpdateWidgetStockList, updateWidgetConfig,
    toggleWidgetBody, setWidgetFocus, removeDashboardFromState
} from "./appFunctions/appImport/widgetLogic";
import { NewDashboard, saveDashboard, copyDashboard }
    from "./appFunctions/appImport/setupDashboard";
import { GetSavedDashBoards, GetSavedDashBoardsRes } from "./appFunctions/appImport/getSavedDashboards";
import { SetDrag, MoveWidget, SnapOrder, SnapWidget } from "./appFunctions/appImport/widgetGrid";
import { updateGlobalStockList, setNewGlobalStockList } from "./appFunctions/appImport/updateGlobalStockList"
import { syncGlobalStockList } from "./appFunctions/appImport/syncGlobalStockList"
import { toggleBackGroundMenu } from "./appFunctions/appImport/toggleBackGroundMenu"
import { updateAPIFlag } from "./appFunctions/appImport/updateAPIFlag"
import { updateExchangeList } from "./appFunctions/appImport/updateExchangeList"
import { updateDefaultExchange } from "./appFunctions/appImport/updateDefaultExchange"
import { loadSavedDashboard } from "./appFunctions/appImport/loadSavedDashboard"
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
import { connect } from "react-redux";
import { storeState } from './store'
import { tGetSymbolList, rExchangeDataLogout } from "./slices/sliceExchangeData";
import { rSetTargetDashboard, rTargetDashboardLogout } from "./slices/sliceShowData";
import { rUpdateExchangeList, rExchangeListLogout } from "./slices/sliceExchangeList";
import { rUpdateQuotePriceStream, rUpdateQuotePriceSetup } from "./slices/sliceQuotePrice";
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
import { rSetApiAlias } from './slices/sliceApiAlias'
import { rSetDefaultExchange } from './slices/sliceDefaultExchange'

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
    backGroundMenu: string, //reference to none widet info displayed when s.showWidget === 0
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
            loadStartingDashBoard: 0, //flag switches to 1 after attemping to load default dashboard.
            showMenuColumn: true, //true shows column 0
            enableDrag: false,
            saveDashboardThrottle: Date.now(),
            saveDashboardFlag: false,
            socket: "", //socket connection for streaming stock data.
            socketUpdate: Date.now(),
            showStockWidgets: 1, //0 hide dashboard, 1 show dashboard.
            widgetCopy: null, //copy of state of widget being dragged.
            widgetLockDown: 0, //1 removes buttons from all widgets.
            widgetSetup: {},//items added to list add premium api route widgets (i.e. NOT FREE from finnhub.io).
            zIndex: [], //list widgets. Index location sets zIndex
        };

        this.baseState = this.state; //used to reset state upon logout.
        //login state logic.
        this.logOut = Logout.bind(this);
        this.logoutServer = logoutServer.bind(this)
        this.processLogin = ProcessLogin.bind(this);

        //app logic for creating/removing, modifying, populating widgets.
        this.newMenuContainer = NewMenuContainer.bind(this);
        this.AddNewWidgetContainer = AddNewWidgetContainer.bind(this);
        this.changeWidgetName = ChangeWidgetName.bind(this);
        this.lockWidgets = LockWidgets.bind(this);
        this.updateWidgetFilters = UpdateWidgetFilters.bind(this);
        this.updateWidgetStockList = UpdateWidgetStockList.bind(this);
        this.toggleWidgetVisability = ToggleWidgetVisability.bind(this);
        this.updateWidgetConfig = updateWidgetConfig.bind(this);
        this.toggleWidgetBody = toggleWidgetBody.bind(this)
        this.setWidgetFocus = setWidgetFocus.bind(this)

        //App logic for setting up dashboards.
        this.newDashboard = NewDashboard.bind(this);
        this.getSavedDashBoards = GetSavedDashBoards.bind(this);
        this.saveDashboard = saveDashboard.bind(this);
        this.copyDashboard = copyDashboard.bind(this)

        //app logic for MOVING widgets and snapping them into location.
        this.setDrag = SetDrag.bind(this);
        this.moveWidget = MoveWidget.bind(this);
        this.snapWidget = SnapWidget.bind(this);
        this.snapOrder = SnapOrder.bind(this);

        //update and apply state, in module.
        this.updateAPIKey = this.updateAPIKey.bind(this);
        this.updateAPIFlag = updateAPIFlag.bind(this);
        this.updateExchangeList = updateExchangeList.bind(this);
        this.updateDefaultExchange = updateDefaultExchange.bind(this);
        this.setNewGlobalStockList = setNewGlobalStockList.bind(this)
        this.updateGlobalStockList = updateGlobalStockList.bind(this); //pass stockRef to delete, pass in stockObj to update.
        this.uploadGlobalStockList = this.uploadGlobalStockList.bind(this); //pass in object to replace global list
        this.syncGlobalStockList = syncGlobalStockList.bind(this); //pushes global stock list to all widgets.
        this.toggleBackGroundMenu = toggleBackGroundMenu.bind(this); //hides widgets and shows menu from topbar.
        this.loadSavedDashboard = loadSavedDashboard.bind(this) // loads a dashboard
        this.setSecurityFocus = this.setSecurityFocus.bind(this) //Sets target security for all widgets that have security dropdown selector 
        this.updateWidgetSetup = updateWidgetSetup.bind(this) //saves current dashboard to postgres.
        this.rebuildDashboardState = this.rebuildDashboardState.bind(this) //sets this.props.dashboardData. Used to build dataModel in redux
        this.refreshFinnhubAPIDataAll = this.refreshFinnhubAPIDataAll.bind(this) //For All Dashboards: gets data from mongo if available, else queues updates with finnhub.io
        this.refreshFinnhubAPIDataCurrentDashboard = this.refreshFinnhubAPIDataCurrentDashboard.bind(this)
        this.removeDashboardFromState = removeDashboardFromState.bind(this)
        this.removeWidget = RemoveWidget.bind(this)
        this.rebuildVisableDashboard = this.rebuildVisableDashboard.bind(this) //rebuilds dashboard in redux state.dataModel
    }

    componentDidUpdate(prevProps: AppProps, prevState: AppState) {
        const s: AppState = this.state;
        const p: AppProps = this.props;
        if (s.login === 1 && prevState.login === 0) { //on login build dashboard state, then use state to build redux dataModel.
            console.log('logged in')
            this.rebuildDashboardState()
        }

        if (p.dashboardData?.[p.currentDashboard] && !p.dashboardData?.[p.currentDashboard]?.id) {
            this.newDashboard(p.currentDashboard, p.dashboardData, rSetDashboardData)
        }

        if ((prevProps.dataModel.created === 'false' && p.dataModel.created === 'true' && s.login === 1) ||
            (p.dataModel.created === 'updated' && s.login === 1)) {//on login or data model update update dataset with finnHub data.
            p.rResetUpdateFlag() //sets all dashboards status to updating in redux store.
            this.refreshFinnhubAPIDataAll() //fetches finnhub api data, from mongo if avilable, else queues Finnhub.io api alls. When complete sets dashboard status ready.
        }

        if ( //if apikey not setup show about menu
            (this.props.apiKey === '' && s.apiFlag === 0 && s.login === 1) ||
            (this.props.apiKey === null && s.apiFlag === 0 && s.login === 1)
        ) {
            this.setState({
                apiFlag: 1,
                aboutMenu: 0,
                showStockWidgets: 0,
            }, () => { this.toggleBackGroundMenu('about') })
        }

        const globalStockList = this.props.dashboardData?.[p.currentDashboard]?.globalstocklist ? this.props.dashboardData?.[p.currentDashboard].globalstocklist : false
        if ((globalStockList && globalStockList !== prevProps.dashboardData?.[prevProps.currentDashboard]?.globalstocklist && s.login === 1)) { //price data for watchlist, including socket data.
            LoadTickerSocket(this, prevState, prevProps, globalStockList, s.socket, this.props.apiKey, UpdateTickerSockets);
        }

        const globalKeys = globalStockList ? Object.keys(globalStockList) : []
        if (this.props.targetSecurity === '' && globalKeys.length > 0) {
            this.props.rSetTargetSecurity(globalKeys[0])
        }
    }

    async refreshFinnhubAPIDataCurrentDashboard() { //queues all finnhub data to be refreshed for current dashboard.
        console.log('refresh finnhub data for current dashboard', this.propp.currentDashboard)
        const s: AppState = this.state;
        const p: AppProps = this.props;
        await p.tGetMongoDB({ dashboard: this.props.dashboardData[p.currentDashboard].id })
        const payload: tgetFinnHubDataReq = {
            dashboardID: this.props.dashboardData[p.currentDashboard].id,
            widgetList: Object.keys(this.props.dashboardData[p.currentDashboard].widgetlist),
            finnHubQueue: s.finnHubQueue,
            rSetUpdateStatus: p.rSetUpdateStatus,
        }
        await p.tGetFinnhubData(payload)
    }

    async refreshFinnhubAPIDataAll() { //queues all finnhub data to be refreshes for all dashboards.
        const s: AppState = this.state;
        const p: AppProps = this.props;
        await p.tGetMongoDB()
        const targetDash: string[] = this.props.dashboardData?.[p.currentDashboard]?.widgetlist ? Object.keys(this.props.dashboardData?.[p.currentDashboard]?.widgetlist) : []
        for (const widget in targetDash) {
            const payload: tgetFinnHubDataReq = { //get data for default dashboard.
                dashboardID: this.props.dashboardData[p.currentDashboard].id,
                widgetList: [targetDash[widget]],
                finnHubQueue: s.finnHubQueue,
                rSetUpdateStatus: p.rSetUpdateStatus,
            }
            p.tGetFinnhubData(payload)
        }
        const dashBoards: string[] = Object.keys(this.props.dashboardData) //get data for dashboards not being shown
        for (const dash of dashBoards) {
            if (dash !== p.currentDashboard) {
                const payload: tgetFinnHubDataReq = { //run in background, do not await.
                    dashboardID: this.props.dashboardData[dash].id,
                    widgetList: Object.keys(this.props.dashboardData[dash].widgetlist),
                    finnHubQueue: s.finnHubQueue,
                    rSetUpdateStatus: p.rSetUpdateStatus,
                }
                await p.tGetFinnhubData(payload)
            }
        }
    }

    async rebuildDashboardState() { //fetches dashboard data, then updates this.props.dashboardData, then builds redux model.
        // console.log('running rebuild')
        try {
            const data: GetSavedDashBoardsRes = await this.getSavedDashBoards()
            if ((data.dashboardData[data.currentDashBoard] === undefined && Object.keys(data.dashboardData))) { //if invalid current dashboard returned
                console.log('invalid dashboard')
                data.currentDashBoard = Object.keys(data.dashboardData)[0]
            }
            this.props.rSetDashboardData(data.dashboardData)
            this.props.rUpdateCurrentDashboard(data.currentDashBoard)
            this.props.rSetMenuList(data.menuList)
            this.props.rSetTargetDashboard({ targetDashboard: data.currentDashBoard }) //update target dashboard in redux dataModel
            this.props.rBuildDataModel({ ...data, apiKey: this.props.apiKey })
            if (data.message === 'No saved dashboards') { return (true) } else { return (false) }

        } catch (error: any) {
            console.error("Failed to recover dashboards", error);
            return false
        }
    }

    rebuildVisableDashboard() {
        const payload = {
            apiKey: this.props.apiKey,
            dashboardData: this.props.dashboardData,
            targetDashboard: this.props.currentDashboard,
        }
        this.props.rRebuildTargetDashboardModel(payload) //rebuilds redux.Model
        this.refreshFinnhubAPIDataCurrentDashboard() //queue refresh for all finhub data for this dashboard.
    }

    uploadGlobalStockList(newStockObj: stockList) {
        const newDashboardObj = produce(this.props.dashboardData, (draftState: sliceDashboardData) => {
            draftState[this.props.currentDashboard].globalstocklist = newStockObj
            return draftState
        })

        this.props.rSetDashboardData(newDashboardObj)
    }

    updateAPIKey(newKey: string) {
        this.props.rSetApiKey(newKey)
    }

    setSecurityFocus(target: string) {
        this.props.rSetTargetSecurity(target)
        return true
        // this.setState({ targetSecurity: target }, () => { return true })
    }

    render() {
        const s: AppState = this.state
        const p: AppProps = this.props
        const quaryData = queryString.parse(window.location.search);
        const loginScreen =
            this.state.login === 0 && this.state.backGroundMenu === "" ? (
                <Login
                    processLogin={this.processLogin}
                    queryData={quaryData}
                    updateExchangeList={this.updateExchangeList}
                    updateDefaultExchange={this.updateDefaultExchange}
                    finnHubQueue={this.state.finnHubQueue}
                />
            ) : (
                <></>
            );

        const backGroundSelection: { [key: string]: React.ReactElement } = { //topnav menus.
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

        const globalStockList = this.props.dashboardData?.[p.currentDashboard]?.globalstocklist ? this.props.dashboardData?.[p.currentDashboard].globalstocklist : {}
        const dashboardID = this.props.dashboardData?.[this.props.currentDashboard]?.id ? this.props.dashboardData[this.props.currentDashboard].id : ''

        return (
            <ThemeProvider theme={outerTheme}>
                <BrowserRouter>
                    <Switch>
                        <Route path="/">
                            <TopNav
                                AccountMenu={this.state.accountMenu}
                                AddNewWidgetContainer={this.AddNewWidgetContainer}
                                apiFlag={this.state.apiFlag}
                                backGroundMenu={this.state.backGroundMenu}
                                finnHubQueue={this.state.finnHubQueue}
                                lockWidgets={this.lockWidgets}
                                login={this.state.login}
                                logOut={this.logOut}
                                logoutServer={this.logoutServer}
                                menuList={this.props.menuList}
                                newMenuContainer={this.newMenuContainer}
                                saveDashboard={this.saveDashboard}
                                showMenuColumn={this.state.showMenuColumn}
                                showStockWidgets={this.state.showStockWidgets}
                                toggleBackGroundMenu={this.toggleBackGroundMenu}
                                toggleWidgetVisability={this.toggleWidgetVisability}
                                updateAPIFlag={this.updateAPIFlag}
                                widgetLockDown={this.state.widgetLockDown}
                                widgetSetup={this.state.widgetSetup}
                            />
                            <WidgetController
                                apiKey={this.props.apiKey}
                                // apiAlias={this.state.apiAlias}
                                changeWidgetName={this.changeWidgetName}
                                copyDashboard={this.copyDashboard}
                                currentDashboard={this.props.currentDashboard}
                                dashboardData={this.props.dashboardData}
                                dashboardID={dashboardID}
                                defaultExchange={this.props.defaultExchange}
                                exchangeList={this.props.exchangeList}
                                finnHubQueue={this.state.finnHubQueue}
                                globalStockList={globalStockList}
                                loadSavedDashboard={this.loadSavedDashboard}
                                login={this.state.login}
                                menuList={this.props.menuList}
                                moveWidget={this.moveWidget}
                                newDashboard={this.newDashboard}
                                processLogin={this.processLogin}
                                removeWidget={this.removeWidget}
                                removeDashboardFromState={this.removeDashboardFromState}
                                rebuildDashboardState={this.rebuildDashboardState}
                                refreshFinnhubAPIDataCurrentDashboard={this.refreshFinnhubAPIDataCurrentDashboard}
                                saveDashboard={this.saveDashboard}
                                setDrag={this.setDrag}
                                setNewGlobalStockList={this.setNewGlobalStockList}
                                setSecurityFocus={this.setSecurityFocus}
                                setWidgetFocus={this.setWidgetFocus}
                                showMenuColumn={this.state.showMenuColumn}
                                showStockWidgets={this.state.showStockWidgets}
                                snapWidget={this.snapWidget}
                                syncGlobalStockList={this.syncGlobalStockList}
                                targetSecurity={this.props.targetSecurity}
                                toggleWidgetBody={this.toggleWidgetBody}
                                updateAPIFlag={this.updateAPIFlag}
                                updateAPIKey={this.updateAPIKey}
                                updateDefaultExchange={this.updateDefaultExchange}
                                updateGlobalStockList={this.updateGlobalStockList}
                                updateWidgetConfig={this.updateWidgetConfig}
                                updateWidgetFilters={this.updateWidgetFilters}
                                updateWidgetStockList={this.updateWidgetStockList}
                                uploadGlobalStockList={this.uploadGlobalStockList}
                                widgetCopy={this.state.widgetCopy}
                                widgetList={widgetList}
                                widgetLockDown={this.state.widgetLockDown}
                                zIndex={this.state.zIndex}
                                rAddNewDashboard={this.props.rAddNewDashboard}
                                rSetTargetDashboard={this.props.rSetTargetDashboard}
                                rUpdateCurrentDashboard={this.props.rUpdateCurrentDashboard}
                            />
                            {loginScreen}
                            {backGroundMenu()}

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
    currentDashboard: state.currentDashboard,
    targetSecurity: state.targetSecurity,
    menuList: state.menuList,
    dashboardData: state.dashboardData,
    apiKey: state.apiKey,
    apiAlias: state.apiAlias,
    defaultExchange: state.defaultExchange
});

export default connect(mapStateToProps, {
    tGetSymbolList,
    tGetFinnhubData,
    tGetMongoDB,
    rBuildDataModel,
    rResetUpdateFlag,
    rSetTargetDashboard,
    rSetUpdateStatus,
    rUpdateExchangeList,
    rDataModelLogout,
    rExchangeDataLogout,
    rExchangeListLogout,
    rTargetDashboardLogout,
    rRebuildTargetDashboardModel,
    rRebuildTargetWidgetModel,
    rUpdateQuotePriceStream,
    rUpdateQuotePriceSetup,
    rAddNewDashboard,
    rUpdateCurrentDashboard,
    rSetTargetSecurity,
    rSetMenuList,
    rSetDashboardData,
    rSetApiKey,
    rSetApiAlias,
    rSetDefaultExchange,
})(App);

