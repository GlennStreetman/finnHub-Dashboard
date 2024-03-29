import { useState, useEffect, useMemo } from "react";

import { useAppDispatch } from "src/hooks";
import { widgetSetup } from "src/App";
import { styled } from "@mui/material/styles";
import { Grid, Paper, Button, TextField, Box, Typography } from "@mui/material/";
import queryString from "query-string";

import { finnHubQueue } from "./../appFunctions/appImport/throttleQueueAPI";
import { checkPassword } from "../appFunctions/client/checkPassword";
import { tProcessLogin } from "src/thunks/thunkProcessLogin";
import { useNavigate } from "react-router-dom";

interface loginProps {
    queryData: any;
    updateAppState: Object;
    finnHubQueue: finnHubQueue;
}

const useDispatch = useAppDispatch;
const MyPaper = styled(Paper)({ color: "#1d69ab", variant: "outlined", borderRadius: 20, padding: 25 });

export default function Login(p: loginProps) {
    let navigate = useNavigate();
    const dispatch = useDispatch(); //allows widget to run redux actions.
    const [message, setMessage] = useState(""); //message from server
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");

    const quaryData = queryString.parse(window.location.search);

    useEffect(() => {
        // @ts-ignore
        if (quaryData.message) setMessage(quaryData.message);
    }, []);

    function checkLoginCredentials(e) {
        e.preventDefault();
        checkPassword(emailAddress, password)
            .then(async (data) => {
                console.log("data", data);
                if (data.status === 200) {
                    const parseSetup: widgetSetup = JSON.parse(data.widgetsetup); //ex string
                    const newList: string[] = data.exchangelist.split(",");
                    await dispatch(
                        tProcessLogin({
                            defaultexchange: data.defaultexchange,
                            apiKey: data.key,
                            apiAlias: data.apiAlias,
                            exchangelist: newList,
                        })
                    );
                    console.log("process login complete");
                    p.updateAppState["login"](1);
                    p.updateAppState["navigate"]("/dashboard");
                    p.updateAppState["widgetSetup"](parseSetup);
                    p.finnHubQueue.updateInterval(data["ratelimit"]);
                } else {
                    console.log("not awaiting");
                    setMessage(data.message);
                }
            })
            .catch((err) => {
                console.log("problem", err);
                setMessage("No response from server. Check network connection.");
            });
    }

    function handeEmailChange(e) {
        setEmailAddress(e.target.value);
    }

    function handlePasswordChange(e) {
        setPassword(e.target.value);
    }

    return (
        <>
            <Grid container>
                <Grid item xs={1} sm={2} md={4} lg={4} xl={4} />
                {/*// @ts-ignore*/}
                <Grid item xs={10} sm={8} md={4} lg={4} xl={4} align="center">
                    <Box pt={2}>
                        <MyPaper elevation={6}>
                            <img src="logo.png" alt="logo"></img>

                            <div className="login-div">
                                <TextField id={"loginEmail"} type="text" label="email" name={"emailField"} value={emailAddress} onChange={handeEmailChange} />
                                <TextField
                                    id={"loginPassword"}
                                    type="password"
                                    label="password"
                                    name="passwordText"
                                    value={password}
                                    onChange={handlePasswordChange}
                                />
                            </div>

                            <Box pt={1}>
                                <Button variant="contained" className="loginBtn" type="submit" onClick={checkLoginCredentials} color="primary">
                                    Submit
                                </Button>
                            </Box>
                            <Box pt={1} pb={2}>
                                <Button
                                    onClick={() => {
                                        navigate("/forgot");
                                    }}
                                    color="primary"
                                >
                                    Forgot Password
                                </Button>
                                <Button
                                    onClick={() => {
                                        navigate("/registerAccount");
                                    }}
                                    color="primary"
                                >
                                    Register
                                </Button>
                            </Box>
                        </MyPaper>
                    </Box>
                    <Box pt={2}>
                        <Typography variant="h6" color="secondary">
                            {message}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={1} sm={2} md={4} lg={4} xl={4} />
            </Grid>
        </>
    );
}
