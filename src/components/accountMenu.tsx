import { AppState } from 'src/App'
import { useState, useEffect } from 'react';
import { finnHubQueue } from "./../appFunctions/appImport/throttleQueueAPI";
import { useNavigate } from "react-router-dom";
import { rSetApiKey } from 'src/slices/sliceAPIKey'
import { rSetApiAlias } from 'src/slices/sliceAPIAlias'
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { Tooltip } from '@material-ui/core/';
import { Button } from '@material-ui/core/';

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

    const divRoot = {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '10px',
    }

    const divOutline = {
        border: '5px solid',
        borderRadius: '10px',
        backgroundColor: 'white',
        padding: '5px',
        borderColor: '#1d69ab',
        maxWidth: '400px'
    }
    const messageStyle = {
        'textAlign': 'center' as const
    }

    return (
        <>
            {editToggle === 0 && (<>
                <div style={divRoot}>
                    <div style={divOutline}>
                        <b>User: {loginName}</b>
                        <table>
                            <tbody>

                                <tr>
                                    <td>Email:</td>
                                    <td>{email}</td>
                                    <td>
                                        <Button variant="outlined" onClick={() => showEditPane("email")}>edit</Button>
                                    </td>
                                </tr>
                                <tr>
                                    <Tooltip title="Get your API Key at finnhub.io/dashboard" placement="bottom">
                                        <td>apiKey:</td>
                                    </Tooltip>
                                    <Tooltip title="Get your API Key at finnhub.io/dashboard" placement="bottom">
                                        <td>{apiKey}</td>
                                    </Tooltip>
                                    <Tooltip title="Get your API Key at finnhub.io/dashboard" placement="bottom">
                                        <td>
                                            <Button variant="outlined" onClick={() => showEditPane("apikey")}>edit</Button>
                                        </td>
                                    </Tooltip>
                                </tr>
                                <tr>
                                    <Tooltip title="Alternate GraphQL APIKey" placement="bottom">
                                        <td>API Alias: </td>
                                    </Tooltip>
                                    <Tooltip title="Alternate GraphQL APIKey" placement="bottom">
                                        <td>{apiAlias}</td>
                                    </Tooltip>
                                    <Tooltip title="Alternate GraphQL APIKey" placement="bottom">
                                        <td>
                                            <Button variant="outlined" onClick={() => showEditPane("apialias")}>edit</Button>
                                        </td>
                                    </Tooltip>
                                </tr>
                                <tr>
                                    <Tooltip title="Limits the number of API calls per second. Leave at 1 per second unless you have a premium account with finnhub.io" placement="bottom">
                                        <td>API Rate Limit: </td>
                                    </Tooltip>
                                    <Tooltip title="Limits the number of API calls per second. Leave at 1 per second unless you have a premium account with finnhub.io" placement="bottom">
                                        <td>{rateLimit} per second</td>
                                    </Tooltip>
                                    <Tooltip title="Limits the number of API calls per second. Leave at 1 per second unless you have a premium account with finnhub.io" placement="bottom">
                                        <td>
                                            <Button variant="outlined" onClick={() => showEditPane("ratelimit")}>edit</Button>
                                        </td>
                                    </Tooltip>
                                </tr>
                            </tbody>
                        </table>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '5px'
                        }}>
                            <Button variant="outlined" onClick={() => navigate('/exchangeMenu')}>Manage Exchanges</Button>
                            <Button variant="outlined" onClick={() => navigate('/widgetMenu')}>Manage Widgets</Button>
                        </div>
                        {serverMessage !== "" && (
                            <div style={messageStyle}><b >{serverMessage}</b></div>
                        )}
                    </div></div>
            </>
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
