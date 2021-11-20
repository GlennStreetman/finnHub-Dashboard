import React from "react";
import { useState, useEffect } from "react";
import { Redirect } from 'react-router-dom'
import { finnHubQueue } from "./../appFunctions/appImport/throttleQueueAPI";

import { checkPassword } from "../appFunctions/client/checkPassword";
import { forgotLogin } from "../appFunctions/client/forgotLogin";
import { secretQuestion } from "../appFunctions/client/secretQuestion";
import { newPW } from "../appFunctions/client/newPW";
import { checkLoginStatus } from "../appFunctions/client/checkLoginStatus";
import { registerAccount } from "../appFunctions/client/registerAccount";

import { styled } from '@material-ui/core/styles';
import { Grid, Paper, Button, TextField, Box, Typography } from '@material-ui/core/';

interface loginProps {
    queryData: any,
    processLogin: Function,
    updateExchangeList: Function,
    updateAppState: Function,
    finnHubQueue: finnHubQueue,
}

const MyPaper = styled(Paper)({ color: "#1d69ab", variant: "outlined", borderRadius: 20, padding: 25 });

export default function Login(p: loginProps) {

    const [showMenu, setShowMenu] = useState(0); //0 = login, 1 = recover, 2 = register, 3 = secret question, 4 reset password
    const [message, setMessage] = useState(""); //message from server
    const [userName, setUserName] = useState("");
    const [text0, setText0] = useState("");
    const [text1, setText1] = useState("");
    const [text2, setText2] = useState("");
    const [text3, setText3] = useState("");
    const [text4, setText4] = useState("");
    const [text5, setText5] = useState("");
    const [text6, setText6] = useState("");
    const [warn0, setWarn0] = useState("");
    const [warn1, setWarn1] = useState("");
    const [warn2, setWarn2] = useState("");
    const [warn3, setWarn3] = useState("");
    const [warn4, setWarn4] = useState("");
    const [warn5, setWarn5] = useState("");
    const [warn6, setWarn6] = useState("");
    const [base, setBase] = useState(false); //if true, redirect to '/'

    const textLookup = {
        text0: text0,
        text1: text1,
        text2: text2,
        text3: text3,
        text4: text4,
        text5: text5,
        text6: text6,
        warn0: warn0,
        warn1: warn1,
        warn2: warn2,
        warn3: warn3,
        warn4: warn4,
        warn5: warn5,
        warn6: warn6,
    }

    const setTextLookup = {
        text0: setText0,
        text1: setText1,
        text2: setText2,
        text3: setText3,
        text4: setText4,
        text5: setText5,
        text6: setText6,
        warn0: setWarn0,
        warn1: setWarn1,
        warn2: setWarn2,
        warn3: setWarn3,
        warn4: setWarn4,
        warn5: setWarn5,
        warn6: setWarn6,
    }

    useEffect(() => {
        if (p.queryData.reset === '1') {
            const user = p.queryData.users
            fetch(`/findSecret?user=${user}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data) {
                        setShowMenu(3)
                        setText6(data.question)
                        setUserName(data.user)
                    } else {
                        console.log("No response from server")
                    }
                })
                .catch((error) => {
                    console.error("No server response: ", error);
                });
        }
    }, [p]);

    useEffect(() => {
        if (p.queryData.message === '1') {
            setMessage("Thank you for registering. Please login.")
        }
        if (p.queryData.message === '2') {
            setMessage("Problem validating email address.")
        }
        if (p.queryData.message !== '1' && p.queryData.message !== '2' && p.queryData.message) {
            setMessage(p.queryData.message.replaceAll("%", " "))
        }
    })

    useEffect(() => { checkLoginStatus(p.processLogin, p.updateExchangeList, p.finnHubQueue, p.updateAppState) }, [])

    useEffect(() => { if (base === true) setBase(false) })

    function emailIsValid(email) {
        return /\S+@\S+\.\S+/.test(email);
    };

    function handleChange(e) {
        const updater = setTextLookup[e.target.name]
        updater(e.target.value);
    };

    function clearText(showMenuRef) {
        console.log('reseting')
        setText0("")
        setText1("")
        setText2("")
        setText3("")
        setText4("")
        setText5("")
        setText6("")
        setWarn0("")
        setWarn1("")
        setWarn2("")
        setWarn3("")
        setWarn4("")
        setWarn5("")
        setWarn6("")
        setShowMenu(showMenuRef)
        window.history.pushState({ message: "" }, "", "/")
        setMessage("")
        return true

    }

    function handleEnterKeyPress(e, keyFunction) {
        if (e.key === "Enter") {
            keyFunction()
        }
    }

    const submitFunctionLookup = {
        0: () => {
            checkPassword(text0, text1)
                .then((data) => {
                    if (data.status === 200) {
                        setMessage("")
                        p.processLogin(data["key"], data["login"], data['apiAlias'], data['widgetsetup']);
                        p.updateExchangeList(data.exchangelist)
                        p.updateAppState({ defaultExchange: data.defaultexchange })
                        p.finnHubQueue.updateInterval(data['ratelimit'])
                    } else {
                        setMessage(data.message)
                    }
                })
                .catch(() => {
                    setMessage("No response from server. Check network connection.")
                })
        },
        1: () => {
            if (emailIsValid(text0)) {
                forgotLogin(text0)
                    .then((data) => {
                        setMessage(data.message)
                    })
                    .catch(() => {
                        setMessage("No response from server. Check network connection.")
                    })
            } else {
                setWarn0("Please enter a valid email.")
            }
        },
        2: () => {
            registerAccount(text0, text1, text2, text3, text4, text5, emailIsValid)
                .then((data) => {
                    console.log('data', data)
                    if (data.message === 'Please review warnings') {
                        setMessage(data.message)
                        Object.keys(data).forEach((el) => {
                            if (el !== 'message') {
                                const updater = setTextLookup[el]
                                updater(data[el])
                            }
                        })
                    } else if (data.status === 200) {
                        setMessage(data.message)
                        setShowMenu(0)
                        clearText(0)
                    } else {
                        setMessage(data.message)
                    }
                })
                .catch(() => {
                    setMessage("No response from server. Check network connection.")
                })
        },
        3: () => {
            secretQuestion(text0, userName)
                .then((data) => {
                    if (data.message === "correct") {
                        setMessage("")
                        setText0(data["question"])
                        clearText(4)
                    } else {
                        setMessage("Wrong answer, try again.");
                    }
                })
                .catch(() => {
                    setMessage("No response from server. Check network connection.")
                })
        },
        4: () => {
            newPW(text0, text1)
                .then((data) => {
                    console.log("update login response: ", data.message)
                    if (data.message === '' || data.message === true) {
                        setMessage("Password Updated. Please login with your new password")
                        clearText(0)
                        setBase(true)
                    } else {
                        setMessage("Problem updating password. Please restart process.")
                    }
                })
                .catch(() => {
                    setMessage("No response from server. Check network connection.")
                })
        },
    };
    const formSetup = {
        0: {
            title: "Login to FinnDash",
            inputs: ["UserName", "Password"],
            linkNames: ["Forgot Login", "Register"],
            linkFunctions: [() => clearText(1), () => clearText(2)]
        },
        1: {
            title: "Recover login name",
            inputs: ["Enter Email"],
            linkNames: ["Back", "Register"],
            linkFunctions: [() => clearText(0), () => clearText(2)]
        },
        2: {
            title: "Register Finndash Account",
            inputs: ["UserName", "Password", "Re-Enter Password", "Email", "Secret Question", "Secret Answer"],
            linkNames: ["Back", "Forgot Login"],
            linkFunctions: [() => clearText(0), () => clearText(1)]
        },
        3: {
            title: "Answer Secret Question:",
            inputs: [`Recovery Question: ${text6}`],
            linkNames: ["Back", "Register"],
            linkFunctions: [() => clearText(0), () => clearText(2)]
        },
        4: {
            title: "New Password",
            inputs: ["Enter New Password", "Re-Enter Password"],
            linkNames: ["Back", "Register"],
            linkFunctions: [() => clearText(0), () => clearText(2)]
        },
    }

    const thisForm = formSetup[showMenu]
    const renderInputs = thisForm.inputs.map((el, index) =>
        <div key={el + index + showMenu}>
            <div className="login-div" key={el + "div"}>
            </div>
            <div className="login-div" key={el + "div2"}>
                <TextField
                    id={el + "txt"}
                    type={el.indexOf("Password") >= 0 ? "password" : "text"}
                    label={el}
                    name={"text" + index}
                    // value={textLookup[el]}
                    onChange={handleChange}
                    error={textLookup["warn" + index] !== "" ? true : false}
                    helperText={textLookup["warn" + index]}
                />
            </div>
        </div>
    )

    const redirectTag = base === true ? <Redirect to="/?" /> : <></>

    return (<>
        <Grid container onKeyDown={(e) => handleEnterKeyPress(e, submitFunctionLookup[showMenu])}>
            <Grid item xs={1} sm={2} md={4} lg={4} xl={4} />
            {/*
 // @ts-ignore*/}
            <Grid item xs={10} sm={8} md={4} lg={4} xl={4} align="center">
                <Box pt={2}>
                    <MyPaper elevation={6} >
                        <img src="logo.png" alt="logo"></img>
                        {renderInputs}
                        <Box pt={1}>
                            <Button
                                variant="contained"
                                href='#home'
                                className="loginBtn"
                                type="submit"
                                onClick={submitFunctionLookup[showMenu]}
                                color="primary"
                            >
                                Submit
                            </Button>
                        </Box>
                        <Box pt={1} pb={2}>
                            <Button
                                onClick={thisForm.linkFunctions[0]}
                                color="primary"
                            >
                                {thisForm.linkNames[0]}
                            </Button>
                            <Button
                                onClick={thisForm.linkFunctions[1]}
                                color="primary"
                            >
                                {thisForm.linkNames[1]}
                            </Button>
                        </Box>
                    </MyPaper>
                </Box>
                <Box pt={2}>
                    <Typography variant="h6" color="secondary">{message}</Typography>
                </Box>
            </Grid>

            <Grid item xs={1} sm={2} md={4} lg={4} xl={4} />

        </Grid >

        {redirectTag}
    </>
    );

}

