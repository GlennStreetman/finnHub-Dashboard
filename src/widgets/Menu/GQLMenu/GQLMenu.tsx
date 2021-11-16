import { useState, useEffect, useImperativeHandle, forwardRef } from "react";

import { sliceDashboardData, globalStockList } from './../../../slices/sliceDashboardData'
// import { findByLabelText } from "@testing-library/dom";

interface endPointMenuProps {
    apiAlias: string,
    apiKey: string,
    dashboardData: sliceDashboardData,
    currentDashboard: string,
    targetSecurity: string,
    globalStockList: globalStockList,
}

function EndPointMenu(p: endPointMenuProps, ref: any) {

    const [targetDashboard, setTargetDashboard] = useState(p.currentDashboard ? p.currentDashboard : '')
    const [securityFocus, setSecurityFocus] = useState(p.targetSecurity ? p.targetSecurity : '')
    const [toggleView, setToggleView] = useState('widget') //widget or security

    useImperativeHandle(ref, () => ({ state: {} }))

    useEffect(() => { //update security focus on change to target security
        setSecurityFocus(p.targetSecurity)
    }, [p.targetSecurity])


    useEffect(() => { //update dashboard on change to target dashboard
        setTargetDashboard(p.currentDashboard)
    }, [p.currentDashboard])

    const url = window.location
    let baseURL = url.protocol + "/" + url.host + "/" + url.pathname.split('/')[1] + 'graphQL';
    baseURL = baseURL.indexOf('localhost') >= 0 ?
        baseURL.replace('http:/localhost:3000', 'localhost:5000') : //makes redirect work in dev mode.
        baseURL.replace('https:/', '')

    let endpointURL = url.protocol + "/" + url.host + "/" + url.pathname.split('/')[1] + 'qGraphQL';
    endpointURL = endpointURL.indexOf('localhost') >= 0 ?
        endpointURL.replace('http:/localhost:3000', 'localhost:5000') : //makes redirect work in dev mode.
        endpointURL.replace('https:/', '')


    const apiToggle = p.apiAlias ? p.apiAlias : p.apiKey
    const defaultQuery = `{dashboardList(key: "${apiToggle}") {dashboard}}`

    function changeSecurityFocus(e) {
        const target = e.target.value;
        setSecurityFocus(target)
    }
    const globalStockList = p.globalStockList ? p.globalStockList : {}
    const securityOptionsList = Object.keys(globalStockList).map((el) =>
        <option key={el + "sec"} value={el}>
            {el}
        </option>
    )

    function changeToggleView(e) {
        const target = e.target.value;
        setToggleView(target)
    }

    const showDataHeadings = toggleView === 'widget' ?
        <><td>Widget</td><td>All</td><td>{securityFocus}</td></> :
        <><td>Widget</td><td>Data</td></>

    const FocusDashboard = p.dashboardData?.[targetDashboard]?.widgetlist ? p.dashboardData[targetDashboard].widgetlist : {}
    const showBodyWidget = Object.keys(FocusDashboard).map((el) => {
        const apiToggle = p.apiAlias ? p.apiAlias : p.apiKey
        const queryPropsAll = `(key: "${apiToggle}" dashboard: "${targetDashboard}" widget: "${FocusDashboard[el].widgetHeader}")`
        const queryPropsSecurity = `(key: "${apiToggle}" dashboard: "${targetDashboard}" widget: "${FocusDashboard[el].widgetHeader}" security: "${securityFocus}")`
        const returnValues = `dashboard, widgetType, widgetName, security, data`
        const thisQueryAll = `{widget ${queryPropsAll} {${returnValues}}}`
        const thisQuerySecurity = `{widget ${queryPropsSecurity} {${returnValues}}}`

        return (
            <tr key={el + 'tr'}>
                <td key={el + 'td1'}>{FocusDashboard[el].widgetHeader}</td>
                <td key={el + 'td2'}>
                    <table><tbody><tr>
                        <td><a href={`//${baseURL}?query=${thisQueryAll}`} target='_blank' rel="noreferrer">Web</a></td>
                        <td><a href={`//${endpointURL}?query=${thisQueryAll}`} target='_blank' rel="noreferrer">API</a></td>
                    </tr></tbody></table>
                </td>

                <td key={el + 'td3'}>
                    <table><tbody><tr>
                        <td><a href={`//${baseURL}?query=${thisQuerySecurity}`} target='_blank' rel="noreferrer">Web</a></td>
                        <td><a href={`//${endpointURL}?query=${thisQuerySecurity}`} target='_blank' rel="noreferrer">API</a></td>
                    </tr></tbody></table>
                </td>
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
            <a style={{ margin: '5px' }} href={`//${baseURL}?query=${defaultQuery}`} target='_blank' rel="noreferrer">Explore graphQL</a>
        </div></>
    );
}

export function gqlMenuProps(that, key = "AccountMenu") {
    let propList = {
        dashboardData: that.props.dashboardData,
        apiKey: that.props.apiKey,
        apiAlias: that.props.apiAlias,
        currentDashboard: that.props.currentDashboard,
        targetSecurity: that.props.targetSecurity,
        globalStockList: that.props.globalStockList
    };
    return propList;
}

export default forwardRef(EndPointMenu)
