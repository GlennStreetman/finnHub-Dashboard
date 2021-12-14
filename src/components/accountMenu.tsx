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
import { Grid, Paper, Box, Typography } from '@material-ui/core/';
import { styled } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';

const MyPaper = styled(Paper)({ color: "#1d69ab", variant: "outlined", borderRadius: 20, padding: 25 });

const useSelector = useAppSelector

interface accountMenuProp {
    finnHubQueue: finnHubQueue,

}

function AccountMenu(p: accountMenuProp) {

    let navigate = useNavigate();
    const dispatch = useAppDispatch(); //allows widget to run redux actions.
    const [email, setEmail] = useState("")
    const [serverMessage, setServerMessage] = useState("")
    const [rateLimit, setRateLimit] = useState('1')

    const [newEmail, setNewEmail] = useState("")
    const [newApiKey, setNewApiKey] = useState("")
    const [newApiAlias, setNewApiAlias] = useState("")
    const [newRateLimit, setNewRateLimit] = useState("")


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
                setNewEmail(dataSet["email"])
                setNewApiKey(dataSet["apikey"])
                setNewApiAlias(dataSet["apialias"])
                setNewRateLimit(rateLimit)
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
                setServerMessage(data.message)
            });
    }

    const messageStyle = {
        'textAlign': 'center' as const
    }

    return (
        <Grid container justifyContent="center">
            <Grid item sm={2} md={3} lg={4} xl={4} />
            <Grid item xs={12} sm={8} md={6} lg={4} xl={4} >
                <Box pt={2}>
                    <MyPaper elevation={6}>
                        <Box alignItems='center' display='flex' justifyContent='center'><Typography variant="h6">Account Management</Typography></Box>

                        <Box pt={1} alignItems='left' display='flex' justifyContent='left'>
                            <TextField fullWidth label='Email' onChange={(e) => { setNewEmail(e.target.value) }} value={newEmail} />
                            {newEmail !== email ?
                                <IconButton onClick={() => changeAccountData("email", newEmail)}><SaveIcon /></IconButton> :
                                <></>
                            }
                        </Box>

                        <Box pt={1} alignItems='left' display='flex' justifyContent='left'>
                            <Tooltip title="Get your API Key at finnhub.io/dashboard" placement="bottom">
                                <TextField fullWidth label='API Key' onChange={(e) => { setNewApiKey(e.target.value) }} value={newApiKey} />
                            </Tooltip>
                            {newApiKey !== apiKey ?
                                <IconButton onClick={() => changeAccountData("apikey", newApiKey)}><SaveIcon /></IconButton> :
                                <></>
                            }
                        </Box>

                        <Box pt={1} alignItems='left' display='flex' justifyContent='left'>
                            <Tooltip title="Alternate GraphQL APIKey" placement="bottom">
                                <TextField fullWidth label='API Alias' onChange={(e) => { setNewApiAlias(e.target.value) }} value={newApiAlias} />
                            </Tooltip>
                            {newApiAlias !== apiAlias ?
                                <IconButton onClick={() => changeAccountData("apialias", newApiAlias)}><SaveIcon /></IconButton> :
                                <></>
                            }
                        </Box>

                        <Box pt={1} alignItems='left' display='flex' justifyContent='left'>
                            <Tooltip title="Limits the number of API calls per second. Leave at 1 per second unless you have a premium account with finnhub.io" placement="bottom">
                                <TextField fullWidth label="API Calls per second." onChange={(e) => { setNewRateLimit(e.target.value) }} value={newRateLimit} />
                            </Tooltip>
                            {newRateLimit !== rateLimit ?
                                <IconButton onClick={() => changeAccountData("ratelimit", newRateLimit)}>
                                    <SaveIcon />
                                </IconButton> :
                                <></>
                            }
                        </Box>

                        <Box pt={1} alignItems='center' display='flex' justifyContent='center'>
                            <Button color="primary" onClick={() => navigate('/exchangeMenu')}>Manage Exchanges</Button>
                            <Button color="primary" onClick={() => navigate('/widgetMenu')}>Manage Widgets</Button>
                        </Box>
                        {serverMessage !== "" && (
                            <div style={messageStyle}><b >{serverMessage}</b></div>
                        )}
                    </MyPaper>
                </Box>
            </Grid>
            <Grid item sm={2} md={3} lg={4} xl={4} />
        </Grid>

    );
}

export function accountMenuProps(that: AppState) {
    let propList = {
        finnHubQueue: that.finnHubQueue,
    };
    return propList;
}

export default AccountMenu
