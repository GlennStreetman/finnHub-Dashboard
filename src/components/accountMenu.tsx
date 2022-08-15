import { AppState } from "src/App";
import { useState, useEffect } from "react";
import { finnHubQueue } from "./../appFunctions/appImport/throttleQueueAPI";
import { useNavigate } from "react-router-dom";
import { rSetApiKey } from "src/slices/sliceAPIKey";
import { rSetApiAlias } from "src/slices/sliceAPIAlias";
import { useAppDispatch, useAppSelector } from "src/hooks";
import { Tooltip } from "@mui/material/";
import { Button } from "@mui/material/";
import TextField from "@mui/material/TextField";
import { Grid, Paper, Box, Typography } from "@mui/material/";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import SaveIcon from "@mui/icons-material/Save";

const MyPaper = styled(Paper)({
    color: "#1d69ab",
    variant: "outlined",
    borderRadius: 20,
    padding: 25,
});

const useSelector = useAppSelector;

interface accountMenuProp {
    finnHubQueue: finnHubQueue;
}

function AccountMenu(p: accountMenuProp) {
    let navigate = useNavigate();
    const dispatch = useAppDispatch(); //allows widget to run redux actions.
    const [password, setPassword] = useState("");
    const [serverMessage, setServerMessage] = useState("");
    const [rateLimit, setRateLimit] = useState("1");

    const [newPassword, setNewPassword] = useState("");
    const [newApiKey, setNewApiKey] = useState("");
    const [newApiAlias, setNewApiAlias] = useState("");
    const [newRateLimit, setNewRateLimit] = useState("");

    const apiKey = useSelector((state) => {
        return state.apiKey;
    });
    const apiAlias = useSelector((state) => {
        return state.apiAlias;
    });

    useEffect(() => {
        getAccountData();
    }, []);

    function getAccountData() {
        fetch("/api/accountData")
            .then((response) => response.json())
            .then((data) => {
                const dataSet = data["userData"];
                const rateLimit =
                    dataSet.ratelimit !== null ? dataSet.ratelimit : 25;

                setRateLimit(rateLimit);
                dispatch(rSetApiAlias(dataSet["apialias"]));
                dispatch(rSetApiKey(dataSet["apikey"]));

                setNewApiKey(dataSet["apikey"]);
                setNewApiAlias(dataSet["apialias"]);
                setNewRateLimit(rateLimit);
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
            console.log("updating apikey");
            dispatch(rSetApiKey(newValue));
        }
        if (changeField === "ratelimit") {
            p.finnHubQueue.updateInterval(newValue);
        }
        fetch("/api/accountData", options)
            .then((response) => response.json())
            .then((data) => {
                getAccountData();
                setServerMessage(data.message);
            });
    }

    function updatePassword() {
        const data = {
            newPassword: newPassword,
        };
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        };
        fetch("/api/newPW", options)
            .then((response) => response.json())
            .then((data) => {
                getAccountData();
                setServerMessage(data.message);
            });
    }

    const messageStyle = {
        textAlign: "center" as const,
    };

    return (
        <Grid container justifyContent="center">
            <Grid item sm={2} md={3} lg={4} xl={4} />
            <Grid item xs={12} sm={8} md={6} lg={4} xl={4}>
                <Box pt={2}>
                    <MyPaper elevation={6}>
                        <Box
                            alignItems="center"
                            display="flex"
                            justifyContent="center"
                        >
                            <Typography variant="h6">
                                Account Management
                            </Typography>
                        </Box>

                        <Box
                            pt={1}
                            alignItems="left"
                            display="flex"
                            justifyContent="left"
                        >
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                }}
                                value={newPassword}
                            />
                            {password !== newPassword ? (
                                <IconButton onClick={() => updatePassword()}>
                                    <SaveIcon />
                                </IconButton>
                            ) : (
                                <></>
                            )}
                        </Box>

                        <Box
                            pt={1}
                            alignItems="left"
                            display="flex"
                            justifyContent="left"
                        >
                            <Tooltip
                                title="Get your API Key at finnhub.io/dashboard"
                                placement="bottom"
                            >
                                <TextField
                                    fullWidth
                                    label="API Key"
                                    onChange={(e) => {
                                        setNewApiKey(e.target.value);
                                    }}
                                    value={newApiKey}
                                />
                            </Tooltip>
                            {newApiKey !== apiKey ? (
                                <IconButton
                                    onClick={() =>
                                        changeAccountData("apikey", newApiKey)
                                    }
                                >
                                    <SaveIcon />
                                </IconButton>
                            ) : (
                                <></>
                            )}
                        </Box>

                        <Box
                            pt={1}
                            alignItems="left"
                            display="flex"
                            justifyContent="left"
                        >
                            <Tooltip
                                title="Alternate GraphQL APIKey"
                                placement="bottom"
                            >
                                <TextField
                                    fullWidth
                                    label="API Alias"
                                    onChange={(e) => {
                                        setNewApiAlias(e.target.value);
                                    }}
                                    value={newApiAlias}
                                />
                            </Tooltip>
                            {newApiAlias !== apiAlias ? (
                                <IconButton
                                    onClick={() =>
                                        changeAccountData(
                                            "apialias",
                                            newApiAlias
                                        )
                                    }
                                >
                                    <SaveIcon />
                                </IconButton>
                            ) : (
                                <></>
                            )}
                        </Box>

                        <Box
                            pt={1}
                            alignItems="left"
                            display="flex"
                            justifyContent="left"
                        >
                            <Tooltip
                                title="Limits the number of API calls per second. Leave at 1 per second unless you have a premium account with finnhub.io"
                                placement="bottom"
                            >
                                <TextField
                                    fullWidth
                                    label="API Calls per second."
                                    onChange={(e) => {
                                        setNewRateLimit(e.target.value);
                                    }}
                                    value={newRateLimit}
                                />
                            </Tooltip>
                            {newRateLimit !== rateLimit ? (
                                <IconButton
                                    onClick={() =>
                                        changeAccountData(
                                            "ratelimit",
                                            newRateLimit
                                        )
                                    }
                                >
                                    <SaveIcon />
                                </IconButton>
                            ) : (
                                <></>
                            )}
                        </Box>

                        <Box
                            pt={1}
                            alignItems="center"
                            display="flex"
                            justifyContent="center"
                        >
                            <Button
                                color="primary"
                                onClick={() => navigate("/exchangeMenu")}
                            >
                                Manage Exchanges
                            </Button>
                            <Button
                                color="primary"
                                onClick={() => navigate("/widgetMenu")}
                            >
                                Manage Widgets
                            </Button>
                        </Box>
                        {serverMessage !== "" && (
                            <div style={messageStyle}>
                                <b>{serverMessage}</b>
                            </div>
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

export default AccountMenu;
