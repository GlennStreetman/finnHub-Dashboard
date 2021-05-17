import React from "react";
import { estimateOptions, fundamentalsOptions, priceOptions } from '../registers/topNavReg'
import { menuList, widgetSetup, filters } from './../App'
import { finnHubQueue } from "./../appFunctions/appImport/throttleQueueAPI";

interface topNavProps {
    AccountMenu: number,
    AddNewWidgetContainer: Function,
    apiFlag: number,
    backGroundMenu: string,
    currentDashBoard: string,
    dashBoardMenu: number,
    login: number,
    logOut: Function,
    lockWidgets: Function,
    menuList: menuList,
    menuWidgetToggle: Function,
    newMenuContainer: Function,
    showStockWidgets: number,
    saveCurrentDashboard: Function,
    toggleBackGroundMenu: Function,
    toggleWidgetVisability: Function,
    updateAPIFlag: Function,
    WatchListMenu: number,
    widgetLockDown: number,
    widgetSetup: widgetSetup,
    finnHubQueue: finnHubQueue,
}

interface topNavState {
    AboutAPIKeyReminder: number,
    showAddWidgetDropdown: number,
    showEstimates: number,
    showFundamentals: number,
    showCost: number,
}

interface TopNav { //plug
    [key: string]: any
}

class TopNav extends React.Component<topNavProps, topNavState> {
    constructor(props: topNavProps) {
        super(props);
        this.state = {
            AboutAPIKeyReminder: 0,
            showAddWidgetDropdown: 0,
            showEstimates: 0,
            showFundamentals: 0,
            showCost: 0,
        };
        // this.showPane = this.showPane.bind(this);
        this.dropDownList = this.dropDownList.bind(this);
        this.isChecked = this.isChecked.bind(this);
    }

    componentDidUpdate(prevProps: topNavProps) {
        const p = this.props

        if (p.apiFlag === 1 && p.apiFlag !== prevProps.apiFlag) {
            this.setState({ AboutAPIKeyReminder: 1 })
        }
    }

    // showPane(stateRef: string, fixState = 0) {
    //     const s: topNavState = this.state
    //     //toggles view of specified menu. 1 = open 0 = closed
    //     let showMenu = s[stateRef] === 0 ? 1 : 0;
    //     if (fixState === 1) showMenu = 1;
    //     const payload: any = { [stateRef]: showMenu }
    //     this.setState(payload);
    // }

    isChecked(el: [string, string, string, string, filters | undefined, string]) {
        const p: topNavProps = this.props
        if (p.widgetSetup[el[0]] !== undefined) {
            return p.widgetSetup[el[0]]
        } else if (p.widgetSetup[el[0]] === undefined && el[5] === 'Free') {
            return true
        } else {
            return false
        }
    }

    dropDownList(dropList: [string, string, string, string, filters | undefined, string][]) {
        let newList = dropList.map((el) => {
            let [a, b, c, d, e] = el
            if (this.isChecked(el) === true) {
                return (<li key={a + 'li'} id='ddi'>
                    <a key={a} href="#r" onClick={() => { this.props.AddNewWidgetContainer(a, b, c, e); }}>
                        {d}
                    </a>
                </li>)
            } else return (false)
        })
        return <ul id='ddu' className='sub-menu'>{newList}</ul>
    }

    render() {
        const p: topNavProps = this.props

        let widgetDropDown = <>
            <ul id='ddu' className='sub-Menu'>
                <li id='ddi' className='menu-item-has-children'><a href='#1'>Estimate</a>
                    {this.dropDownList(estimateOptions)}
                </li>
                <li id='ddi' className='menu-item-has-children'><a href='#2'>Fundamentals</a>
                    {this.dropDownList(fundamentalsOptions)}
                </li>
                <li id='ddi' className='menu-item-has-children'><a href='#3'>Price</a>
                    {this.dropDownList(priceOptions)}
                </li>
            </ul>
        </>

        const showDashBoardButtons = () => {
            if (this.props.showStockWidgets === 1) {
                return (<>

                    <li id='ddi' className='navItem'>
                        <a href="#contact" onClick={() => this.props.menuWidgetToggle("dashBoardMenu", "Saved Dashboards")}>
                            {this.props.dashBoardMenu === 0 ? "Show Dashboard Menu" : "Hide Dashboard Menu"}
                        </a>
                    </li>

                    <li id='ddi' className='navItem'>
                        <a href="#contact" onClick={() => this.props.menuWidgetToggle("watchListMenu", "WatchList")}>
                            {this.props.WatchListMenu === 0 ? "Show Watchlist Menu" : "Hide Watchlist Menu"}
                        </a>
                    </li>

                    <li id='ddi' className='navItem'>
                        <a href="#contact" onClick={() => (this.props.widgetLockDown === 0 ? this.props.lockWidgets(1) : this.props.lockWidgets(0))}>
                            {this.props.widgetLockDown === 0 ? "Lock Widgets" : "Unlock Widgets"}
                        </a>
                    </li>
                    <li id='ddi' className="menu-item-has-children"><a href="#contact">Widgets</a>
                        {widgetDropDown}
                    </li>

                </>
                )
            } else { return <></> }
        }

        return this.props.login === 1 ? (

            <nav className="mainNavigation">

                <ul id='ddu' className="menu">
                    <li id='ddi'><img src="logo2.png" alt="logo"></img></li>
                    {showDashBoardButtons()}
                </ul>

                <div className="navItemEnd">
                    <ul id='ddu' className="sub-menu">
                        <li id='ddi' className="navItem">
                            <a href="#home" onClick={() => { this.props.toggleBackGroundMenu('') }}>
                                {this.props.backGroundMenu === '' ? " " : "Back to Dashboards"}
                            </a>
                        </li>
                        <li id='ddi' className="navItem">
                            <a href="#home" onClick={() => { this.props.toggleBackGroundMenu('templates') }}>
                                Templates
                    </a>
                        </li>
                        <li id='ddi' className="navItem">
                            <a href="#home" onClick={() => { this.props.toggleBackGroundMenu('endPoint') }}>
                                Endpoints
                    </a>
                        </li>
                        <li id='ddi' className="navItem">
                            <a href="#home" onClick={() => { this.props.toggleBackGroundMenu('manageAccount') }}>
                                Manage Account
                    </a>
                        </li>
                        <li id='ddi' className='navItem'>
                            <a href="#home" onClick={() => { this.props.toggleBackGroundMenu('about') }}>
                                About
                    </a>
                        </li>
                        <li id='ddi' className='navItem'>
                            <a href="#home" onClick={() => this.props.logOut()}>
                                {p.login === 0 ? "Login" : "Logout"}
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>

        ) : (
            <>
                <div className="topnav">
                    <div className='navItemEnd'>
                        <a href="#home" onClick={() => { this.props.toggleBackGroundMenu('about') }}>
                            {this.props.backGroundMenu === 'about' ? "Login" : "About"}
                        </a>
                    </div>
                </div>
            </>
        );
    }
}
export default TopNav;
