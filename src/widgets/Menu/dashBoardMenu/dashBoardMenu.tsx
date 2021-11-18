import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useAppSelector, useAppDispatch } from '../../../hooks';

import { rebuildDashboardState } from './../../../appFunctions/rebuildDashboardState'
import { LoadSavedDashboard } from './../../../appFunctions/appImport/loadSavedDashboard'
import { NewDashboard, CopyDashboard } from "./../../../appFunctions/appImport/setupDashboard";
import { RemoveDashboardFromState } from "./../../../appFunctions/appImport/widgetLogic";

import { rUnmountWidget } from './../../../slices/sliceShowData'
import { rRemoveDashboardDataModel } from './../../../slices/sliceDataModel'
import { rAddNewDashboard } from "./../../../slices/sliceDataModel";
import { rSetTargetDashboard } from "./../../../slices/sliceShowData";

import { widgetProps } from './../../../components/widgetContainer'

function DashBoardMenu(p: widgetProps, ref: any) {

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

    const apiKey = useSelector((state) => { return state.apiKey })
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })

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
        let keyList = Object.keys(dashboardData)
        for (const x in keyList) returnObj[keyList[x]] = keyList[x]
        setNewNames(returnObj)
    }, [dashboardData])


    function handleChange(e) {
        const newName = e.target.value
        setInputText(newName.trim().toUpperCase())
    }

    function stageNameChange(e) { //newName, widgetName 
        const dbName = dashboardData[e.target.id].dashboardname
        let updateNewNames = { ...newNames }
        updateNewNames[dashboardData[dbName].dashboardname] = e.target.value
        setNewNames(updateNewNames)
    }

    async function postNameChange(e) {
        console.log('rename:', e.target.value, e.target.id)
        if (!dashboardData[e.target.value]) {  //if name doesnt exist
            const data: any = {
                dbID: dashboardData[e.target.id].id,
                oldName: dashboardData[e.target.id].dashboardname,
                newName: e.target.value.toUpperCase()
            }
            console.log(data)
            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            };
            await fetch('/renameDashboard', options)
            await fetch('/renameDashboardMongo', options)

            rebuildDashboardState(dispatch, apiKey)
        }
    }

    async function copyDashboardFunction(dashboardName) {
        unMountWidgets() //removes visable data from redux.state.showData
        if (dashboardName !== '' && dashboardName !== undefined) {
            await CopyDashboard(dashboardName)
            await rebuildDashboardState(dispatch, apiKey)
        } else {
            setInputText('Enter Name')
        }
    }

    function unMountWidgets() { //removes visable data from redux for dashboard.
        const widdgetKeys = Object.keys(dashboardData?.[currentDashboard]?.widgetlist)
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
        console.log('deleting dashboard')
        await fetch(`/deleteSavedDashboard?dashID=${dashBoardId}`) //delete from postgres

        const deleteKeyList = Object.keys(dashboardData[dashboardName]['widgetlist'])
        for (const x in deleteKeyList) fetch(`/deleteFinnDashData?widgetID=${deleteKeyList[x]}`) //drop data from mongo.

        if (dashboardName === currentDashboard && Object.keys(dashboardData).length > 1) { //if shown dashboard is deleted.
            console.log(1)
            unMountWidgets()
            for (const x in Object.keys(dashboardData)) {
                const dashboard = dashboardData[Object.keys(dashboardData)[x]]
                const testDashboardName = dashboard.dashboardname
                if (testDashboardName !== dashboardName) { //load non-deleted dashboard
                    console.log(1.1)
                    LoadSavedDashboard(testDashboardName, p.appState.finnHubQueue);
                    break
                }
            }
        } else if (dashboardName === currentDashboard && Object.keys(dashboardData).length === 1) {
            console.log(2)
            unMountWidgets() //removes widgets from redux visable data model.
            NewDashboard('NEW', dashboardData, p.setAppState.setZIndex)
        }
        unMountDashboard(dashboardName) //removes dashboard from redux datamodel.
        RemoveDashboardFromState(dashboardName) //removes dashboard from App.state
    }

    let savedDashBoards = Object.keys({ ...dashboardData }).map((el) => (
        <tr key={dashboardData[el].id + "tr"}>
            {p.showEditPane === 1 ? //if showing edit pane
                <>
                    <td className="centerTE">
                        <button onClick={() => deleteDashBoard(dashboardData[el].id, dashboardData[el].dashboardname)}>
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
                            value={newNames[dashboardData[el].dashboardname] ? newNames[dashboardData[el].dashboardname] : ''}
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
                            checked={currentDashboard === dashboardData?.[el]?.dashboardname} //
                            onChange={() => {
                                unMountWidgets()
                                LoadSavedDashboard(dashboardData?.[el]?.dashboardname, p.appState.finnHubQueue);
                                setInputText(dashboardData[el].dashboardname)
                            }}
                        />
                    </td>
                    <td key={dashboardData[el].id + "te"}>{dashboardData[el].dashboardname}</td>
                </>
            }

            <td>{dashboardStatus?.[dashboardData[el].dashboardname] ? dashboardStatus?.[dashboardData[el].dashboardname] + ' Open API Calls' : 'Ready'}</td>
            {p.showEditPane === 1 &&
                <td>
                    <button
                        className="fa fa-check-square-o"
                        aria-hidden="true"
                        type="submit"
                        onClick={() => {
                            copyDashboardFunction(`${dashboardData[el].dashboardname}`)
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
                                        NewDashboard(inputText, dashboardData, p.setAppState.setZIndex);
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
        helpText: [helpText, 'DBM'],
    };
    return propList;
}