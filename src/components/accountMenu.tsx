import { AppState } from 'src/App'
import { useState, useEffect } from 'react';
import { finnHubQueue } from "./../appFunctions/appImport/throttleQueueAPI";
import { useNavigate } from "react-router-dom";
import { rSetApiKey } from 'src/slices/sliceAPIKey'
import { rSetApiAlias } from 'src/slices/sliceAPIAlias'
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { Tooltip } from '@material-ui/core/';
import { Button } from '@material-ui/core/';
import TextField from '@material-ui/core/TextField';

const useSelector = useAppSelector

interface accountMenuProp {
    finnHubQueue: finnHubQueue,

}

function AccountMenu(p: accountMenuProp) {

    let navigate = useNavigate();
    const dispatch = useAppDispatch(); //allows widget to run redux actions.

    const [loginName, setLoginName] = useState("")
    const [email, setEmail] = useState("")
    const [editField, setEditField] = useState("") //email, apiKey, apiAlias, apiRateLimit
    const [editText, setEditText] = useState<string | number>("")
    const [serverMessage, setServerMessage] = useState("")
    const [rateLimit, setRateLimit] = useState(0)

    const apiKey = useSelector((state) => { return state.apiKey })
    const apiAlias = useSelector((state) => { return state.apiAlias })

    useEffect(() => {
        getAccountData();
    }, [])

    function getAccountData() {
        fetch(`/accountData`)
            .then((response) => response.json())
            .then((data) => {
                const dataSet = data["userData"];
                const rateLimit = dataSet.ratelimit !== null ? dataSet.ratelimit : 25
                setLoginName(dataSet["loginname"])
                setEmail(dataSet["email"])
                setRateLimit(rateLimit)
                dispatch(rSetApiAlias(dataSet["apialias"]))
                dispatch(rSetApiKey(dataSet["apikey"]))
            })
            .catch((error) => {
                console.error("Failed to retrieve user data" + error);
            });
    }

    function changeAccountData(changeField: string, newValue: string | number) {
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
                setEditField("")
                setEditText("")
                setServerMessage(data.message)
            });
    }

    function showEditPane(targetField: string, text: string | number) {
        setEditField(targetField)
        setEditText(text)
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
            <div style={divRoot}>
                <div style={divOutline}>
                    <b>User: {loginName}</b>
                    <table>
                        <tbody>
                            <tr>
                                <td>Email:</td>
                                {editField === 'email' ? <TextField onChange={(e) => { setEditText(e.target.value) }} defaultValue={editText}>{editText}</TextField> : <td>{email}</td>}
                                <td>
                                    {editField === 'email' ?
                                        <Button variant="outlined" onClick={() => changeAccountData("email", editText)}>save</Button> :
                                        <Button variant="outlined" onClick={() => showEditPane("email", email)}>edit</Button>
                                    }
                                </td>
                            </tr>
                            <tr>
                                <Tooltip title="Get your API Key at finnhub.io/dashboard" placement="bottom">
                                    <td>apiKey:</td>
                                </Tooltip>
                                {editField === 'apiKey' ? <TextField onChange={(e) => { setEditText(e.target.value) }} defaultValue={editText}>{editText}</TextField> :
                                    <Tooltip title="Get your API Key at finnhub.io/dashboard" placement="bottom">
                                        <td>{apiKey}</td>
                                    </Tooltip>
                                }
                                {editField === 'apiKey' ?
                                    <td><Button variant="outlined" onClick={() => changeAccountData("apikey", editText)}>save</Button></td> :
                                    <Tooltip title="Get your API Key at finnhub.io/dashboard" placement="bottom">
                                        <td>
                                            <Button variant="outlined" onClick={() => showEditPane("apiKey", apiKey)}>edit</Button>
                                        </td>
                                    </Tooltip>
                                }
                            </tr>
                            <tr>
                                <Tooltip title="Alternate GraphQL APIKey" placement="bottom">
                                    <td>API Alias: </td>
                                </Tooltip>

                                {editField === 'apiAlias' ? <TextField onChange={(e) => { setEditText(e.target.value) }} defaultValue={editText}>{editText}</TextField> :
                                    <Tooltip title="Alternate GraphQL APIKey" placement="bottom">
                                        <td>{apiAlias}</td>
                                    </Tooltip>
                                }

                                {editField === 'apiAlias' ?
                                    <td><Button variant="outlined" onClick={() => changeAccountData("apialias", editText)}>save</Button></td> :
                                    <Tooltip title="Alternate GraphQL APIKey" placement="bottom">
                                        <td>
                                            <Button variant="outlined" onClick={() => showEditPane("apiAlias", apiAlias)}>edit</Button>
                                        </td>
                                    </Tooltip>
                                }
                            </tr>
                            <tr>
                                <Tooltip title="Limits the number of API calls per second. Leave at 1 per second unless you have a premium account with finnhub.io" placement="bottom">
                                    <td>API Rate Limit: </td>
                                </Tooltip>

                                {editField === 'rateLimit' ? <TextField onChange={(e) => { setEditText(e.target.value) }} defaultValue={editText}>{editText}</TextField> :
                                    <Tooltip title="Limits the number of API calls per second. Leave at 1 per second unless you have a premium account with finnhub.io" placement="bottom">
                                        <td>{rateLimit} per second</td>
                                    </Tooltip>
                                }

                                {editField === 'rateLimit' ?
                                    <td><Button variant="outlined" onClick={() => changeAccountData("ratelimit", editText)}>save</Button></td> :
                                    <Tooltip title="Limits the number of API calls per second. Leave at 1 per second unless you have a premium account with finnhub.io" placement="bottom">
                                        <td>
                                            <Button variant="outlined" onClick={() => showEditPane("rateLimit", rateLimit)}>edit</Button>
                                        </td>
                                    </Tooltip>
                                }
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
    );
}

export function accountMenuProps(that: AppState) {
    let propList = {
        finnHubQueue: that.finnHubQueue,
    };
    return propList;
}

export default AccountMenu
