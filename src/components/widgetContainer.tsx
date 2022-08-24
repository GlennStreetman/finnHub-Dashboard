import React from "react";
import { useState, useEffect } from "react";

import IconButton from "@mui/material/IconButton";
import { FaList } from "react-icons/fa";
import { IconContext } from "react-icons";
import { ImFileExcel } from "react-icons/im";
import {
    AiOutlineEdit,
    AiFillDownCircle,
    AiFillRightCircle,
    AiOutlineDrag,
} from "react-icons/ai";

import ToolTip from "./toolTip";
import ErrorBoundary from "./widgetErrorBoundary";
import { useAppDispatch, useAppSelector } from "src/hooks";
import { widget } from "src/App";
import { widgetLookUp } from "../registers/widgetContainerReg";
import {
    excelRegister,
    excelRegister_singleSecurity,
} from "../registers/excelButtonRegister";

import { rUnmountWidget } from "../slices/sliceShowData";
import { rRemoveWidgetDataModel } from "../slices/sliceDataModel";
import { rSetMenuList } from "src/slices/sliceMenuList";
import {
    rSetDashboardData,
    rRemoveWidget,
    removeWidgetPayload,
} from "src/slices/sliceDashboardData";
import { tSaveDashboard } from "src/thunks/thunkSaveDashboard";
import { tChangeWidgetName } from "src/thunks/thunkChangeWidgetName";

import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";
import { toggleWidgetBody } from "src/appFunctions/appImport/widgetLogic";
import {
    setDragWidget,
    setDragMenu,
    SnapWidget,
    moveStockWidget,
    moveMenu,
} from "src/appFunctions/appImport/widgetGrid";

interface containerProps {
    enableDrag: boolean;
    finnHubQueue: finnHubQueue;
    focus: number;
    key: string;
    stateRef: "stockWidget" | "menuWidget" | "marketWidget";
    updateAppState: Function;
    widgetBodyProps: Function;
    widgetKey: string | number;
    widgetList: widget;
    widgetWidth: number;
    widgetCopy: any;
}

