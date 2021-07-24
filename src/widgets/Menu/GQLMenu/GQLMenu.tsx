import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { dashBoardData } from '../../../App'
// import { findByLabelText } from "@testing-library/dom";

interface endPointMenuProps {
    apiAlias: string,
    apiKey: string,
    dashBoardData: dashBoardData,
    currentDashBoard: string,
    targetSecurity: string,
}

function EndPointMenu(p: endPointMenuProps, ref: any) {

    const [targetDashboard, setTargetDashboard] = useState(p.currentDashBoard ? p.currentDashBoard : '')
    const [securityFocus, setSecurityFocus] = useState(p.targetSecurity ? p.targetSecurity : '')
    const [toggleView, setToggleView] = useState('widget') //widget or security

    useImperativeHandle(ref, () => ({ state: {} }))

    useEffect(() => {
        setSecurityFocus(p.targetSecurity)
    }, [p.targetSecurity])

    const url = window.location
    let baseURL = url.protocol + "/" + url.host + "/" + url.pathname.split('/')[1] + 'graphQL';
    baseURL = baseURL.indexOf('localhost') >= 0 ?
        baseURL.replace('http:/localhost:3000', 'localhost:5000') : //makes redirect work in dev mode.
        baseURL.replace('https:/', '')
    const apiToggle = p.apiAlias ? p.apiAlias : p.apiKey
    const defaultQuery = `{dashboardList(key: "${apiToggle}") {dashboard}}`

    function changeDashboardSelection(e) {
        const target = e.target.value;
        setTargetDashboard(target)
    }

    const dashboardOptionList = Object.keys(p.dashBoardData).map((el) =>
        <option key={el + "db"} value={el}>
            {el}
        </option>
    )

    function changeSecurityFocus(e) {
        const target = e.target.value;
        setSecurityFocus(target)
    }

    const securityOptionsList = Object.keys(p.dashBoardData[targetDashboard].globalstocklist).map((el) =>
        <option key={el + "sec"} value={el}>
            {el}
        </option>
    )

    function changeToggleView(e) {
        const target = e.target.value;
        setToggleView(target)
    }
    //Widget, All Securities, securityFocus || security, widget, data   
    const showDataHeadings = toggleView === 'widget' ?
        <><td>Widget</td><td>All</td><td>{securityFocus}</td></> :
        <><td>Widget</td><td>Data</td></>

    const FocusDashboard = p.dashBoardData[targetDashboard].widgetlist
    const showBodyWidget = Object.keys(FocusDashboard).map((el) => {
        const apiToggle = p.apiAlias ? p.apiAlias : p.apiKey
        const queryPropsAll = `(key: "${apiToggle}" dashboard: "${targetDashboard}" widget: "${FocusDashboard[el].widgetHeader}")`
        const queryPropsSecurity = `(key: "${apiToggle}" dashboard: "${targetDashboard}" widget: "${FocusDashboard[el].widgetHeader}" security: "${securityFocus}")`
        const returnValues = `dashboard, widgetType, widgetName, security, data`
        const thisQueryAll = `{widget ${queryPropsAll} {${returnValues}}}`
        const thisQuerySecurity = `{widget ${queryPropsSecurity} {${returnValues}}}`
        // return(<a href={`//${baseURL}?query=${thisQuery}`} target='_blank' rel="noreferrer">{el}</a>)

        return (
            <tr key={el + 'tr'}>
                <td key={el + 'td1'}>{FocusDashboard[el].widgetHeader}</td>
                <td key={el + 'td2'}><a href={`//${baseURL}?query=${thisQueryAll}`} target='_blank' rel="noreferrer">All Data</a></td>
                <td key={el + 'td3'}><a href={`//${baseURL}?query=${thisQuerySecurity}`} target='_blank' rel="noreferrer">Security Data</a></td>
            </tr>
        )
    })
    const showBodySecurity = Object.keys(FocusDashboard).map((el) => {
        const apiToggle = p.apiAlias ? p.apiAlias : p.apiKey
        const queryPropsWidget = `(key: "${apiToggle}" dashboard: "${targetDashboard}" security: "${securityFocus}" widgetName: "${FocusDashboard[el].widgetHeader}")`
        const returnValues = `dashboard, widgetType, widgetName, data`
        const thisQuerySecurity = `{security ${queryPropsWidget} {${returnValues}}}`

        return (
            <tr key={el + 'showSec'}>
                <td key={el + 'showSec2'}>{FocusDashboard[el].widgetHeader}</td>
                <td key={el + 'showSec3'}><a href={`//${baseURL}?query=${thisQuerySecurity}`} target='_blank' rel="noreferrer">Data</a></td>
            </tr>
        )
    })

    return (<>
        <div className='stockSearch'>
            <table className="filterTable">
                <tbody>
                    <tr>
                        <td style={{ color: 'white' }} className='rightTE'>View:</td>
                        <td>
                            <select value={toggleView} onChange={changeToggleView}>
                                <option value='widget'>widget</option>
                                <option value='security'>security</option>
                            </select>
                        </td>
                        <td style={{ color: 'white' }} className='rightTE'>
                            Dash:
                        </td>
                        <td>
                            <select value={targetDashboard} onChange={changeDashboardSelection}>
                                {dashboardOptionList}
                            </select>
                        </td>
                        {toggleView === 'widget' ? <><td style={{ color: 'white' }} className='rightTE'>Focus:</td>
                            <td>
                                <select value={securityFocus} onChange={changeSecurityFocus}>{securityOptionsList}</select>
                            </td></> : <></>}
                    </tr>
                </tbody>
            </table>
        </div>
        <div>
            <table className='dataTable'>
                <thead>
                    <tr>
                        {showDataHeadings}
                    </tr>
                </thead>
                <tbody>
                    {toggleView === 'widget' ? showBodyWidget : showBodySecurity}
                </tbody>
            </table>
            <a href={`//${baseURL}?query=${defaultQuery}`} target='_blank' rel="noreferrer">Explore graphQL</a>
        </div></>
    );
}

export function gqlMenuProps(that, key = "AccountMenu") {
    let propList = {
        dashBoardData: that.props.dashBoardData,
        apiKey: that.props.apiKey,
        apiAlias: that.props.apiAlias,
        currentDashBoard: that.props.currentDashBoard,
        targetSecurity: that.props.targetSecurity,
    };
    return propList;
}

export default forwardRef(EndPointMenu)
