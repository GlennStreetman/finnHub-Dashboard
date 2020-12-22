import React from "react";
import WidgetContainer from "./widgetContainer.js";
import {returnBodyProps} from "../registers/widgetControllerReg.js"

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
                widgetBodyProps={returnBodyProps(that, widgetState[el]["widgetType"], el)}
                widgetKey={el}
                widgetList={widgetState[el]}
                widgetLockDown={this.props.widgetLockDown}
                changeWidgetName={this.props.changeWidgetName}
                zIndex={this.props.zIndex}
                updateZIndex={this.props.updateZIndex}
                showStockWidgets={this.props.showStockWidgets}
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
                widgetBodyProps={returnBodyProps(that, el)}
                widgetKey={el}
                widgetList={menuState[el]}
                widgetLockDown={this.props.widgetLockDown}
                changeWidgetName={this.props.changeWidgetName}
                zIndex={this.props.zIndex}
                updateZIndex={this.props.updateZIndex}
                showStockWidgets={this.props.showStockWidgets}
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