//creates widget container. Used by all widgets.
function WidgetContainer(p: containerProps) {
    const useDispatch = useAppDispatch;
    const useSelector = useAppSelector;
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const [renderHeader, setRenderHeader] = useState<
        "menuWIdget" | "widgetList" | "marketWidget" | string
    >("");
    const [showEditPane, setShowEditPane] = useState(0); //0: Hide, 1: Show
    const [searchText, setSearchText] = useState("");
    const widgetRef = React.createRef();

    const currentDashboard = useSelector((state) => {
        return state.currentDashboard;
    });
    const dashboardData = useSelector((state) => {
        return state.dashboardData;
    });
    const menuList = useSelector((state) => {
        return state.menuList;
    });

    const apiKey = useSelector((state) => {
        return state.apiKey;
    });

    useEffect(() => {
        setRenderHeader(p.widgetList["widgetHeader"]);
    }, [p.widgetList]);

    function changeSearchText(text) {
        if (text !== "" && text !== undefined) {
            setSearchText(text);
        }
    }

    const showPane = function (updateFunction, fixState = -1) {
        let showMenu = showEditPane === 0 ? 1 : 0;
        fixState !== -1 && (showMenu = fixState);
        updateFunction(showMenu);
    };

    function trackUpdate(e) {
        //changes widget name.
        setRenderHeader(e.target.value);
    }

    async function updateHeader(e) {
        console.log("name changed:", e.target.value);
        if (p.stateRef !== "menuWidget") {
            const updatedDash = await dispatch(
                tChangeWidgetName({
                    stateRef: "widgetList",
                    widgetID: p.widgetKey,
                    newName: e.target.value,
                })
            );
            console.log("SAVING CHANGE", updatedDash.payload.rSetDashboardData);
            dispatch(tSaveDashboard({ dashboardName: currentDashboard }));
        }
    }

    function dragElement() {
        const widgetState: any = widgetRef?.current
            ? widgetRef.current
            : { state: {} };
        if (widgetState && widgetState?.state === undefined) {
            widgetState.state = {};
        }
        widgetState.state.widgetID = p.widgetList.widgetID;
        let xAxis = 0;
        let yAxis = 0;
        //@ts-ignore
        document.getElementById(p.widgetList["widgetID"]).onmousedown =
            dragMouseDown;
        let widgetWidth = p.widgetWidth;
        let widgetCenter = widgetWidth / 2;

        async function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            xAxis = e.clientX + window.scrollX;
            yAxis = e.clientY;
            if (p.stateRef !== "menuWidget") {
                const [newDrag, widgets] = await setDragWidget(
                    currentDashboard,
                    dashboardData,
                    p.widgetKey,
                    widgetState.state
                );
                p.updateAppState["enableDrag"](true);
                p.updateAppState["widgetCopy"](newDrag.widgetCopy);
                dispatch(rSetDashboardData(widgets));
            } else {
                const [newDrag, menu] = await setDragMenu(
                    menuList,
                    p.widgetKey,
                    widgetState.state
                );
                p.updateAppState["enableDrag"](true);
                p.updateAppState["widgetCopy"](newDrag.widgetCopy);
                dispatch(rSetMenuList(menu));
            }

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        async function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            xAxis = e.clientX + window.scrollX;
            yAxis = e.clientY + window.scrollY;

            let newX =
                xAxis - widgetCenter + 25 >= 5 ? xAxis - widgetCenter + 25 : 5;
            let newY = yAxis - 25 >= 60 ? yAxis - 25 : 60;
            if (p.stateRef !== "menuWidget") {
                const payload = moveStockWidget(
                    dashboardData,
                    currentDashboard,
                    p.widgetKey,
                    newX,
                    newY
                );
                dispatch(rSetDashboardData(payload));
            } else {
                const payload = moveMenu(menuList, p.widgetKey, newX, newY);
                dispatch(rSetMenuList(payload));
            }
        }

        async function closeDragElement(e) {
            // stop moving when mouse button is released:
            p.updateAppState["enableDrag"](false);
            xAxis = e.clientX + window.scrollX; //pointer x location
            yAxis = e.clientY + window.scrollY; //pointer y location
            let dragX =
                xAxis - widgetWidth + 25 >= 5 ? xAxis - widgetWidth + 25 : 5;
            let dragY = yAxis - 25 >= 60 ? yAxis - 25 : 60;
            document.onmouseup = null;
            document.onmousemove = null;

            if (p.stateRef !== "menuWidget") {
                const payload = moveStockWidget(
                    dashboardData,
                    currentDashboard,
                    p.widgetKey,
                    dragX,
                    dragY
                );
                const [dashboard, menu] = await SnapWidget(
                    p.widgetList["widgetConfig"],
                    p.widgetKey,
                    xAxis,
                    yAxis,
                    widgetWidth,
                    p.focus,
                    payload,
                    menuList,
                    currentDashboard
                );
                dispatch(rSetDashboardData(dashboard));
                dispatch(rSetMenuList(menu));
            } else {
                const payload = moveMenu(menuList, p.widgetKey, dragX, dragY);
                const [dashboard, menu] = await SnapWidget(
                    p.widgetList["widgetConfig"],
                    p.widgetKey,
                    xAxis,
                    yAxis,
                    widgetWidth,
                    p.focus,
                    dashboardData,
                    payload,
                    currentDashboard
                );
                dispatch(rSetDashboardData(dashboard));
                dispatch(rSetMenuList(menu));
            }

            dispatch(tSaveDashboard({ dashboardName: currentDashboard }));
        }
    }

    const excelFunction = excelRegister[p.widgetList.widgetType];
    let widgetProps = p.widgetBodyProps ? p.widgetBodyProps() : {};
    widgetProps["showEditPane"] = showEditPane; //toggled widget body and edit pane.
    if (p.widgetKey !== "dashBoardMenu") {
        widgetProps["searchText"] = searchText;
        widgetProps["changeSearchText"] = changeSearchText;
        widgetProps["widgetType"] = p.widgetList["widgetType"];
        widgetProps["config"] = p.widgetList.config;
        widgetProps["finnHubQueue"] = p.finnHubQueue;
        widgetProps["filters"] = p.widgetList["filters"];
        widgetProps["trackedStocks"] = p.widgetList["trackedStocks"];
        widgetProps["widgetKey"] = p.widgetKey;
        widgetProps["updateAppState"] = p.updateAppState;
    }
    if (p.widgetCopy) {
        widgetProps["widgetCopy"] = p.widgetCopy;
    }

    const compStyle = {
        display: "block",
        overflow: "hidden",
        border: "2px solid black",
        borderRadius: "10px",
        backgroundColor: "white",
        width: "auto",
    };

    if (p.widgetList.column === "drag") {
        compStyle["position"] = "absolute";
        compStyle["top"] = p.widgetList["yAxis"];
        compStyle["left"] = p.widgetList["xAxis"];
        compStyle["width"] = `${p.widgetWidth}`;
    }

    return (
        <IconContext.Provider value={{ color: "white", size: ".75em" }}>
            <div
                key={p.widgetKey + "container" + p.widgetList.column}
                id={p.widgetKey + "box"}
                style={compStyle}
                className="widgetBox"
                data-testid={`container-${p.widgetList.widgetType}`}
            >
                <div
                    data-testid={
                        p.stateRef === "menuWidget"
                            ? "menuHeader"
                            : "widgetHeader"
                    }
                    className={
                        p.stateRef === "menuWidget"
                            ? "menuHeader"
                            : "widgetHeader"
                    }
                >
                    {showEditPane === 0 ? (
                        <>
                            {widgetProps["helpText"] !== undefined && (
                                <ToolTip
                                    textFragment={widgetProps["helpText"][0]}
                                    hintName={widgetProps["helpText"][1]}
                                />
                            )}
                            {renderHeader}
                        </>
                    ) : (
                        <input
                            data-testid={`rename-${p.widgetList["widgetType"]}`}
                            type="text"
                            id={p.widgetKey + "HeaderValue"}
                            value={renderHeader}
                            onChange={trackUpdate}
                            onBlur={updateHeader}
                        />
                    )}

                    <IconButton
                        sx={{ padding: "2px" }}
                        className="widgetButtonHead"
                        id={`${p.widgetList["widgetID"]}`}
                        onMouseOver={() => {
                            dragElement();
                        }}
                    >
                        <AiOutlineDrag aria-hidden="true" />
                    </IconButton>

                    <IconButton
                        sx={{ padding: "2px" }}
                        className="widgetButtonHead"
                        onClick={() => {
                            const toggled = toggleWidgetBody(
                                p.widgetKey,
                                p.stateRef,
                                dashboardData,
                                menuList,
                                currentDashboard
                            );
                            if (p.stateRef === "stockWidget") {
                                dispatch(rSetDashboardData(toggled));
                            } else {
                                dispatch(rSetMenuList(toggled));
                            }
                            dispatch(
                                tSaveDashboard({
                                    dashboardName: currentDashboard,
                                })
                            );
                        }}
                    >
                        {p.widgetList.showBody !== false ? (
                            <AiFillDownCircle className="" aria-hidden="true" />
                        ) : (
                            <AiFillRightCircle
                                className=""
                                aria-hidden="true"
                            />
                        )}
                    </IconButton>

                    <IconButton
                        sx={{ padding: "2px" }}
                        data-testid={`editPaneButton-${p.widgetList["widgetType"]}`}
                        className="widgetButtonHead"
                        onClick={() => {
                            showPane(setShowEditPane, -1);
                        }}
                    >
                        <AiOutlineEdit className="" aria-hidden="true" />
                    </IconButton>
                </div>
                {p.widgetList.showBody !== false ? (
                    <div className="widgetBody">
                        {/* @ts-ignore */}
                        <ErrorBoundary widgetType={p.widgetList["widgetType"]}>
                            {React.createElement(
                                widgetLookUp[p.widgetList["widgetType"]],
                                { ref: widgetRef, ...widgetProps }
                            )}
                        </ErrorBoundary>
                    </div>
                ) : (
                    <></>
                )}

                <div className="widgetFooter">
                    {p.widgetList.showBody !== false &&
                        showEditPane === 1 &&
                        (p.stateRef !== "menuWidget" ? (
                            <button
                                onClick={async () => {
                                    if (
                                        p.stateRef === "stockWidget" ||
                                        p.stateRef === "marketWidget"
                                    ) {
                                        const payload: removeWidgetPayload = {
                                            widgetKey: p.widgetKey,
                                            dashboardName: currentDashboard,
                                        };
                                        dispatch(rRemoveWidget(payload));
                                        dispatch(rUnmountWidget(payload));
                                        dispatch(
                                            rRemoveWidgetDataModel(payload)
                                        );
                                        dispatch(
                                            tSaveDashboard({
                                                dashboardName: currentDashboard,
                                            })
                                        );
                                        fetch(
                                            `/api/deleteFinnDashData?widgetID=${p.widgetKey}`
                                        ); //delete from mongo.
                                    }
                                }}
                            >
                                <i
                                    className="fa fa-times"
                                    aria-hidden="true"
                                    data-testid={`removeWidget-${p.widgetList["widgetType"]}`}
                                ></i>
                            </button>
                        ) : (
                            <></>
                        ))}

                    {p.widgetList.showBody !== false &&
                        showEditPane !== 1 &&
                        excelRegister_singleSecurity[
                            p.widgetList.widgetType
                        ] && ( //button returns data for target securities associated with widget.
                            <IconButton
                                className="widgetButtonFoot"
                                onClick={() => {
                                    excelFunction(
                                        apiKey,
                                        currentDashboard,
                                        p.widgetList.widgetHeader,
                                        p.widgetList.config.targetSecurity,
                                        p.widgetList.config
                                    );
                                }}
                            >
                                <ImFileExcel
                                    className=""
                                    aria-hidden="true"
                                    data-testid={`excelButton-${p.widgetList["widgetType"]}`}
                                ></ImFileExcel>
                            </IconButton>
                        )}

                    {p.widgetList.showBody !== false &&
                        showEditPane !== 1 &&
                        excelRegister[p.widgetList.widgetType] && ( //button returns data for all securities associated with widget.
                            <IconButton
                                className="widgetButtonFoot"
                                onClick={() => {
                                    excelFunction(
                                        apiKey,
                                        currentDashboard,
                                        p.widgetList.widgetHeader,
                                        false,
                                        p.widgetList.config
                                    );
                                }}
                            >
                                <FaList
                                    className=""
                                    aria-hidden="true"
                                    data-testid={`excelButton-${p.widgetList["widgetType"]}`}
                                />
                            </IconButton>
                        )}
                </div>
            </div>
        </IconContext.Provider>
    );
}

export default WidgetContainer;
