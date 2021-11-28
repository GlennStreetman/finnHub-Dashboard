import React from "react";
import { widgetLookUp } from '../registers/widgetContainerReg.js'
import { excelRegister, excelRegister_singleSecurity } from '../registers/excelButtonRegister'
import ToolTip from './toolTip.js'
import ErrorBoundary from './widgetErrorBoundary';
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from '../hooks';
import { rUnmountWidget } from '../slices/sliceShowData'
import { rRemoveWidgetDataModel } from '../slices/sliceDataModel'
import { toggleWidgetBody } from 'src/appFunctions/appImport/widgetLogic'
import { RemoveWidget } from 'src/appFunctions/appImport/widgetLogic'
import { setDragWidget, setDragMenu, moveWidget, SnapWidget } from 'src/appFunctions/appImport/widgetGrid'
import { rSetMenuList } from 'src/slices/sliceMenuList'
import { tChangeWidgetName } from 'src/thunks/thunkChangeWidgetName'
import { rSetDashboardData } from 'src/slices/sliceDashboardData'
import { tSaveDashboard } from 'src/thunks/thunkSaveDashboard'


//creates widget container. Used by all widgets.
function WidgetContainer(p) {

    const useDispatch = useAppDispatch
    const useSelector = useAppSelector
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const [renderHeader, setRenderHeader] = useState()
    const [showEditPane, setShowEditPane] = useState(0) //0: Hide, 1: Show
    const [show, setShow] = useState('block') //block = visable, none = hidden
    const [searchText, setSearchText] = useState('')
    const widgetRef = React.createRef()

    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const menuList = useSelector((state) => { return state.menuList })

    const apiKey = useSelector((state) => { return state.apiKey })
    const apiAlias = useSelector((state) => { return state.apiAlias })
    const targetSecurity = useSelector((state) => { return state.targetSecurity })
    const exchangeList = useSelector((state) => { return state.exchangeList.exchangeList })
    const dashboardID = dashboardData?.[currentDashboard]?.['id'] ? dashboardData[currentDashboard]['id'] : ''

    useEffect(() => {
        setRenderHeader(p.widgetList["widgetHeader"])
    }, [p.widgetList])

    useEffect(() => {
        const visable = () => {
            if (p.widgetList.column === 0 && p.showMenuColumn === false) {
                return "none"
            }
            else if (p.stateRef === "menuWidget" && p.showMenu === 0) {
                return "none"
            } else if (p.showStockWidgets === 0) {
                return "none"
            } else {
                return "block"
            }
        }
        setShow(visable)
    }, [p.showMenu, p.showStockWidgets, p.stateRef, p.showMenuColumn, p.widgetList.column])

    function changeSearchText(text) {
        if (text !== '' && text !== undefined) {
            setSearchText(text)
        }
    }

    const showPane = function (updateFunction, fixState = -1) {
        let showMenu = showEditPane === 0 ? 1 : 0;
        fixState !== -1 && (showMenu = fixState);
        updateFunction(showMenu);
    }

    function trackUpdate(e) {//changes widget name.
        setRenderHeader(e.target.value)
    }

    async function updateHeader(e) {//changes widget name.
        if (p.stateRef === "stockWidget") {
            await dispatch(tChangeWidgetName({
                stateRef: 'widgetList',
                widgetID: p.widgetKey,
                newName: e.target.value,
            }))
            dispatch(tSaveDashboard({ dashboardName: currentDashboard }))
        }
    }

    function dragElement() {

        const widgetState: any = widgetRef?.current ? widgetRef.current : { state: {} }
        if (widgetState && widgetState?.state === undefined) { widgetState.state = {} }
        widgetState.state.widgetID = p.widgetList.widgetID
        let xAxis = 0;
        let yAxis = 0;
        //@ts-ignore
        document.getElementById(p.widgetList["widgetID"]).onmousedown = dragMouseDown;
        // let widgetWidth = document.getElementById(p.widgetKey + "box").clientWidth;
        let widgetWidth = p.widgetWidth
        let widgetCenter = widgetWidth / 2

        async function dragMouseDown(e) {
            // console.log('start drag')
            e = e || window.event;
            e.preventDefault();

            xAxis = e.clientX + window.scrollX
            yAxis = e.clientY
            if (p.stateRef === 'stockWidget') {
                const [newDrag, widgets] = await setDragWidget(currentDashboard, dashboardData, p.widgetKey, widgetState.state)
                await p.updateAppState(newDrag)
                dispatch(rSetDashboardData(widgets))
            } else {
                const [newDrag, menu] = await setDragMenu(menuList, p.widgetKey, widgetState.state)
                await p.updateAppState(newDrag)
                dispatch(rSetMenuList(menu))
            }

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        async function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();

            xAxis = e.clientX + window.scrollX;
            yAxis = e.clientY + window.scrollY;

            let newX = xAxis - widgetCenter + 25 >= 5 ? xAxis - widgetCenter + 25 : 5
            let newY = yAxis - 25 >= 60 ? yAxis - 25 : 60
            if (p.stateRef === 'stockWidget') {
                const payload = moveWidget(p.stateRef, dashboardData, menuList, currentDashboard, p.widgetKey, newX, newY);
                dispatch(rSetDashboardData(payload))
            } else {
                const payload = moveWidget(p.stateRef, dashboardData, menuList, currentDashboard, p.widgetKey, newX, newY);
                dispatch(rSetMenuList(payload))
            }
        }

        async function closeDragElement(e) {
            console.log('close')
            // stop moving when mouse button is released:
            xAxis = e.clientX + window.scrollX;
            yAxis = e.clientY + window.scrollY;
            let newX = xAxis - widgetWidth + 25 >= 5 ? xAxis - widgetWidth + 25 : 5
            let newY = yAxis - 25 >= 60 ? yAxis - 25 : 60
            document.onmouseup = null;
            document.onmousemove = null;
            const payload = moveWidget(p.stateRef, dashboardData, menuList, currentDashboard, p.widgetKey, newX, newY);
            await p.updateAppState(payload)
            const [snapPayload, dashboard, menu] = await SnapWidget(p.widgetList['widgetConfig'], p.widgetKey, xAxis, yAxis, widgetWidth, p.focus, dashboardData, menuList, currentDashboard)
            await p.updateAppState(snapPayload)
            dispatch(rSetDashboardData(dashboard))
            dispatch(rSetMenuList(menu))
            dispatch(tSaveDashboard({ dashboardName: currentDashboard }))

        }
    }

    const bodyVisable = {
        display: show,
    }
    const excelFunction = excelRegister[p.widgetList.widgetType]


    let widgetProps = p.widgetBodyProps ? p.widgetBodyProps() : {}

    widgetProps["showEditPane"] = showEditPane;
    widgetProps['updateAppState'] = p.updateAppState;

    if (p.widgetKey !== "dashBoardMenu") {
        widgetProps['searchText'] = searchText
        widgetProps['changeSearchText'] = changeSearchText
        widgetProps['widgetType'] = p.widgetList["widgetType"]
        widgetProps['config'] = p.widgetList.config
        widgetProps['finnHubQueue'] = p.finnHubQueue
        widgetProps['filters'] = p.widgetList["filters"]
        widgetProps['trackedStocks'] = p.widgetList["trackedStocks"]
        widgetProps['widgetKey'] = p.widgetKey
    }
    if (p.widgetCopy) {
        widgetProps['widgetCopy'] = p.widgetCopy
    }

    const compStyle = {
        display: show,
        overflow: 'hidden',
        border: '2px solid black',
        borderRadius: '10px',
        backgroundColor: 'white',
        width: 'auto'
    };

    if (p.widgetList.column === 'drag') {
        compStyle['position'] = 'absolute'
        compStyle['top'] = p.widgetList["yAxis"]
        compStyle['left'] = p.widgetList["xAxis"]
        compStyle['width'] = p.widgetWidth
    }

    return (
        <div
            key={p.widgetKey + "container" + p.widgetList.column}
            id={p.widgetKey + "box"}
            style={compStyle}
            className="widgetBox"
            data-testid={`container-${p.widgetList.widgetType}`}
        >
            <div className={p.stateRef === 'menuWidget' ? "menuHeader" : "widgetHeader"}>
                {showEditPane === 0 ? (
                    <>
                        {widgetProps['helpText'] !== undefined && <ToolTip textFragment={widgetProps['helpText'][0]} hintName={widgetProps['helpText'][1]} />}
                        {renderHeader}
                    </>
                ) : (
                    <input data-testid={`rename-${p.widgetList["widgetType"]}`} type="text" id={p.widgetKey + "HeaderValue"} value={renderHeader} onChange={trackUpdate} onBlur={updateHeader} />
                )}

                <button
                    className="widgetButtonHead"
                    id={p.widgetList["widgetID"]}
                    onMouseOver={() => {
                        dragElement();
                    }}
                >
                    <i className="fa fa-arrows" aria-hidden="true"></i>
                </button>
                <>
                    <button
                        className="widgetButtonHead"
                        onClick={() => {
                            const toggled = toggleWidgetBody(p.widgetKey, p.stateRef, dashboardData, menuList, currentDashboard)
                            if (p.stateRef === 'stockWidget') {
                                dispatch(rSetDashboardData(toggled))
                            } else {
                                dispatch((rSetMenuList(toggled)))
                            }
                            console.log('save toggle', { dashboardName: currentDashboard })
                            dispatch(tSaveDashboard({ dashboardName: currentDashboard }))
                        }
                        }>
                        {p.widgetList.showBody !== false ? <i className="fa fa-caret-square-o-down" aria-hidden="true" /> : <i className="fa fa-caret-square-o-right" aria-hidden="true" />}
                    </button>

                    <button data-testid={`editPaneButton-${p.widgetList["widgetType"]}`} className="widgetButtonHead" onClick={() => { showPane(setShowEditPane, -1) }}>
                        <i className="fa fa-pencil-square-o" aria-hidden="true" />
                    </button>
                </>
            </div>
            {p.widgetList.showBody !== false ? (
                <div className='widgetBody' style={bodyVisable} key={p.showBody}>

                    <ErrorBoundary widgetType={p.widgetList["widgetType"]}>
                        {React.createElement(widgetLookUp[p.widgetList["widgetType"]], { ref: widgetRef, ...widgetProps })}
                    </ErrorBoundary>
                </div>) : (<></>)}

            <div className="widgetFooter">
                {p.widgetList.showBody !== false && showEditPane === 1 && (
                    p.stateRef !== 'menuWidget' ?
                        <button
                            onClick={async () => {
                                if (p.stateRef === "stockWidget" || p.stateRef === 'marketWidget') {
                                    const updateWidgets = await RemoveWidget(p.widgetKey, dashboardData, currentDashboard);
                                    dispatch(rSetDashboardData(updateWidgets))
                                    dispatch(tSaveDashboard({ dashboardName: currentDashboard }))
                                    fetch(`/deleteFinnDashData?widgetID=${p.widgetKey}`) //delete from mongo.
                                    const payload = {
                                        widgetKey: p.widgetKey,
                                        dashboardName: currentDashboard,
                                    }
                                    dispatch(rUnmountWidget(payload))
                                    dispatch(rRemoveWidgetDataModel(payload))
                                }
                            }}
                        >
                            <i className="fa fa-times" aria-hidden="true" data-testid={`removeWidget-${p.widgetList["widgetType"]}`}></i>
                        </button>
                        : <></>
                )}

                {p.widgetList.showBody !== false && showEditPane !== 1 && (

                    excelRegister_singleSecurity[p.widgetList.widgetType] && ( //button returns data for target securities associated with widget.
                        <button className='widgetButtonFoot' onClick={() => excelFunction(p.apiKey, currentDashboard, p.widgetList.widgetHeader, p.widgetList.config.targetSecurity, p.widgetList.config)}>
                            <i className="fa fa-file-excel-o" aria-hidden="true" data-testid={`excelButton-${p.widgetList["widgetType"]}`}></i>
                        </button>
                    )
                )}

                {p.widgetList.showBody !== false && showEditPane !== 1 && (

                    excelRegister[p.widgetList.widgetType] && ( //button returns data for all securities associated with widget.
                        <button className='widgetButtonFoot' onClick={() => excelFunction(p.apiKey, currentDashboard, p.widgetList.widgetHeader, false, p.widgetList.config)}>
                            <i className="fa fa-list" aria-hidden="true" data-testid={`excelButton-${p.widgetList["widgetType"]}`}></i>
                        </button>
                    )
                )}
            </div>
        </div>
    );

}

export default WidgetContainer;


