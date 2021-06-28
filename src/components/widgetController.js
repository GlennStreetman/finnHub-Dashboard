import React from "react";
import WidgetContainer from "./widgetContainer";
import {returnBodyProps} from "../registers/widgetControllerReg.js"
// import { useState } from "react";

function MenuWidgetToggle(context) {
    //Create dashboard menu if first time looking at, else toggle visability
    return function toggleFunction(menuName, dashName = "pass", that = context ){
        console.log(menuName, dashName, that)
        // const menuNameRef = menuName.charAt(0).toUpperCase() + menuName.slice(1)
        if (that.state.menuList[menuName] === undefined) {
            console.log('here', menuName)
            that.newMenuContainer(menuName, dashName, "menuWidget");
            that.setState({ [menuName]: 1 });
        } else {
            console.log('there:', menuName)
            that.state[menuName] === 1 ? that.setState({ [menuName]: 0 }) : that.setState({ [menuName]: 1 });
        }
    }
}

function WidgetController(p){

    function renderWidgetGroup(widgetObjList) {
        
        if (widgetObjList !== undefined && widgetObjList[0]['pass'] === undefined) {
            widgetObjList.sort((a,b) => (a.columnOrder > b.columnOrder) ? 1 : -1)
            const widgetGroup = widgetObjList.map((el) => {
            const thisWidgetProps = {
                apiKey: p.apiKey,
                changeWidgetName: p.changeWidgetName,
                currentDashBoard: p.currentDashBoard,
                enableDrag: p.enableDrag,
                finnHubQueue: p.finnHubQueue,
                key: el.widgetId,
                loadSavedDashboard: p.loadSavedDashboard,
                moveWidget: p.moveWidget,
                removeWidget: p.removeWidget,
                setDrag: p.setDrag,
                setSecurityFocus: p.setSecurityFocus,
                showStockWidgets: p.showStockWidgets,
                snapWidget: p.snapWidget,
                stateRef: el.widgetConfig, //used by app.js to move and remove widgets.
                targetSecurity: p.targetSecurity,
                toggleWidgetBody: p.toggleWidgetBody,
                updateAPIFlag: p.updateAPIFlag,
                updateDashBoards: p.updateDashBoards,
                updateWidgetConfig: p.updateWidgetConfig,
                widgetBodyProps: returnBodyProps({props: p}, el.widgetType, el.widgetID),
                widgetKey: el.widgetID,
                widgetList: el,
                widgetLockDown: p.widgetLockDown,
                zIndex: p.zIndex,
            }
            if (el.widgetConfig === 'menuWidget') {
                thisWidgetProps['menuWidgetToggle'] = p.menuWidgetToggle
                thisWidgetProps['showMenu'] = p[el.widgetID]  
                thisWidgetProps['setWidgetFocus'] = p.setWidgetFocus
            }
            if (p.widgetCopy?.widgetID === el.widgetID){
                thisWidgetProps.widgetCopy = p.widgetCopy
            }

            const subComponent = React.createElement(WidgetContainer, thisWidgetProps)
                return (
                    <div key={el.widgetID+'thisKey'} style={{padding: "1px"}}>
                        {subComponent}
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

    const allWidgets = {...p.widgetList, ...p.menuList}
    const widgetGroups = Array.from({length: 32},  (i, x) => {return [{'pass':x}]}) //creates 32 columns
    
    for (const w in allWidgets) { //puts widgets into columns
        const thisColumn = allWidgets[w].column
        if (thisColumn === 'drag') {
            widgetGroups[32] = []
            widgetGroups[32].push(allWidgets[w])
        } else { if (widgetGroups[thisColumn][0]['pass'] !== undefined) {
            widgetGroups[thisColumn] = []
        }
        widgetGroups[thisColumn].push(allWidgets[w])
        }
    }

    const renderWidgetColumns = Object.keys(widgetGroups).map((el) => {
        return <div key={el+"divkey"} style={{padding: "1px",}}>
            {renderWidgetGroup(widgetGroups[el])}
        </div>
    })

    const widgetMasterStyle = {
        display: "flex",
        "flexDirection": "row",
        top: "60px",
        left: "5px",
        padding: "1px",
    };

    return p.login === 1 ? (
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

export {WidgetController, MenuWidgetToggle};