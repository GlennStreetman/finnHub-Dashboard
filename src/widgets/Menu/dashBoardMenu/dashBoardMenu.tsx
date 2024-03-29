import produce from "immer";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useAppSelector, useAppDispatch } from "src/hooks";
import { dashBoardData } from "src/App";
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

import { rUnmountWidget } from "src/slices/sliceShowData";
import {
    rRemoveDashboardDataModel,
    rRenameModelName,
    rAddNewDashboard,
} from "src/slices/sliceDataModel";
import { rSetTargetDashboard } from "src/slices/sliceShowData";
import { tCopyDashboard } from "src/thunks/thunkCopyDashboard";
import {
    tGetSavedDashboards,
    tGetSavedDashBoardsRes,
} from "src/thunks/thunkGetSavedDashboards";
import { uniqueObjectnName } from "src/appFunctions/stringFunctions";
import { tGetMongoDB } from "src/thunks/thunkGetMongoDB";
import {
    tGetFinnhubData,
    tgetFinnHubDataReq,
} from "src/thunks/thunkFetchFinnhub";
import { rSetUpdateStatus } from "src/slices/sliceDataModel";

import { rSetTargetSecurity } from "src/slices/sliceTargetSecurity";

import { rUpdateCurrentDashboard } from "src/slices/sliceCurrentDashboard";
import { rSetDashboardData } from "src/slices/sliceDashboardData";
import { rSetMenuList } from "src/slices/sliceMenuList";

interface props {
    helpText: string;
    showEditPane: number;
    finnHubQueue: finnHubQueue;
}

