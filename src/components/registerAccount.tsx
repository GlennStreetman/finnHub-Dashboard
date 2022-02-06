import { useState, useEffect } from "react";

import { useAppDispatch } from "src/hooks";
import { widgetSetup } from "src/App";
import { styled } from "@mui/material/styles";
import { Grid, Paper, Button, TextField, Box, Typography } from "@mui/material/";

import { finnHubQueue } from "./../appFunctions/appImport/throttleQueueAPI";
import { checkPassword } from "../appFunctions/client/checkPassword";
import { forgotLogin } from "../appFunctions/client/forgotLogin";
import { newPW } from "../appFunctions/client/newPW";
import { registerAccount } from "../appFunctions/client/registerAccount";
import { tProcessLogin } from "src/thunks/thunkProcessLogin";
import { useNavigate, useLocation } from "react-router-dom";

interface loginProps {
    queryData: any;
    updateAppState: Object;
    finnHubQueue: finnHubQueue;
}

const passwordIsValid = function (password: string): boolean {
    //Minimum eight characters, at least one letter, one number and one special character:
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password);
};

const useDispatch = useAppDispatch;

const MyPaper = styled(Paper)({ color: "#1d69ab", variant: "outlined", borderRadius: 20, padding: 25 });

export default function Login(p: loginProps) {
    let navigate = useNavigate();
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const [message, setMessage] = useState(""); //message from server
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [emailWarn, setEmailWarn] = useState("");
    const [passwordWarn, setPasswordWarn] = useState("");
    const [passwordWarn2, setPasswordWarn2] = useState("");

    function emailIsValid(email) {
        return /\S+@\S+\.\S+/.test(email);
    }

    function processRegisterAccount(e) {
        e.preventDefault();

        if (emailIsValid(emailAddress) && password === password2 && passwordIsValid(password)) {
            registerAccount(emailAddress, password, password2)
                .then((data) => {
                    if (data.message === "Please review warnings") {
                        setMessage(data.message);
                    } else if (data.status === 200) {
                        console.log("registration succesful!1!!!");
                        navigate(`/login?message=${data.message}`);
                        console.log("showing login menu?");
                    } else {
                        console.log("message set, not 200");
                        setMessage(data.message);
                    }
                })
                .catch(() => {
                    setMessage("No response from server. Check network connection.");
                });
        } else {
            if (!emailIsValid(emailAddress)) setEmailWarn("Email not Valid");
            if (password === password2) setPassword("Passwords do not match");
            if (passwordIsValid(password)) setPasswordWarn2(">7 Characters, 1 upper, 1 special");
        }
    }

    function handeEmailChange(e) {
        setEmailAddress(e.target.value);
    }

    function handlePasswordChange(e) {
        setPassword(e.target.value);
    }

    function handlePasswordChange2(e) {
        setPassword2(e.target.value);
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
                                <Typography>Register New Account</Typography>
                                <TextField
                                    id={"loginEmail"}
                                    type="text"
                                    label="email"
                                    name={"emailField"}
                                    value={emailAddress}
                                    onChange={handeEmailChange}
                                    error={emailWarn !== "" ? true : false}
                                    helperText={emailWarn}
                                />
                                <TextField
                                    id={"loginPassword"}
                                    type="password"
                                    label="password 1"
                                    name="passwordText"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    error={passwordWarn !== "" ? true : false}
                                    helperText={passwordWarn}
                                />
                                <TextField
                                    id={"loginPassword"}
                                    type="password"
                                    label="password 2"
                                    name="passwordText"
                                    value={password2}
                                    onChange={handlePasswordChange2}
                                    error={passwordWarn2 !== "" ? true : false}
                                    helperText={passwordWarn2}
                                />
                            </div>

                            <Box pt={1}>
                                <Button
                                    variant="contained"
                                    // href="#home"
                                    className="loginBtn"
                                    type="submit"
                                    onClick={processRegisterAccount}
                                    color="primary"
                                >
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
