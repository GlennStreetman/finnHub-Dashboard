import produce from 'immer'

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useAppSelector } from '../../../hooks';
import { dashBoardData, menuList } from 'src/App'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

import { useAppDispatch } from './../../../hooks';
import { rUnmountWidget } from './../../../slices/sliceShowData'
import { rRemoveDashboardDataModel, rRenameModelName, rAddNewDashboard } from './../../../slices/sliceDataModel'
import { rSetTargetDashboard, rSetTargetDashboardPayload } from './../../../slices/sliceShowData'
import { tCopyDashboard } from "src/thunks/thunkCopyDashboard";
import { tGetSavedDashboards } from 'src/thunks/thunkGetSavedDashboards'
import { uniqueObjectnName } from 'src/appFunctions/stringFunctions'
import { tGetMongoDB } from 'src/thunks/thunkGetMongoDB'
import { tGetFinnhubData, tgetFinnHubDataReq } from 'src/thunks/thunkFetchFinnhub'
import { rSetUpdateStatus } from 'src/slices/sliceDataModel'

interface props {
    dashBoardData: dashBoardData,
    currentDashBoard: string,
    helpText: string,
    showEditPane: number,
    renameDashboard: Function,
    updateAppState: Function,
    apiKey: string,
    menuList: menuList,
    finnHubQueue: finnHubQueue,
}

