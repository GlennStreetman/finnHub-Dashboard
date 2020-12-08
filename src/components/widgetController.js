import React from "react";
import WidgetContainer from "./widgetContainer.js";

//Import props function from each widget/menu here and add to returnBodyProps function below.
import { dashBoardMenuProps } from "./../widgets/Menu/dashBoardMenu/dashBoardMenu.js";
import { watchListMenuProps } from "./../widgets/Menu/watchListMenu/watchListMenu.js";
import { accountMenuProps } from "./../widgets/Menu/AccountMenu/accountMenu.js";
import { aboutMenuProps } from "./../widgets/Menu/AboutMenu/AboutMenu.js";

import { candleWidgetProps } from "../widgets/Price/candles/candleWidget.js";
import { stockDetailWidgetProps } from "../widgets/Price/quote/stockDetailWidget.js";

import { newsWidgetProps } from "./../widgets/Fundamentals/marketNews/marketNewsBody.js";
import { metricsProps } from "./../widgets/Fundamentals/basicFinancials/basicFinancialsBody.js";

function MenuWidgetToggle(context) {
    //Create dashboard menu if first time looking at, else toggle visability
    return function toggleFunction(menuName, dashName = "pass", that = context ){
        // console.log("toggling ", menuName)
        if (that.state.menuList[menuName] === undefined) {
            console.log("new menu")
            that.newMenuContainer(menuName, dashName, "menuWidget");
            that.setState({ [menuName]: 1 });
        } else {
            // console.log("toggle menu")
            that.state[menuName] === 1 ? that.setState({ [menuName]: 0 }) : that.setState({ [menuName]: 1 });
        }
    }
}

class WidgetController extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            widgetLockDown: 0, //1: Hide buttons, 0: Show buttons
        }

        // this.menuWidgetToggle = this.menuWidgetToggle.bind(this);
        this.returnBodyProps = this.returnBodyProps.bind(this);
    }

    returnBodyProps(that, key, ref = "pass") {
        //text reference should match dropdown link.
        let widgetBodyProps = {
            WatchListMenu: () => watchListMenuProps(that, key),
            DashBoardMenu: () => dashBoardMenuProps(that, key),
            CandleWidget: () => candleWidgetProps(that, ref),
            NewsWidget: () => newsWidgetProps(that, ref),
            StockDetailWidget: () => stockDetailWidgetProps(that, ref),
            AccountMenu: () => accountMenuProps(that, ref),
            AboutMenu: () => aboutMenuProps(that, ref),
            MetricsWidget: () => metricsProps(that, ref),
        };
        let renderBodyProps = widgetBodyProps[key];
        // console.log(renderBodyProps);
        return renderBodyProps;
    }

    render(){
        
        let widgetState = this.props.widgetList;
        let menuState = this.props.menuList;
        let that = this;
        
        //render all finnHub API widgets.
        let widgetRender = Object.keys(widgetState).map((el) => (
            <WidgetContainer
                key={el}
                moveWidget={this.props.moveWidget}
                removeWidget={this.props.removeWidget}
                stateRef="widgetList" //used by app.js to move and remove widgets.
                widgetBodyProps={this.returnBodyProps(that, widgetState[el]["widgetType"], el)}
                widgetKey={el}
                widgetList={widgetState[el]}
                widgetLockDown={this.props.widgetLockDown}
                changeWidgetName={this.props.changeWidgetName}
                zIndex={this.props.zIndex}
                updateZIndex={this.props.updateZIndex}
            />
        ));
        
        //render all menu widgets.
        let menuRender = Object.keys(menuState).map((el) => (
            <WidgetContainer
                key={el}
                menuWidgetToggle={this.props.menuWidgetToggle}
                moveWidget={this.props.moveWidget}
                removeWidget={this.props.removeWidget}
                stateRef="menuList" //used by app.js to move and remove widgets.
                showMenu={this.props[el]}
                widgetBodyProps={this.returnBodyProps(that, el)}
                widgetKey={el}
                widgetList={menuState[el]}
                widgetLockDown={this.props.widgetLockDown}
                changeWidgetName={this.props.changeWidgetName}
                zIndex={this.props.zIndex}
                updateZIndex={this.props.updateZIndex}
                WatchListMenu={this.state.WatchListMenu}
                AccountMenu={this.state.AccountMenu}
                AboutMenu={this.state.AboutMenu}
                DashBoardMenu={this.state.DashBoardMenu}
            />
        ))

        return this.props.login === 1 ? (
            <>
                {widgetRender}
                {menuRender}
            </>
        ) : (
            <>
                {menuRender}
            </>
        )
    }
}

export {WidgetController, MenuWidgetToggle};