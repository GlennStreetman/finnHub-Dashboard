import React from "react";
// import "./App.css";
import queryString from "query-string";
//app functions
import { createFunctionQueueObject, finnHubQueue } from "./appFunctions/appImport/throttleQueueAPI";
import { GetStockPrice, LoadStockData } from "./appFunctions/getStockPrices";
import { UpdateTickerSockets, LoadTickerSocket } from "./appFunctions/socketData";
import { logoutServer, Logout, ProcessLogin } from "./appFunctions/appImport/appLogin";
import {
    NewMenuContainer, AddNewWidgetContainer, LockWidgets,
    ToggleWidgetVisability, ChangeWidgetName, RemoveWidget,
    UpdateWidgetFilters, UpdateWidgetStockList, updateWidgetConfig
} from "./appFunctions/appImport/widgetLogic";
import { LoadDashBoard, NewDashboard, GetSavedDashBoards, GetSavedDashBoardsRes, SaveCurrentDashboard }
    from "./appFunctions/appImport/setupDashboard";
import { SetDrag, MoveWidget, SnapOrder, SnapWidget } from "./appFunctions/appImport/widgetGrid";
import { updateGlobalStockList } from "./appFunctions/appImport/updateGlobalStockList"
import { syncGlobalStockList } from "./appFunctions/appImport/syncGlobalStockList"
import { toggleBackGroundMenu } from "./appFunctions/appImport/toggleBackGroundMenu"
import { updateAPIFlag } from "./appFunctions/appImport/updateAPIFlag"
import { updateExchangeList } from "./appFunctions/appImport/updateExchangeList"
import { updateDefaultExchange } from "./appFunctions/appImport/updateDefaultExchange"
import { updateDashBoards } from "./appFunctions/appImport/updateDashBoards"
import { loadSavedDashboard } from "./appFunctions/appImport/loadSavedDashboard"
import { updateWidgetSetup } from "./appFunctions/appImport/updateWidgetSetup"

//component imports
import TopNav from "./components/topNav";
import Login from "./components/login";
import AboutMenu from "./components/AboutMenu";
import AccountMenu, { accountMenuProps } from "./components/accountMenu";
import WidgetMenu, { widgetMenuProps } from "./components/widgetMenu";
import EndPointMenu, { endPointProps } from "./components/endPointMenu";
import ExchangeMenu, { exchangeMenuProps } from "./components/exchangeMenu";
import TemplateMenu, { templateMenuProps } from "./components/templateMenu";
import { WidgetController, MenuWidgetToggle } from "./components/widgetController";

//redux imports
import { connect } from "react-redux";
import { storeState } from './store'
import { tGetSymbolList, rExchangeDataLogout } from "./slices/sliceExchangeData";
import { rSetTargetDashboard, rTargetDashboardLogout } from "./slices/sliceShowData";
import { rUpdateExchangeList, rExchangeListLogout } from "./slices/sliceExchangeList";
import { rBuildDataModel, rResetUpdateFlag, rSetUpdateStatus, sliceDataModel, rDataModelLogout } from "./slices/sliceDataModel";
import { tGetFinnhubData } from "./thunks/thunkFetchFinnhub";
import { tGetMongoDB } from "./thunks/thunkGetMongoDB";



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
}

export interface menuList {
    [key: string]: menu
}

export interface priceObj {
    currentPrice: number
}