function DashBoardMenu(p: props, ref: any) {

    const useDispatch = useAppDispatch
    const dispatch = useDispatch(); //allows widget to run redux actions.

    // const isInitialMount = useRef(true); //update to false after first render.
    const [inputText, setInputText] = useState('Enter Name')
    const [newNames, setNewNames] = useState({})
    const useSelector = useAppSelector

    const dashboardStatus = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false') {
            const dashboardStatus: Object = state.dataModel.status
            return (dashboardStatus)
        }
    })

    const showCurrentDashboard = useSelector((state) => { return state.showData.targetDashboard })

    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
        //add additional slices of state to list if they help reduce re-render time.
        {
            state: {
                inputText: inputText,
                newNames: newNames,
            },
        }
    ))

    useEffect(() => {
        let returnObj = {}
        let keyList = Object.keys(p.dashBoardData)
        for (const x in keyList) returnObj[keyList[x]] = keyList[x]
        setNewNames(returnObj)
    }, [p.dashBoardData])

    async function newDashboard(newName, dashboardData, menuList) {
        console.log('creating new dashboard')
        const testname = newName ? newName : 'DASHBOARD'
        const uniqueName = uniqueObjectnName(testname, dashboardData)

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

        await fetch("/dashBoard", options) //posts that data to be saved.
        const newData: any = await dispatch(tGetSavedDashboards({ apiKey: p.apiKey })).unwrap()
        const payload = {
            dashBoardData: newData.dashBoardData,
            currentDashBoard: newData.currentDashBoard,
            menuList: newData.menuList!,
        }
        p.updateAppState(payload)
    }

    async function loadSavedDashboard(widgetName: string) {
        dispatch(rSetTargetDashboard({ targetDashboard: widgetName }))
        await p.updateAppState({
            currentDashBoard: widgetName,
            targetSecurity: Object.keys(p.dashBoardData[widgetName].globalstocklist)[0],
        })
        await dispatch(tGetMongoDB({ dashboard: p.dashBoardData[p.currentDashBoard].id }))
        const finnHubPayload: tgetFinnHubDataReq = {
            dashboardID: p.dashBoardData[p.currentDashBoard].id,
            targetDashBoard: p.currentDashBoard,
            widgetList: Object.keys(p.dashBoardData[p.currentDashBoard].widgetlist),
            finnHubQueue: p.finnHubQueue,
            rSetUpdateStatus: rSetUpdateStatus,
        }
        dispatch(tGetFinnhubData(finnHubPayload))
    }

    function handleChange(e) {
        const newName = e.target.value
        setInputText(newName.trim().toUpperCase())
    }

    function stageNameChange(e) { //newName, widgetName 
        const dbName = dashBoardData[e.target.id].dashboardname
        let updateNewNames = { ...newNames }
        updateNewNames[dashBoardData[dbName].dashboardname] = e.target.value
        setNewNames(updateNewNames)
    }

    async function postNameChange(e) {

        if (!p.dashBoardData[e.target.value]) {
            const oldName = dashBoardData[e.target.id].dashboardname
            const newName = e.target.value.toUpperCase()

            const data: any = {
                dbID: dashBoardData[e.target.id].id,
                oldName: oldName,
                newName: newName
            }

            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            };
            fetch('/renameDashboard', options)
            fetch('/renameDashboardMongo', options)
            p.renameDashboard(oldName, newName)
            if (showCurrentDashboard === oldName) dispatch(rSetTargetDashboard({ targetDashboard: newName }))
            dispatch(rRenameModelName({ oldName: oldName, newName: newName }))
            //if so, update showdata.targetDashboard, appState.currentDashboard, 
            //update dataModel.dataSet.[newname]
        }
    }

    async function copyDashboardFunction(dashboardName) {
        unMountWidgets() //removes visable data from redux.state.showData
        if (dashboardName !== '' && dashboardName !== undefined) {
            await dispatch(tCopyDashboard({ copyName: dashboardName, dashboardData: p.dashBoardData, menuList: p.menuList }))
            const data: any = await dispatch(tGetSavedDashboards({ apiKey: p.apiKey })).unwrap()
            const payload = {
                dashBoardData: data.dashBoardData,
                currentDashBoard: data.currentDashBoard,
                menuList: data.menuList!,
            }
            p.updateAppState(payload)
        } else {
            setInputText('Enter Name')
        }
    }

    function unMountWidgets() { //removes visable data from redux for dashboard.
        const widdgetKeys = Object.keys(p.dashBoardData?.[p.currentDashBoard]?.widgetlist)
        for (const x in widdgetKeys) {
            const widgetKey = widdgetKeys[x]
            const payload = {
                widgetKey: widgetKey,
            }
            dispatch(rUnmountWidget(payload))
        }
    }

    function unMountDashboard(removeName) {
        const payload = {
            dashboardName: removeName,
        }
        dispatch(rRemoveDashboardDataModel(payload))
    }

    async function deleteDashBoard(dashBoardId, dashboardName) {
        await fetch(`/deleteSavedDashboard?dashID=${dashBoardId}`) //delete from postgres

        const deleteKeyList = Object.keys(p.dashBoardData[dashboardName]['widgetlist'])
        for (const x in deleteKeyList) fetch(`/deleteFinnDashData?widgetID=${deleteKeyList[x]}`) //drop data from mongo.

        if (dashboardName === p.currentDashBoard && Object.keys(dashBoardData).length > 1) { //if shown dashboard is deleted.
            unMountWidgets()
            for (const x in Object.keys(dashBoardData)) {
                const dashboard = p.dashBoardData[Object.keys(dashBoardData)[x]]
                const testDashboardName = dashboard.dashboardname
                if (testDashboardName !== dashboardName) { //load non-deleted dashboard
                    loadSavedDashboard(testDashboardName);
                    break
                }
            }
        } else if (dashboardName === p.currentDashBoard && Object.keys(dashBoardData).length === 1) {
            unMountWidgets() //removes widgets from redux visable data model.
            newDashboard('NEW', p.dashBoardData, p.menuList)
        }
        unMountDashboard(dashboardName) //removes dashboard from redux datamodel.
        const updateState: dashBoardData = produce(p.dashBoardData, (draftState: dashBoardData) => {
            delete draftState[dashboardName]
        })
        p.updateAppState({ dashBoardData: updateState })
    }

    let dashBoardData = p.dashBoardData;
    let savedDashBoards = Object.keys({ ...dashBoardData }).map((el) => (
        <tr key={dashBoardData[el].id + "tr"}>
            {p.showEditPane === 1 ? //if showing edit pane
                <>
                    <td className="centerTE">
                        <button onClick={() => deleteDashBoard(dashBoardData[el].id, dashBoardData[el].dashboardname)}>
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
                            value={newNames[dashBoardData[el].dashboardname] ? newNames[dashBoardData[el].dashboardname] : ''}
                            onChange={stageNameChange}
                            onBlur={postNameChange}
                        />
                    </td>
                </>
                : //if not showing edit pane
                <>
                    <td className="centerTE">
                        <input
                            type='radio'
                            key={el + 'radio'}
                            checked={p.currentDashBoard === p.dashBoardData?.[el]?.dashboardname} //
                            onChange={() => {
                                unMountWidgets()
                                loadSavedDashboard(p.dashBoardData?.[el]?.dashboardname);
                                setInputText(dashBoardData[el].dashboardname)
                            }}
                        />
                    </td>
                    <td key={dashBoardData[el].id + "te"}>{dashBoardData[el].dashboardname}</td>
                </>
            }

            <td>{dashboardStatus?.[dashBoardData[el].dashboardname] ? dashboardStatus?.[dashBoardData[el].dashboardname] + ' Open API Calls' : 'Ready'}</td>
            {p.showEditPane === 1 &&
                <td>
                    <button
                        className="fa fa-check-square-o"
                        aria-hidden="true"
                        type="submit"
                        onClick={() => {
                            copyDashboardFunction(`${dashBoardData[el].dashboardname}`)
                        }}
                    />
                </td>}
        </tr>
    ));

    return (
        <div className="dashBoardMenu" data-testid="dashboardMenu" >
            <div>
                <table className='dataTable'>
                    <thead>
                        <tr>
                            {p.showEditPane === 1 ?
                                <>
                                    <td className="centerTE">Remove</td>
                                    <td className="centerTE">Description</td>
                                    <td className="leftTE">Status</td>
                                    <td className="centerTE">Copy</td>
                                </> :
                                <>
                                    <td className="centerTE">Display</td>
                                    <td className="centerTE">Description</td>
                                    <td className="leftTE">Status</td>
                                </>
                            }

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
                            <td className="centerTE">

                            </td>
                            <td>
                                <input type="text" value={inputText} onChange={handleChange}></input>
                            </td>
                            <td>
                                <input
                                    className="btn"
                                    type="submit"
                                    value="New"
                                    onClick={() => {
                                        newDashboard(inputText, p.dashBoardData, p.menuList);
                                        dispatch(rAddNewDashboard({ dashboardName: inputText }))
                                        dispatch(rSetTargetDashboard({ targetDashboard: inputText }))
                                    }}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div >
    );
}

export default forwardRef(DashBoardMenu);

export function dashBoardMenuProps(that, key = "DashBoardMenu") {
    const helpText = <>
        Save and manage your widget setups with this menu<br />
        Each saved dashboard becomes its own Finndash API endpoint.<br />
        Click Endpoints on the top navigation bar to preview your endpoint data.
    </>

    let propList = {
        dashBoardData: that.props.dashBoardData,
        currentDashBoard: that.props.currentDashBoard,
        helpText: [helpText, 'DBM'],
        renameDashboard: that.props.renameDashboard,
        menuList: that.props.menuList,
        updateAppState: that.props.updateAppState,
        apiKey: that.props.apiKey,
        finnHubQueue: that.props.finnHubQueue,
    };
    return propList;
}
