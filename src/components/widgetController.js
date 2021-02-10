import React from "react";
import WidgetContainer from "./widgetContainer.js";
import {returnBodyProps} from "../registers/widgetControllerReg.js"

function MenuWidgetToggle(context) {
    //Create dashboard menu if first time looking at, else toggle visability
    return function toggleFunction(menuName, dashName = "pass", that = context ){
        if (that.state.menuList[menuName] === undefined) {

            that.newMenuContainer(menuName, dashName, "menuWidget");
            that.setState({ [menuName]: 1 });
        } else {
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

    renderWidgetGroup(widgetObjList) {
        // const p = this.props
        if (widgetObjList !== undefined && widgetObjList[0]['pass'] === undefined) {
            // console.log("Presort:", widgetObjList)
            widgetObjList.sort((a,b) => (a.columnOrder > b.columnOrder) ? 1 : -1)
            // console.log("Post Sort:", widgetObjList)
            const p = this.props
            const widgetGroup = widgetObjList.map((el) => {
            const thisWidgetProps = {
                key: el.widgetId,
                moveWidget: p.moveWidget,
                removeWidget: p.removeWidget,
                stateRef: el.widgetConfig, //used by app.js to move and remove widgets.
                widgetBodyProps: returnBodyProps(this, el.widgetType, el.widgetID),
                widgetKey: el.widgetID,
                widgetLockDown: p.widgetLockDown,
                changeWidgetName: p.changeWidgetName,
                zIndex: p.zIndex,
                showStockWidgets: p.showStockWidgets,
                snapWidget: p.snapWidget,
                setDrag: p.setDrag,
                widgetList: el,
                updateAPIFlag: p.updateAPIFlag,
            }
            if (el.widgetConfig === 'menuWidget') {
                thisWidgetProps['menuWidgetToggle'] = this.props.menuWidgetToggle
                thisWidgetProps['showMenu'] = p[el.widgetID]    
            }
            if (p.widgetCopy.widgetID === el.widgetID){
                thisWidgetProps.widgetCopy = p.widgetCopy
            }
                return (
                <div key={el.widgetID+'thisKey'} style={{padding: "1px"}}>
                    {React.createElement(WidgetContainer, thisWidgetProps)}
                </div>
                )
                    
            })
            return widgetGroup
        } else {
            const phantomStyle = {
                padding: "1px",
                height:"10px",
                width:'400px',

            }
            return ( //empty column place holder.
            <div 
                key={widgetObjList[0]['pass']+"phantom"} 
                style={phantomStyle} 
            />
            ) 
        }
    } 

    render(){
        const p = this.props
        const allWidgets = {...p.widgetList, ...p.menuList}
        const widgetGroups = Array.from({length: 32},  (i, x) => {return [{'pass':x}]})
        for (const w in allWidgets) {
            const thisColumn = allWidgets[w].column
            // console.log(thisColumn)
            if (thisColumn === 'drag') {
                widgetGroups[32] = []
                widgetGroups[32].push(allWidgets[w])
            } else { if (widgetGroups[thisColumn][0]['pass'] !== undefined) {
                widgetGroups[thisColumn] = []
            }
            widgetGroups[thisColumn].push(allWidgets[w])
            }
            // widgetGroups[thisColumn] = [allWidgets[w]]
        }
    // console.log("WIDGETGROUPS:", widgetGroups)

        const renderWidgetColumns = Object.keys(widgetGroups).map((el) => {
            return <div key={el+"divkey"} style={{padding: "1px",}}>
                {this.renderWidgetGroup(widgetGroups[el])}
            </div>
        })

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