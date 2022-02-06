import { useState, useEffect, useMemo } from "react";

import { useAppDispatch } from "src/hooks";
import { widgetSetup } from "src/App";
import { styled } from "@mui/material/styles";
import { Grid, Paper, Button, TextField, Box, Typography } from "@mui/material/";

import { finnHubQueue } from "./../appFunctions/appImport/throttleQueueAPI";
import { forgotLogin } from "../appFunctions/client/forgotLogin";

import { tProcessLogin } from "src/thunks/thunkProcessLogin";
import { useNavigate, useLocation } from "react-router-dom";

interface loginProps {
    queryData: any;
    updateAppState: Object;
    finnHubQueue: finnHubQueue;
}

const useDispatch = useAppDispatch;
const MyPaper = styled(Paper)({ color: "#1d69ab", variant: "outlined", borderRadius: 20, padding: 25 });

export default function Forgot(p: loginProps) {
    let navigate = useNavigate();
    const dispatch = useDispatch(); //allows widget to run redux actions.
    const [message, setMessage] = useState(""); //message from server
    const [emailAddress, setEmailAddress] = useState("");
    const [warn, setWarn] = useState("");

    function emailIsValid(email) {
        return /\S+@\S+\.\S+/.test(email);
    }

    function resetRequest(e) {
        e.preventDefault();
        if (emailIsValid(emailAddress)) {
            forgotLogin(emailAddress)
                .then((data) => {
                    setMessage(data.message);
                })
                .catch(() => {
                    setMessage("No response from server. Check network connection.");
                });
        } else {
            setWarn("Please enter a valid email.");
        }
    }

    function handeEmailChange(e) {
        setEmailAddress(e.target.value);
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
                                <Typography>Reset Password</Typography>
                                <TextField id={"loginEmail"} type="text" label="email" name={"emailField"} value={emailAddress} onChange={handeEmailChange} />
                            </div>

                            <Box pt={1}>
                                <Button variant="contained" className="loginBtn" type="submit" onClick={resetRequest} color="primary">
                                    Submit
                                </Button>
                            </Box>
                            <Box pt={1} pb={2}>
                                <Button
                                    onClick={() => {
                                        navigate("/login");
                                    }}
                                    color="primary"
                                >
                                    Login
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