export interface streamingPriceData {
    [key: string]: priceObj
}

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
    rResetUpdateFlag: Function,
    rSetTargetDashboard: Function,
    rSetUpdateStatus: Function,
    rUpdateExchangeList: Function,
    rDataModelLogout: Function,
    rExchangeDataLogout: Function,
    rExchangeListLogout: Function,
    rTargetDashboardLogout: Function,
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
    dashBoardMenu: number, //1 = show, 0 = hide
    dashBoardData: dashBoardData, //All saved dashboards
    defaultExchange: string,
    enableDrag: boolean,
    exchangeList: string[], //list of all exchanges activated under account management.
    finnHubQueue: finnHubQueue,
    globalStockList: defaultGlobalStockList, //default stocks for new widgets.
    login: number, //login state. 0 logged out, 1 logged in.
    loadStartingDashBoard: number, //flag switches to 1 after attemping to load default dashboard.
    menuList: menuList, //lists of all menu widgets.
    rebuildDataSet: number, //Set to 1 to trigger finnHub Dataset rebuild. 
    socket: any, //socket connection for streaming stock data.
    showStockWidgets: number, //0 hide dashboard, 1 show dashboard.
    streamingPriceData: streamingPriceData, //data shared between some widgets and watchlist menu. Updated by socket data.
    targetSecurity: string, //target security for widgets. Update changes widget focus.
    watchListMenu: number, //1 = show, 0 = hide
    widgetCopy: widget | null, //copy of state of widget being dragged.
    widgetLockDown: number, //1 removes buttons from all widgets.
    widgetList: widgetList, //lists of all widgets.
    widgetSetup: widgetSetup,
    zIndex: string[], //list widgets. Index location sets zIndex
}

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);

        const defaultGlobalStockList = {};

        this.state = {
            accountMenu: 0,
            availableStocks: [],
            aboutMenu: 0,
            apiFlag: 0, //set to 1 when retrieval of apiKey is needed, 2 if problem with API key.
            apiKey: "", //API key retrieved from login database.
            apiAlias: "",
            backGroundMenu: "", //reference to none widet info displayed when s.showWidget === 0
            currentDashBoard: "", //dashboard being displayed
            dashBoardMenu: 0, //1 = show, 0 = hide
            dashBoardData: {}, //All saved dashboards
            defaultExchange: "US",
            exchangeList: ["US"], //list of all exchanges activated under account management.
            finnHubQueue: createFunctionQueueObject(30, 1000, true),
            globalStockList: defaultGlobalStockList, //default stocks for new widgets.
            login: 0, //login state. 0 logged out, 1 logged in.
            loadStartingDashBoard: 0, //flag switches to 1 after attemping to load default dashboard.
            menuList: {}, //lists of all menu widgets.
            rebuildDataSet: 0, //Set to 1 to trigger finnHub Dataset rebuild. 
            enableDrag: false,
            socket: "", //socket connection for streaming stock data.
            showStockWidgets: 1, //0 hide dashboard, 1 show dashboard.
            streamingPriceData: {}, //data shared between some widgets and watchlist menu. Updated by socket data.
            targetSecurity: '', //target security for widgets. Update changes widget focus.
            watchListMenu: 1, //1 = show, 0 = hide
            widgetCopy: null, //copy of state of widget being dragged.
            widgetLockDown: 0, //1 removes buttons from all widgets.
            widgetList: {}, //lists of all widgets.
            widgetSetup: {},
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
        this.removeWidget = RemoveWidget.bind(this);
        this.updateWidgetFilters = UpdateWidgetFilters.bind(this);
        this.updateWidgetStockList = UpdateWidgetStockList.bind(this);
        this.toggleWidgetVisability = ToggleWidgetVisability.bind(this);
        this.updateWidgetConfig = updateWidgetConfig.bind(this);

        //App logic for setting up dashboards.
        this.loadDashBoard = LoadDashBoard.bind(this);
        this.newDashboard = NewDashboard.bind(this);
        this.getSavedDashBoards = GetSavedDashBoards.bind(this);
        this.saveCurrentDashboard = SaveCurrentDashboard.bind(this);

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
        this.updateGlobalStockList = updateGlobalStockList.bind(this); //pass stockRef to delete, pass in stockObj to update.
        this.uploadGlobalStockList = this.uploadGlobalStockList.bind(this); //pass in object to replace global list
        this.syncGlobalStockList = syncGlobalStockList.bind(this); //pushes global stock list to all widgets.
        this.toggleBackGroundMenu = toggleBackGroundMenu.bind(this); //hides widgets and shows menu from topbar.
        this.updateDashBoards = updateDashBoards.bind(this) //when dashboard menu saves or deletes a dashboard, runs to upddate state.
        this.loadSavedDashboard = loadSavedDashboard.bind(this) // loads a dashboard
        this.setSecurityFocus = this.setSecurityFocus.bind(this) //Sets target security for all widgets that have security dropdown selector 
        this.updateWidgetSetup = updateWidgetSetup.bind(this)
    }

    componentDidUpdate(prevProps: AppProps, prevState: AppState) {
        const s: AppState = this.state;
        const p: AppProps = this.props;
        if (s.login === 1 && prevState.login === 0) { //on login build data model.
            this.getSavedDashBoards()
                .then((data: GetSavedDashBoardsRes) => {
                    if ((data.dashBoardData[data.currentDashBoard] === undefined && Object.keys(data.dashBoardData))) { //if invalid current dashboard returned
                        data.currentDashBoard = Object.keys(data.dashBoardData)[0]
                    }
                    this.setState({
                        dashBoardData: data.dashBoardData,
                        currentDashBoard: data.currentDashBoard,
                        menuList: data.menuList!,
                    })
                    p.rSetTargetDashboard({ targetDashboard: data.currentDashBoard })
                    p.rBuildDataModel({ ...data, apiKey: s.apiKey })
                })
                .catch((error: any) => {
                    console.error("Failed to recover dashboards");
                });
        }

        if ((prevProps.dataModel.created === 'false' && p.dataModel.created === 'true' && s.login === 1) || (p.dataModel.created === 'updated' && s.login === 1)) {
            //on login or data model update update dataset with finnHub data.
            console.log("RUNNING DATA BUILD")
            p.rResetUpdateFlag()
            let setupData = async function () {
                // console.log('0')
                await p.tGetMongoDB()
                const targetDash: string[] = s.dashBoardData?.[s.currentDashBoard]?.widgetlist ? Object.keys(s.dashBoardData?.[s.currentDashBoard]?.widgetlist) : []
                p.rSetUpdateStatus({
                    [s.currentDashBoard]: 'Updating'
                })
                // console.log('1')
                for (const widget in targetDash) {
                    await p.tGetFinnhubData({ //get data for default dashboard.
                        targetDashBoard: s.currentDashBoard,
                        widgetList: [targetDash[widget]],
                        finnHubQueue: s.finnHubQueue,
                    })
                }
                // console.log('2')
                p.rSetUpdateStatus({
                    [s.currentDashBoard]: 'Ready'
                })
                // console.log('3')
                const dashBoards: string[] = Object.keys(s.dashBoardData) //get data for dashboards not being shown
                for (const dash of dashBoards) {
                    if (dash !== s.currentDashBoard) {
                        p.rSetUpdateStatus({
                            [dash]: 'Updating'
                        })
                        // console.log('4')
                        await p.tGetFinnhubData({ //run in background, do not await.
                            targetDashBoard: dash,
                            widgetList: Object.keys(s.dashBoardData[dash].widgetlist),
                            finnHubQueue: s.finnHubQueue,
                        })
                        // console.log('5')
                        p.rSetUpdateStatus({
                            [dash]: 'Ready'
                        })
                        // console.log('6')
                    }
                }
            }
            setupData()
        }

        if ( //if apikey not setup show about menu
            (s.apiKey === '' && s.apiFlag === 0 && s.login === 1) ||
            (s.apiKey === null && s.apiFlag === 0 && s.login === 1)
        ) {
            console.log("API key not returned")
            this.setState({
                apiFlag: 1,
                watchListMenu: 0,
                aboutMenu: 0,
                showStockWidgets: 0,
            }, () => { this.toggleBackGroundMenu('about') })
        }

        if ((s.globalStockList !== prevState.globalStockList && s.login === 1)) {
            console.log('loading global stock data')
            LoadStockData(this, s, GetStockPrice, s.finnHubQueue);
            LoadTickerSocket(this, prevState, s.globalStockList, s.socket, s.apiKey, UpdateTickerSockets);
        }

        if (s.login === 1 && s.loadStartingDashBoard === 0) {

            try {
                if (s.dashBoardData && Object.keys(s.dashBoardData).length > 0) {
                    console.log('loading starting dashboard')
                    if (s.dashBoardData[s.currentDashBoard] !== undefined) {
                        let loadWidget = s.dashBoardData[s.currentDashBoard]["widgetlist"];
                        let loadGlobal = s.dashBoardData[s.currentDashBoard]["globalstocklist"];
                        this.loadDashBoard(loadGlobal, loadWidget);
                        this.setState({ dashBoardMenu: 1, loadStartingDashBoard: 1 });
                    } else if (Object.keys(s.dashBoardData).length > 0) {
                        const defaultDashboard = Object.keys(s.dashBoardData)[0]
                        let loadWidget = s.dashBoardData[defaultDashboard]["widgetlist"];
                        let loadGlobal = s.dashBoardData[defaultDashboard]["globalstocklist"];
                        this.loadDashBoard(loadGlobal, loadWidget);
                        this.setState({
                            dashBoardMenu: 1,
                            currentDashBoard: defaultDashboard,
                            loadStartingDashBoard: 1
                        });
                    }
                }
            } catch (err) {
                console.log("failed to load dashboards", err);
            }
        }

        if (s.rebuildDataSet === 1 && s.login === 1) {
            console.log("Rebuilding dataset.")
            this.setState({ rebuildDataSet: 0 }, () => {
                let setupData = async function () {
                    await p.tGetMongoDB()
                    p.rSetUpdateStatus({
                        [s.currentDashBoard]: 'Updating'
                    })
                    await p.tGetFinnhubData({
                        currentDashboard: s.currentDashBoard,
                        widgetList: Object.keys(s.dashBoardData[s.currentDashBoard].widgetlist),
                        finnHubQueue: s.finnHubQueue,
                    })
                    p.rSetUpdateStatus({
                        [s.currentDashBoard]: 'Ready'
                    })
                }
                setupData()
            })
        }
    }

    componentWillUnmount() {
        if (this.state.socket !== "") {
            this.state.socket.close();
        }
    }

    uploadGlobalStockList(newStockObj: stockList) {
        this.setState({ globalStockList: newStockObj });
    }

    updateAPIKey(newKey: string) {
        this.setState({ apiKey: newKey });
    }

    setSecurityFocus(target: string) {
        this.setState({ targetSecurity: target })
    }

    render() {
        const s: AppState = this.state
        const menuWidgetToggle = MenuWidgetToggle(this);
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

        const backGroundSelection: { [key: string]: React.ReactElement } = {
            endPoint: React.createElement(EndPointMenu, endPointProps(this)),
            manageAccount: React.createElement(AccountMenu, accountMenuProps(this)),
            widgetMenu: React.createElement(WidgetMenu, widgetMenuProps(this)),
            about: React.createElement(AboutMenu, { apiFlag: this.state.apiFlag }),
            exchangeMenu: React.createElement(ExchangeMenu, exchangeMenuProps(this)),
            templates: React.createElement(TemplateMenu, templateMenuProps(this)),
        };

        const backGroundMenu = () => {
            return <div className="backgroundMenu">{backGroundSelection[s.backGroundMenu]}</div>;
        };

        return (
            <>
                <TopNav
                    AccountMenu={this.state.accountMenu}
                    AddNewWidgetContainer={this.AddNewWidgetContainer}
                    apiFlag={this.state.apiFlag}
                    backGroundMenu={this.state.backGroundMenu}
                    currentDashBoard={this.state.currentDashBoard}
                    dashBoardMenu={this.state.dashBoardMenu}
                    finnHubQueue={this.state.finnHubQueue}
                    lockWidgets={this.lockWidgets}
                    login={this.state.login}
                    logOut={this.logOut}
                    logoutServer={this.logoutServer}
                    menuList={this.state.menuList}
                    menuWidgetToggle={menuWidgetToggle}
                    newMenuContainer={this.newMenuContainer}
                    saveCurrentDashboard={this.saveCurrentDashboard} //saveCurrentDashboard
                    showStockWidgets={this.state.showStockWidgets}
                    toggleBackGroundMenu={this.toggleBackGroundMenu}
                    toggleWidgetVisability={this.toggleWidgetVisability}
                    updateAPIFlag={this.updateAPIFlag}
                    WatchListMenu={this.state.watchListMenu}
                    widgetLockDown={this.state.widgetLockDown}
                    widgetSetup={this.state.widgetSetup}
                />
                <WidgetController
                    apiKey={this.state.apiKey}
                    availableStocks={this.state.availableStocks}
                    changeWidgetName={this.changeWidgetName}
                    currentDashBoard={this.state.currentDashBoard}
                    dashBoardData={this.state.dashBoardData}
                    DashBoardMenu={this.state.dashBoardMenu}
                    defaultExchange={this.state.defaultExchange}
                    exchangeList={this.state.exchangeList}
                    finnHubQueue={this.state.finnHubQueue}
                    getSavedDashBoards={this.getSavedDashBoards}
                    globalStockList={this.state.globalStockList}
                    loadSavedDashboard={this.loadSavedDashboard}
                    login={this.state.login}
                    menuList={this.state.menuList}
                    menuWidgetToggle={menuWidgetToggle}
                    moveWidget={this.moveWidget}
                    newDashboard={this.newDashboard}
                    processLogin={this.processLogin}
                    removeWidget={this.removeWidget}
                    saveCurrentDashboard={this.saveCurrentDashboard}
                    setDrag={this.setDrag}
                    setSecurityFocus={this.setSecurityFocus}
                    showStockWidgets={this.state.showStockWidgets}
                    snapWidget={this.snapWidget}
                    streamingPriceData={this.state.streamingPriceData}
                    syncGlobalStockList={this.syncGlobalStockList}
                    targetSecurity={this.state.targetSecurity}
                    updateAPIFlag={this.updateAPIFlag}
                    updateAPIKey={this.updateAPIKey}
                    updateDashBoards={this.updateDashBoards}
                    updateDefaultExchange={this.updateDefaultExchange}
                    updateGlobalStockList={this.updateGlobalStockList}
                    updateWidgetConfig={this.updateWidgetConfig}
                    updateWidgetFilters={this.updateWidgetFilters}
                    updateWidgetStockList={this.updateWidgetStockList}
                    uploadGlobalStockList={this.uploadGlobalStockList}
                    WatchListMenu={this.state.watchListMenu}
                    widgetCopy={this.state.widgetCopy}
                    widgetList={this.state.widgetList}
                    widgetLockDown={this.state.widgetLockDown}
                    zIndex={this.state.zIndex}
                />
                {loginScreen}
                {backGroundMenu()}
            </>
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
    rUpdateExchangeList,
    rDataModelLogout,
    rExchangeDataLogout,
    rExchangeListLogout,
    rTargetDashboardLogout,
})(App);

