import { AppState } from 'src/App'
import { useState, useEffect } from 'react';
import { finnHubQueue } from "./../appFunctions/appImport/throttleQueueAPI";
import { useNavigate } from "react-router-dom";
import { rSetApiKey } from 'src/slices/sliceAPIKey'
import { rSetApiAlias } from 'src/slices/sliceAPIAlias'
import { useAppDispatch, useAppSelector } from 'src/hooks';

const useSelector = useAppSelector

interface accountMenuProp {
    finnHubQueue: finnHubQueue,

}

function AccountMenu(p: accountMenuProp) {
    let navigate = useNavigate();
    const dispatch = useAppDispatch(); //allows widget to run redux actions.

    const [loginName, setLoginName] = useState("")
    const [email, setEmail] = useState("")
    const [editToggle, setEditToggle] = useState(0)
    const [editField, setEditField] = useState("")
    const [inputText, setInputText] = useState("")
    const [serverMessage, setServerMessage] = useState("")
    const [rateLimit, setRateLimit] = useState(0)
    // const [widgetSetup, setWidgetSetup] = useState(null)

    const apiKey = useSelector((state) => { return state.apiKey })
    const apiAlias = useSelector((state) => { return state.apiAlias })
    const exchangeList = useSelector((state) => { return state.exchangeList.exchangeList })

    useEffect(() => {
        getAccountData();
    })


    function handleChange(e: any) {
        setInputText(e.target.value)
    }

    function getAccountData() {
        fetch(`/accountData`)
            .then((response) => response.json())
            .then((data) => {
                const dataSet = data["userData"];
                const rateLimit = dataSet.ratelimit !== null ? dataSet.ratelimit : 25
                // const widgetSetup = JSON.parse(dataSet['widgetsetup'])

                setLoginName(dataSet["loginname"])
                setEmail(dataSet["email"])
                setRateLimit(rateLimit)
                // setWidgetSetup(widgetSetup)

                dispatch(rSetApiAlias(dataSet["apialias"]))
                dispatch(rSetApiKey(dataSet["apikey"]))
            })
            .catch((error) => {
                console.error("Failed to retrieve user data" + error);
            });
    }

    function changeAccountData(changeField: string, newValue: string) {
        const data = {
            field: changeField,
            newValue: newValue,
        };
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        };
        if (changeField === "apikey") {
            console.log('updating apikey')
            dispatch(rSetApiKey(newValue))
        }
        if (changeField === 'ratelimit') {
            p.finnHubQueue.updateInterval(newValue)
        }
        fetch("/accountData", options)
            .then((response) => response.json())
            .then((data) => {
                getAccountData();
                setEditToggle(0)
                setInputText("")
                setServerMessage(data.message)
            });
    }

    function showEditPane(targetField: string) {
        setEditField(targetField)
        setEditToggle(1)
        setServerMessage("")
    }

    const divOutline = {
        border: '5px solid',
        borderRadius: '10px',
        backgroundColor: 'white',
        padding: '5px',
        borderColor: '#1d69ab',
    }
    const messageStyle = {
        'textAlign': 'center' as const
    }

    return (
        <>
            {editToggle === 0 && (
                <div style={divOutline}>
                    <b>Account Data:</b>
                    <table>
                        <tbody>
                            <tr>
                                <td>Login:</td>
                                <td>{loginName}</td>
                                <td>
                                    <button onClick={() => showEditPane("loginname")}>edit</button>
                                </td>
                            </tr>
                            <tr>
                                <td>Email:</td>
                                <td>{email}</td>
                                <td>
                                    <button onClick={() => showEditPane("email")}>edit</button>
                                </td>
                            </tr>
                            <tr>
                                <td>apiKey:</td>
                                <td>{apiKey}</td>
                                <td>
                                    <button onClick={() => showEditPane("apikey")}>edit</button>
                                </td>
                            </tr>
                            <tr>
                                <td>Active Exchanges: </td>
                                <td>{exchangeList.toString()}</td>
                                <td>
                                    <button onClick={() => navigate('/exchangeMenu')}>edit</button>
                                </td>
                            </tr>
                            <tr>
                                <td>API Rate Limit: </td>
                                <td>{rateLimit}</td>
                                <td>
                                    <button onClick={() => showEditPane("ratelimit")}>edit</button>
                                </td>
                            </tr>
                            <tr>
                                <td>API Alias: </td>
                                <td>{apiAlias}</td>
                                <td>
                                    <button onClick={() => showEditPane("apialias")}>edit</button>
                                </td>
                            </tr>
                            <tr>
                                <td>Manage Widgets: </td>
                                <td></td>
                                <td>
                                    <button onClick={() => navigate('/widgetMenu')}>edit</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {serverMessage !== "" && (
                        <div style={messageStyle}><b >{serverMessage}</b></div>
                    )}
                </div>
            )}
            {editToggle === 1 && (
                <table>
                    <tbody>
                        <tr>
                            <td>{editField}</td>
                        </tr>
                        <tr>
                            <td>{"New " + editField + ":"}</td>
                            <td>
                                <input type="text" value={inputText} onChange={handleChange}></input>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <button value="Submit" onClick={() => setEditToggle(0)}>
                                    Cancel
                                </button>
                            </td>
                            <td>
                                <button value="Submit" onClick={() => changeAccountData(editField, inputText)}>
                                    Submit
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
        </>
    );
}

export function accountMenuProps(that: AppState) {
    let propList = {
        finnHubQueue: that.finnHubQueue,
    };
    return propList;
}

export default AccountMenu
