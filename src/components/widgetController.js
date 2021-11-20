import React from "react";
import WidgetContainer from "./widgetContainer";
import {returnBodyProps} from "../registers/widgetControllerReg.js"

function WidgetController(p){

    function renderWidgetGroup(widgetObjList) {
        if (widgetObjList !== undefined && widgetObjList[0]['pass'] === undefined) {
            widgetObjList.sort((a,b) => (a.columnOrder > b.columnOrder) ? 1 : -1) //sort into column order.
            const widgetGroup = widgetObjList.map((el) => { //for each widget, add props.
            const thisWidgetProps = {
                apiKey: p.apiKey,
                changeWidgetName: p.changeWidgetName,
                currentDashBoard: p.currentDashBoard,
                dashboardID: p.dashboardID,
                enableDrag: p.enableDrag,
                exchangeList: p.exchangeList,
                finnHubQueue: p.finnHubQueue,
                key: el.widgetId,
                moveWidget: p.moveWidget,
                refreshFinnhubAPIDataCurrentDashboard: p.refreshFinnhubAPIDataCurrentDashboard,
                removeWidget: p.removeWidget,
                removeDashboardFromState: p.removeDashboardFromState,
                setDrag: p.setDrag,
                setSecurityFocus: p.setSecurityFocus,
                showMenuColumn: p.showMenuColumn,
                showStockWidgets: p.showStockWidgets,
                snapWidget: p.snapWidget,
                stateRef: el.widgetConfig,
                targetSecurity: p.targetSecurity,
                toggleWidgetBody: p.toggleWidgetBody,
                updateAPIFlag: p.updateAPIFlag,
                updateDefaultExchange: p.updateDefaultExchange,
                updateDashBoards: p.updateDashBoards,
                updateWidgetConfig: p.updateWidgetConfig,
                widgetBodyProps: returnBodyProps({props: p}, el.widgetType, el.widgetID),
                widgetKey: el.widgetID,
                widgetList: el,
                widgetLockDown: p.widgetLockDown,
                zIndex: p.zIndex,
                rAddNewDashboard: p.rAddNewDashboard,
                rSetTargetDashboard: p.rSetTargetDashboard,
                updateAppState: p.updateAppState,
            }
            if (el.widgetConfig === 'menuWidget') {
                thisWidgetProps['menuWidgetToggle'] = p.menuWidgetToggle
                thisWidgetProps['showMenu'] = p[el.widgetID]  
                thisWidgetProps['setWidgetFocus'] = p.setWidgetFocus
                thisWidgetProps['renameDashboard'] = p.renameDashboard
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
        const thisColumn = allWidgets[w]?.column
        if (thisColumn === 'drag') {
            widgetGroups[32] = []
            widgetGroups[32].push(allWidgets[w])
        } else { if (widgetGroups?.[thisColumn]?.[0]?.['pass'] !== undefined) {
            widgetGroups[thisColumn] = []
        }
        if (widgetGroups?.[thisColumn]) widgetGroups?.[thisColumn].push(allWidgets[w])
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
        padding: "1px",
    };

    const topFlex = {
        display: "flex",
        "flexDirection": "column",
    };

    const topPlaceHolder = {
        margin: "5px",
    }

    return p.login === 1 ? (
        <div style={topFlex}>
            <div style={topPlaceHolder}></div>
            <div className='widgetMaster' style={widgetMasterStyle}>
                {renderWidgetColumns}
            </div>
        </div>
    ) : (
        <>
        </>
    )
}

export {WidgetController };