function DashBoardMenu(p: props, ref: any) {
    const useDispatch = useAppDispatch;
    const dispatch = useDispatch(); //allows widget to run redux actions.

    // const isInitialMount = useRef(true); //update to false after first render.
    const [inputText, setInputText] = useState("Enter Name");
    const [newNames, setNewNames] = useState({});
    const useSelector = useAppSelector;

    const dashboardStatus = useSelector((state) => {
        //REDUX Data associated with this widget.
        if (
            state.dataModel !== undefined &&
            state.dataModel.created !== "false"
        ) {
            const dashboardStatus: Object = state.dataModel.status;
            return dashboardStatus;
        }
    });

    const showCurrentDashboard = useSelector((state) => {
        return state.showData.targetDashboard;
    });
    const dashboardData = useSelector((state) => {
        return state.dashboardData;
    });
    const currentDashboard = useSelector((state) => {
        return state.currentDashboard;
    });
    const apiKey = useSelector((state) => {
        return state.apiKey;
    });
    const menuList = useSelector((state) => {
        return state.menuList;
    });

    useImperativeHandle(ref, () =>
        //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
        //add additional slices of state to list if they help reduce re-render time.
        ({
            state: {
                inputText: inputText,
                newNames: newNames,
            },
        })
    );

    useEffect(() => {
        let returnObj = {};
        let keyList = Object.keys(dashboardData);
        for (const x in keyList) returnObj[keyList[x]] = keyList[x];
        setNewNames(returnObj);
    }, [dashboardData]);

    async function newDashboard(newName, dashboardData, menuList) {
        console.log("creating new dashboard");
        const testname = newName ? newName : "DASHBOARD";
        const uniqueName = uniqueObjectnName(testname, dashboardData);

        const data = {
            dashBoardName: uniqueName,
            globalStockList: {},
            widgetList: {},
            menuList: menuList,
        };
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        };

        await fetch("/api/dashBoard", options); //posts that data to be saved.
        const newData: any = await dispatch(
            tGetSavedDashboards({ apiKey: apiKey })
        ).unwrap();
        dispatch(rUpdateCurrentDashboard(newData.currentDashBoard));
        dispatch(rSetDashboardData(newData.dashBoardData));
        dispatch(rSetMenuList(menuList));
    }

    async function loadSavedDashboard(widgetName: string) {
        dispatch(rSetTargetDashboard({ targetDashboard: widgetName }));
        dispatch(rUpdateCurrentDashboard(widgetName));
        dispatch(
            rSetTargetSecurity(
                Object.keys(dashboardData[widgetName].globalstocklist)[0]
            )
        );
        await dispatch(
            tGetMongoDB({ dashboard: dashboardData[currentDashboard].id })
        );
        const finnHubPayload: tgetFinnHubDataReq = {
            dashboardID: dashboardData[currentDashboard].id,
            targetDashBoard: currentDashboard,
            widgetList: Object.keys(dashboardData[currentDashboard].widgetlist),
            finnHubQueue: p.finnHubQueue,
            rSetUpdateStatus: rSetUpdateStatus,
            dispatch: dispatch,
        };
        dispatch(tGetFinnhubData(finnHubPayload));
    }

    function handleChange(e) {
        const newName = e.target.value;
        setInputText(newName.trim().toUpperCase());
    }

    function stageNameChange(e) {
        //newName, widgetName
        const dbName = dashBoardData[e.target.id].dashboardname;
        let updateNewNames = { ...newNames };
        updateNewNames[dashBoardData[dbName].dashboardname] = e.target.value;
        setNewNames(updateNewNames);
    }

    function renameDashboard(oldName, newName) {
        // const updateObj = {}
        if (currentDashboard === oldName)
            dispatch(rUpdateCurrentDashboard(newName)); //updateObj['currentDashBoard'] = newName
        const renamed = produce(dashboardData, (draftState: dashBoardData) => {
            draftState[newName] = draftState[oldName];
            draftState[newName].dashboardname = newName;
            delete draftState[oldName];
            return draftState;
        });
        dispatch(rSetDashboardData(renamed)); // updateObj['dashBoardData'] = renamed
    }

    async function postNameChange(e) {
        if (!dashboardData[e.target.value]) {
            const oldName = dashBoardData[e.target.id].dashboardname;
            const newName = e.target.value.toUpperCase();

            const data: any = {
                dbID: dashBoardData[e.target.id].id,
                oldName: oldName,
                newName: newName,
            };

            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            };
            fetch("/api/renameDashboard", options);
            fetch("/api/renameDashboardMongo", options);
            renameDashboard(oldName, newName);
            if (showCurrentDashboard === oldName)
                dispatch(rSetTargetDashboard({ targetDashboard: newName }));
            dispatch(rRenameModelName({ oldName: oldName, newName: newName }));
            //if so, update showdata.targetDashboard, appState.currentDashboard,
            //update dataModel.dataSet.[newname]
        }
    }

    async function copyDashboardFunction(dashboardName) {
        unMountWidgets(); //removes visable data from redux.state.showData
        if (dashboardName !== "" && dashboardName !== undefined) {
            await dispatch(
                tCopyDashboard({
                    copyName: dashboardName,
                    dashboardData: dashboardData,
                    menuList: menuList,
                })
            );
            const data: any = await dispatch(
                tGetSavedDashboards({ apiKey: apiKey })
            ).unwrap();
            dispatch(rUpdateCurrentDashboard(data.currentDashBoard));
            dispatch(rSetDashboardData(data.dashBoardData));
            dispatch(rSetMenuList(data.menuList));
        } else {
            setInputText("Enter Name");
        }
    }

    function unMountWidgets() {
        //removes visable data from redux for dashboard.
        const widdgetKeys = Object.keys(
            dashboardData[currentDashboard].widgetlist
        );
        for (const x in widdgetKeys) {
            const widgetKey = widdgetKeys[x];
            const payload = {
                widgetKey: widgetKey,
            };
            dispatch(rUnmountWidget(payload));
        }
    }

    function unMountDashboard(removeName) {
        const payload = {
            dashboardName: removeName,
        };
        dispatch(rRemoveDashboardDataModel(payload));
    }

    async function deleteDashBoard(dashBoardId, dashboardName) {
        await fetch(`/api/deleteSavedDashboard?dashID=${dashBoardId}`); //delete from postgres

        const deleteKeyList = Object.keys(
            dashboardData[dashboardName]["widgetlist"]
        );
        for (const x in deleteKeyList)
            fetch(`/api/deleteFinnDashData?widgetID=${deleteKeyList[x]}`); //drop data from mongo.

        if (
            dashboardName === currentDashboard &&
            Object.keys(dashBoardData).length > 1
        ) {
            //if shown dashboard is deleted.
            unMountWidgets();
            for (const x in Object.keys(dashBoardData)) {
                const dashboard = dashboardData[Object.keys(dashBoardData)[x]];
                const testDashboardName = dashboard.dashboardname;
                if (testDashboardName !== dashboardName) {
                    //load non-deleted dashboard
                    loadSavedDashboard(testDashboardName);
                    break;
                }
            }
        } else if (
            dashboardName === currentDashboard &&
            Object.keys(dashBoardData).length === 1
        ) {
            unMountWidgets(); //removes widgets from redux visable data model.
            newDashboard("NEW", dashboardData, menuList);
        }
        unMountDashboard(dashboardName); //removes dashboard from redux datamodel.
        const updateState: dashBoardData = produce(
            dashboardData,
            (draftState: dashBoardData) => {
                delete draftState[dashboardName];
            }
        );
        dispatch(rSetDashboardData(updateState));
    }

    let dashBoardData = dashboardData;
    let savedDashBoards = Object.keys({ ...dashBoardData }).map((el) => (
        <tr key={dashBoardData[el].id + "tr"}>
            {p.showEditPane === 1 ? ( //if showing edit pane
                <>
                    <td className="centerTE">
                        <button
                            onClick={() =>
                                deleteDashBoard(
                                    dashBoardData[el].id,
                                    dashBoardData[el].dashboardname
                                )
                            }
                        >
                            <i className="fa fa-times" aria-hidden="true"></i>
                        </button>
                    </td>
                    <td>
                        <input
                            size={18}
                            autoComplete="off"
                            className="btn"
                            type="text"
                            id={el}
                            list="stockSearch1"
                            value={
                                newNames[dashBoardData[el].dashboardname]
                                    ? newNames[dashBoardData[el].dashboardname]
                                    : ""
                            }
                            onChange={stageNameChange}
                            onBlur={postNameChange}
                        />
                    </td>
                </>
            ) : (
                //if not showing edit pane
                <>
                    <td className="centerTE">
                        <input
                            type="radio"
                            key={el + "radio"}
                            checked={
                                currentDashboard ===
                                dashboardData?.[el]?.dashboardname
                            } //
                            onChange={() => {
                                unMountWidgets();
                                loadSavedDashboard(
                                    dashboardData?.[el]?.dashboardname
                                );
                                setInputText(dashBoardData[el].dashboardname);
                            }}
                        />
                    </td>
                    <td key={dashBoardData[el].id + "te"}>
                        {dashBoardData[el].dashboardname}
                    </td>
                </>
            )}

            <td>
                {dashboardStatus?.[dashBoardData[el].dashboardname]
                    ? dashboardStatus?.[dashBoardData[el].dashboardname] +
                      " Open API Calls"
                    : "Ready"}
            </td>
            {p.showEditPane === 1 && (
                <td>
                    <button
                        className="fa fa-check-square-o"
                        aria-hidden="true"
                        type="submit"
                        onClick={() => {
                            copyDashboardFunction(
                                `${dashBoardData[el].dashboardname}`
                            );
                        }}
                    />
                </td>
            )}
        </tr>
    ));

    return (
        <div className="dashBoardMenu" data-testid="dashboardMenu">
            <div>
                <table className="dataTable">
                    <thead>
                        <tr>
                            {p.showEditPane === 1 ? (
                                <>
                                    <td className="centerTE">Remove</td>
                                    <td className="centerTE">Description</td>
                                    <td className="leftTE">Status</td>
                                    <td className="centerTE">Copy</td>
                                </>
                            ) : (
                                <>
                                    <td className="centerTE">Display</td>
                                    <td className="centerTE">Description</td>
                                    <td className="leftTE">Status</td>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {savedDashBoards.length > 0 ? (
                            <>{savedDashBoards}</>
                        ) : (
                            <tr>
                                <td></td>
                                <td>"No previous saves"</td>
                                <td></td>
                            </tr>
                        )}
                        <tr>
                            <td className="centerTE"></td>
                            <td>
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={handleChange}
                                ></input>
                            </td>
                            <td>
                                <input
                                    className="btn"
                                    type="submit"
                                    value="New"
                                    onClick={() => {
                                        newDashboard(
                                            inputText,
                                            dashboardData,
                                            menuList
                                        );
                                        dispatch(
                                            rAddNewDashboard({
                                                dashboardName: inputText,
                                            })
                                        );
                                        dispatch(
                                            rSetTargetDashboard({
                                                targetDashboard: inputText,
                                            })
                                        );
                                    }}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default forwardRef(DashBoardMenu);

export function dashBoardMenuProps(that, key = "DashBoardMenu") {
    const helpText = (
        <>
            Save and manage your widget setups with this menu
            <br />
            Each saved dashboard becomes its own Finndash API endpoint.
            <br />
            Click Endpoints on the top navigation bar to preview your endpoint
            data.
        </>
    );

    let propList = {};
    return propList;
}
