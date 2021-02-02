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
        this.renderWidgetGroup = this.renderWidgetGroup.bind(this);
        

    }

    renderWidgetGroup(widgetObjList, objectRef) {
        const p = this.props
        const widgetGroup = widgetObjList.map((el) => {
        
        let thisWidgetProps = {
            key: el.widgetId,
            moveWidget: p.moveWidget,
            removeWidget: p.removeWidget,
            stateRef: el.widgetConfig, //used by app.js to move and remove widgets.
            widgetBodyProps: returnBodyProps(this, el.widgetType, el.widgetID),
            widgetKey: el.widgetID,
            widgetLockDown: this.props.widgetLockDown,
            changeWidgetName: this.props.changeWidgetName,
            zIndex: this.props.zIndex,
            updateZIndex: this.props.updateZIndex,
            showStockWidgets: this.props.showStockWidgets,
            snapWidget: this.props.snapWidget,
            widgetList: el,
        }
        if (el.widgetConfig === 'menuWidget') {
            thisWidgetProps.menuWidgetToggle = p.menuWidgetToggle
            thisWidgetProps.showMenu = p[el.widgetID]
            
        }
            return <div style={{padding: "1px"}}>{React.createElement(WidgetContainer, thisWidgetProps)}</div>
                
        })
        return widgetGroup
    } 


    render(){
        const p = this.props
        // let that = this;
        const allWidgets = {...p.widgetList, ...p.menuList}
        //create widget groups.
        const widgetGroups = {} //{0: [...widgets], 1: [...widgets], etc}
        for (const w in allWidgets) {
            const thisColumn = allWidgets[w].column
            if (widgetGroups[thisColumn] === undefined) {
                widgetGroups[thisColumn] = []
            }
            widgetGroups[thisColumn].push(allWidgets[w])
        }


        const renderWidgetColumns = Object.keys(widgetGroups).map((el) => (
            <div style={{padding: "1px",}}>
                {this.renderWidgetGroup(widgetGroups[el])}
            </div>
        ))

        const widgetMasterStyle = {
            display: "flex",
            "flexDirection": "row",
            top: "60px",
            left: "5px",
            padding: "1px",
        };

        return this.props.login === 1 ? (
            <>
                <div className='widgetMaster' style={widgetMasterStyle}>
                    {renderWidgetColumns}
                </div>
            </>
        ) : (
            <>
            </>
        )
    }
}

export {WidgetController, MenuWidgetToggle};