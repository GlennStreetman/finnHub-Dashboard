import React from "react";
import { widgetLookUp } from '../registers/widgetContainerReg.js'
import { excelRegister, excelRegister_singleSecurity } from '../registers/excelButtonRegister'
import ToolTip from './toolTip.js'
import ErrorBoundary from './widgetErrorBoundary';
import { useState, useEffect } from "react";
import { useAppDispatch } from '../hooks';
import { rUnmountWidget } from '../slices/sliceShowData'
import { rRemoveWidgetDataModel } from '../slices/sliceDataModel'


//creates widget container. Used by all widgets.
function WidgetContainer(p) {

    const useDispatch = useAppDispatch
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const [renderHeader, setRenderHeader] = useState()
    const [showEditPane, setShowEditPane] = useState(0) //0: Hide, 1: Show
    const [show, setShow] = useState('block') //block = visable, none = hidden
    const [searchText, setSearchText] = useState('')
    const widgetRef = React.createRef()

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

    // const visStatus = p.widgetList.column === 0 && p.showMenuColumn === false ? 'none' : 'block' //hide widget if showbody === false

    useEffect(() => {
        setShowEditPane(0)
    }, [p.widgetLockDown])

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

    function updateHeader(e) {//changes widget name.
        if (p.stateRef === "stockWidget" || p.stateRef === 'marketWidget') {
            p.changeWidgetName('widgetList', p.widgetKey, e.target.value);
        } else {
            p.changeWidgetName('menuList', p.widgetKey, e.target.value);
        }
    }

    function dragElement() {

        const widgetState: any = widgetRef?.current ? widgetRef.current : { state: {} }
        if (widgetState && widgetState?.state === undefined) { widgetState.state = {} }
        widgetState.state.widgetID = p.widgetList.widgetID
        let xAxis = 0;
        let yAxis = 0;

        // @ts-ignore
        document.getElementById(p.widgetList["widgetID"]).onmousedown = dragMouseDown;

        let widgetWidth = 200

        function dragMouseDown(e) {
            // console.log('start drag')
            e = e || window.event;
            e.preventDefault();

            xAxis = e.clientX + window.scrollX
            yAxis = e.clientY
            p.setDrag(p.stateRef, p.widgetKey, widgetState.state)
                .then((data) => {
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                })
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();

            xAxis = e.clientX + window.scrollX;
            yAxis = e.clientY + window.scrollY;

            let newX = xAxis - widgetWidth + 25 >= 5 ? xAxis - widgetWidth + 25 : 5
            let newY = yAxis - 25 >= 60 ? yAxis - 25 : 60
            //copy widget state THEN move widget.
            p.moveWidget(p.stateRef, p.widgetKey, newX, newY);
        }

        function closeDragElement(e) {
            // stop moving when mouse button is released:
            xAxis = e.clientX + window.scrollX;
            yAxis = e.clientY + window.scrollY;
            let newX = xAxis - widgetWidth + 25 >= 5 ? xAxis - widgetWidth + 25 : 5
            let newY = yAxis - 25 >= 60 ? yAxis - 25 : 60
            const snapWidget = () => {
                p.snapWidget(p.widgetList['widgetConfig'], p.widgetKey, xAxis, yAxis)
            }
            document.onmouseup = null;
            document.onmousemove = null;
            p.moveWidget(p.stateRef, p.widgetKey, newX, newY, snapWidget);

        }
    }

    const compStyle = {
        display: show
    };

    const bodyVisable = {
        display: show,
    }
    const excelFunction = excelRegister[p.widgetList.widgetType]

    if (p.widgetList.column === 'drag') {
        compStyle['position'] = 'absolute'
        compStyle['top'] = p.widgetList["yAxis"]
        compStyle['left'] = p.widgetList["xAxis"]
    }
    let widgetProps = p.widgetBodyProps ? p.widgetBodyProps() : {}
    widgetProps["showEditPane"] = showEditPane;
    if (p.widgetKey !== "dashBoardMenu") {
        widgetProps['updateDefaultExchange'] = p.updateDefaultExchange
        widgetProps['currentDashboard'] = p.currentDashboard
        widgetProps['searchText'] = searchText
        widgetProps['changeSearchText'] = changeSearchText
        widgetProps['updateAPIFlag'] = p.updateAPIFlag
        widgetProps['widgetType'] = p.widgetList["widgetType"]
        widgetProps['config'] = p.widgetList.config
        widgetProps['updateDashBoards'] = p.updateDashBoards
        widgetProps['finnHubQueue'] = p.finnHubQueue
        widgetProps['dashboardID'] = p.dashboardID
    }
    if (p.widgetCopy) {
        widgetProps['widgetCopy'] = p.widgetCopy
    }
    const myRef = widgetRef

    const divStyle = {
        overflow: 'hidden',
        border: '2px solid black',
        borderRadius: '10px',
        backgroundColor: 'white',
        width: 'auto',
    }

    return (
        <div
            key={p.widgetKey + "container" + p.widgetList.column}
            id={p.widgetKey + "box"}
            style={divStyle}
            // className="widgetBox"
            data-testid={`container-${p.widgetList.widgetType}`}

        >
            {p.widgetLockDown === 0 ? (
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
                            onClick={() => { p.toggleWidgetBody(p.widgetKey, p.stateRef) }
                            }>
                            {p.widgetList.showBody !== false ? <i className="fa fa-caret-square-o-down" aria-hidden="true" /> : <i className="fa fa-caret-square-o-right" aria-hidden="true" />}
                        </button>

                        <button data-testid={`editPaneButton-${p.widgetList["widgetType"]}`} className="widgetButtonHead" onClick={() => { showPane(setShowEditPane, -1) }}>
                            <i className="fa fa-pencil-square-o" aria-hidden="true" />
                        </button>
                    </>
                </div>
            ) : (
                <div className="widgetHeader">{renderHeader}</div>
            )}
            {p.widgetList.showBody !== false ? (
                <div className='widgetBody' style={bodyVisable} key={p.showBody}>

                    <ErrorBoundary widgetType={p.widgetList["widgetType"]}>
                        {React.createElement(widgetLookUp[p.widgetList["widgetType"]], { ref: myRef, ...widgetProps })}
                    </ErrorBoundary>
                </div>) : (<></>)}

            <div className="widgetFooter">
                {p.widgetList.showBody !== false && showEditPane === 1 && (
                    p.stateRef !== 'menuWidget' ?
                        <button
                            onClick={async () => {
                                if (p.stateRef === "stockWidget" || p.stateRef === 'marketWidget') {
                                    p.removeWidget("dashBoardData", p.widgetKey);
                                    fetch(`/deleteFinnDashData?widgetID=${p.widgetKey}`)
                                    const payload = {
                                        widgetKey: p.widgetKey,
                                        dashboardName: p.currentDashboard,
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
                        <button className='widgetButtonFoot' onClick={() => excelFunction(p.apiKey, p.currentDashboard, p.widgetList.widgetHeader, p.widgetList.config.targetSecurity, p.widgetList.config)}>
                            <i className="fa fa-file-excel-o" aria-hidden="true" data-testid={`excelButton-${p.widgetList["widgetType"]}`}></i>
                        </button>
                    )
                )}

                {p.widgetList.showBody !== false && showEditPane !== 1 && (

                    excelRegister[p.widgetList.widgetType] && ( //button returns data for all securities associated with widget.
                        <button className='widgetButtonFoot' onClick={() => excelFunction(p.apiKey, p.currentDashboard, p.widgetList.widgetHeader, false, p.widgetList.config)}>
                            <i className="fa fa-list" aria-hidden="true" data-testid={`excelButton-${p.widgetList["widgetType"]}`}></i>
                        </button>
                    )
                )}
            </div>
        </div>
    );

}

export default WidgetContainer;


