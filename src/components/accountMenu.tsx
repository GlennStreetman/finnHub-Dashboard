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

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import { Grid, Paper, Box, Typography } from '@material-ui/core/';
import { styled } from '@material-ui/core/styles';

const MyPaper = styled(Paper)({ color: "#1d69ab", variant: "outlined", borderRadius: 20, padding: 25 });

const useSelector = useAppSelector

interface accountMenuProp {
    finnHubQueue: finnHubQueue,

}

function AccountMenu(p: accountMenuProp) {

    let navigate = useNavigate();
    const dispatch = useAppDispatch(); //allows widget to run redux actions.
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

    const messageStyle = {
        'textAlign': 'center' as const
    }

    return (
        <>
            {/* <div style={divRoot}> */}
            <Grid container justifyContent="center">
                <Grid item sm={2} md={3} lg={4} xl={4} />
                <Grid item xs={12} sm={8} md={6} lg={4} xl={4} >
                    <Box pt={2}>
                        <MyPaper elevation={6}>
                            <Box component="span"><Typography>Manage Account</Typography></Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Email:</TableCell>
                                            {editField === 'email' ? <TextField onChange={(e) => { setEditText(e.target.value) }} defaultValue={editText}>{editText}</TextField> : <td>{email}</td>}
                                            <TableCell>
                                                {editField === 'email' ?
                                                    <Button variant="outlined" onClick={() => changeAccountData("email", editText)}>save</Button> :
                                                    <Button variant="outlined" onClick={() => showEditPane("email", email)}>edit</Button>
                                                }
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <Tooltip title="Get your API Key at finnhub.io/dashboard" placement="bottom">
                                                <TableCell>apiKey:</TableCell>
                                            </Tooltip>
                                            {editField === 'apiKey' ? <TextField onChange={(e) => { setEditText(e.target.value) }} defaultValue={editText}>{editText}</TextField> :
                                                <Tooltip title="Get your API Key at finnhub.io/dashboard" placement="bottom">
                                                    <TableCell>{apiKey}</TableCell>
                                                </Tooltip>
                                            }
                                            {editField === 'apiKey' ?
                                                <TableCell><Button variant="outlined" onClick={() => changeAccountData("apikey", editText)}>save</Button></TableCell> :
                                                <Tooltip title="Get your API Key at finnhub.io/dashboard" placement="bottom">
                                                    <TableCell>
                                                        <Button variant="outlined" onClick={() => showEditPane("apiKey", apiKey)}>edit</Button>
                                                    </TableCell>
                                                </Tooltip>
                                            }
                                        </TableRow>
                                        <TableRow>
                                            <Tooltip title="Alternate GraphQL APIKey" placement="bottom">
                                                <TableCell>API Alias: </TableCell>
                                            </Tooltip>
                                            {editField === 'apiAlias' ? <TextField onChange={(e) => { setEditText(e.target.value) }} defaultValue={editText}>{editText}</TextField> :
                                                <Tooltip title="Alternate GraphQL APIKey" placement="bottom">
                                                    <TableCell>{apiAlias}</TableCell>
                                                </Tooltip>
                                            }
                                            {editField === 'apiAlias' ?
                                                <TableCell><Button variant="outlined" onClick={() => changeAccountData("apialias", editText)}>save</Button></TableCell> :
                                                <Tooltip title="Alternate GraphQL APIKey" placement="bottom">
                                                    <TableCell>
                                                        <Button variant="outlined" onClick={() => showEditPane("apiAlias", apiAlias)}>edit</Button>
                                                    </TableCell>
                                                </Tooltip>
                                            }
                                        </TableRow>
                                        <TableRow>
                                            <Tooltip title="Limits the number of API calls per second. Leave at 1 per second unless you have a premium account with finnhub.io" placement="bottom">
                                                <TableCell>API Rate Limit: </TableCell>
                                            </Tooltip>
                                            {editField === 'rateLimit' ? <TextField onChange={(e) => { setEditText(e.target.value) }} defaultValue={editText}>{editText}</TextField> :
                                                <Tooltip title="Limits the number of API calls per second. Leave at 1 per second unless you have a premium account with finnhub.io" placement="bottom">
                                                    <TableCell>{rateLimit} per second</TableCell>
                                                </Tooltip>
                                            }
                                            {editField === 'rateLimit' ?
                                                <TableCell><Button variant="outlined" onClick={() => changeAccountData("ratelimit", editText)}>save</Button></TableCell> :
                                                <Tooltip title="Limits the number of API calls per second. Leave at 1 per second unless you have a premium account with finnhub.io" placement="bottom">
                                                    <TableCell>
                                                        <Button variant="outlined" onClick={() => showEditPane("rateLimit", rateLimit)}>edit</Button>
                                                    </TableCell>
                                                </Tooltip>
                                            }
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
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
                        </MyPaper>
                    </Box>
                </Grid>
                <Grid item sm={2} md={3} lg={4} xl={4} />
            </Grid>
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
