import * as React from "react"
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { useAppSelector } from '../../../hooks';


function DashBoardMenu(p: { [key: string]: any }, ref: any) {
    const isInitialMount = useRef(true); //update to false after first render.

    const [inputText, setInputText] = useState('Enter Name')
    const [checkMark, setCheckMark] = useState("faIcon");

    const useSelector = useAppSelector

    const dashboardStatus = useSelector((state) => { //REDUX Data associated with this widget.
        if (state.dataModel !== undefined &&
            state.dataModel.created !== 'false') {
            const dashboardStatus: Object = state.dataModel.status
            return (dashboardStatus)
        }
    })

    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
        //add additional slices of state to list if they help reduce re-render time.
        {
            state: {
                inputText: inputText,
                checkMark: checkMark, //REMOVE IF NO TARGET STOCK
            },
        }
    ))

    // useEffect(() => {}, [])
    useEffect(() => {
        if (isInitialMount.current === true && p.currentDashBoard) {
            console.log('dashboard Menu Mounted')
            setInputText(p.currentDashBoard)
        }
    }, [p.currentDashBoard])

    useEffect(() => {
        if (p.currentDashBoard) setInputText(p.currentDashBoard)
    }, [p.currentDashBoard])

    function handleChange(e) {
        const newName = e.target.value
        setInputText(newName.trim().toUpperCase())
    }

    function showCheckMark() {
        setCheckMark("faIconFade")
        setTimeout(() => setCheckMark("faIcon"), 3000);
    }

    async function saveUpdateDashboard(dashboardName) {
        const saveDashboardAs = dashboardName.trim()
        if (saveDashboardAs !== '' && saveDashboardAs !== undefined) {
            let savedDash = await p.saveCurrentDashboard(saveDashboardAs)
            if (savedDash === true) {
                console.log('dashboard Saved')
                let returnedDash = await p.getSavedDashBoards()
                p.updateDashBoards(returnedDash)
            }
        } else { setInputText('Enter Name') }
    }

    async function deleteDashBoard(dashBoardId) {
        await fetch(`/deleteSavedDashboard?dashID=${dashBoardId}`)
        const afterDelete = await p.getSavedDashBoards();
        p.updateDashBoards(afterDelete)
    }


    let dashBoardData = p.dashBoardData;
    let savedDashBoards = Object.keys({ ...dashBoardData }).map((el) => (
        <tr key={dashBoardData[el].id + "tr"}>
            <td className="centerTE">
                <button onClick={() => deleteDashBoard(dashBoardData[el].id)}>
                    <i className="fa fa-times" aria-hidden="true"></i>
                </button>
            </td>
            <td key={dashBoardData[el].id + "te"}>{dashBoardData[el].dashboardname}</td>
            <td>{dashboardStatus?.[dashBoardData[el].dashboardname]}</td>
            <td className="centerTE">
                <button
                    onClick={() => {
                        p.loadSavedDashboard(el, dashBoardData[el].globalstocklist, dashBoardData[el].widgetlist);
                        setInputText(dashBoardData[el].dashboardname)
                    }}
                >
                    <i className="fa fa-check-square-o" aria-hidden="true"></i>
                </button>
            </td>
        </tr>
    ));

    return (
        <div className="dashBoardMenu" data-testid="dashboardMenu" >
            <div>
                <table>
                    <thead>
                        <tr>
                            <td className="centerTE">Remove</td>
                            <td className="centerTE">Description</td>
                            <td className="centerTE">Status</td>
                            <td className="centerTE">Display</td>
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
                                <td></td>
                            </tr>
                        )}
                        <tr>
                            <td className="centerTE">
                                <p className={checkMark}>
                                    <i className="fa fa-check-circle" aria-hidden="true"></i>
                                </p>
                            </td>
                            <td>
                                <input type="text" value={inputText} onChange={handleChange}></input>
                            </td>
                            <td>
                                <input
                                    className="btn"
                                    type="submit"
                                    value={p.currentDashBoard === inputText ? "Update" : " Save "}
                                    // value="submit"
                                    onClick={() => {
                                        saveUpdateDashboard(inputText)
                                        showCheckMark();
                                    }}
                                />
                            </td>
                        </tr>
                        <tr><td></td><td></td><td>
                            <input
                                className="btn"
                                type="submit"
                                value="New"
                                // value="submit"
                                onClick={() => {
                                    p.newDashBoard();
                                }}
                            />
                        </td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default forwardRef(DashBoardMenu);
// export default StockSearchPane;

export function dashBoardMenuProps(that, key = "DashBoardMenu") {
    const helpText = <>
        Save and manage your widget setups with this menu<br />
        Each saved dashboard becomes its own Finndash API endpoint.<br />
        Click Endpoints on the top navigation bar to preview your endpoint data.
    </>

    let propList = {
        getSavedDashBoards: that.props.getSavedDashBoards,
        dashBoardData: that.props.dashBoardData,
        currentDashBoard: that.props.currentDashBoard,
        saveCurrentDashboard: that.props.saveCurrentDashboard,
        newDashBoard: that.props.newDashboard,
        helpText: [helpText, 'DBM'],
        loadSavedDashboard: that.props.loadSavedDashboard,
    };
    return propList;
}
